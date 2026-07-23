// Слой «руки держат контент по бокам» — роторскоп-секвенции из видео автора
// (public/img/hands/{L,R}01..16.webp, чернильная рисовка). Кончик пальца ложится
// на край main с заходом OVER; в покое пальцы качаются по синусоиде (idle-цикл),
// при скролле перебирают; хват сжимается в тишине и ослабевает на скорости.
// Рендер: canvas + transform, слой выключается тумблером панели (bento2:hands).
import { useEffect, useRef } from "react";
import { usePrefs } from "~/lib/prefs";
import { prefersReducedMotion } from "~/lib/media";

const N = 16;
const FRAME_W = 720;
const FRAME_H = 739;


interface HandCfg {
  tipX: number; // кончик среднего пальца в долях плитки (автозамер по маске)
  tipY: number;
  gain: number; // скорость перебора от скролла
  oscC: number; // центр/амплитуда/частота/фаза idle-качания
  oscA: number;
  oscW: number;
  oscP: number;
}

const CFG: [HandCfg, HandCfg] = [
  { tipX: 0.81, tipY: 0.38, gain: 0.017, oscC: 6, oscA: 3, oscW: 0.0019, oscP: 0 },
  { tipX: 0.26, tipY: 0.43, gain: 0.021, oscC: 8.5, oscA: 3.4, oscW: 0.0024, oscP: 2.1 },
];

function pingpong(i: number): number {
  const m = i % (2 * N - 2);
  return m < N ? m : 2 * N - 2 - m;
}

function HandsLayer() {
  const lRef = useRef<HTMLDivElement>(null);
  const rRef = useRef<HTMLDivElement>(null);
  const shLRef = useRef<HTMLDivElement>(null);
  const shRRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const elL = lRef.current;
    const elR = rRef.current;
    const shL = shLRef.current;
    const shR = shRRef.current;
    const main = document.querySelector("main");
    if (!elL || !elR || !shL || !shR || !main) return;
    const cvL = elL.querySelector("canvas");
    const cvR = elR.querySelector("canvas");
    const ctxL = cvL?.getContext("2d");
    const ctxR = cvR?.getContext("2d");
    if (!ctxL || !ctxR) return;

    const els = [elL, elR];
    const shs = [shL, shR];
    const ctxs = [ctxL, ctxR];
    const imgs = [0, 1].map((s) =>
      Array.from({ length: N }, (_, i) => {
        const im = new Image();
        im.src = `/img/hands/${s ? "R" : "L"}${String(i + 1).padStart(2, "0")}.webp`;
        return im;
      }),
    );
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".work"));

    // Никаких чтений layout внутри кадра: базовая геометрия рук кэшируется в
    // layout(), карточки — пачкой в doc-координатах раз в секунду (refreshCards).
    const base = [
      { left: 0, top: 0, w: 0, h: 0 },
      { left: 0, top: 0, w: 0, h: 0 },
    ];
    let cardRects: { l: number; t: number; r: number; b: number }[] = [];

    function refreshCards(): void {
      const sy = window.scrollY;
      cardRects = cards.map((c) => {
        const q = c.getBoundingClientRect();
        return { l: q.left, t: q.top + sy, r: q.right, b: q.bottom + sy };
      });
    }

    // руки держат контент по бокам: кончик на крае main (с учётом его паддинга),
    // но не ближе TIPCLR к краю экрана — пальцы никогда не обрезаются
    function layout(): void {
      if (!main || !elL || !elR) return;
      const rect = main.getBoundingClientRect();
      const cs = getComputedStyle(main);
      const cLeft = rect.left + parseFloat(cs.paddingLeft);
      const cRight = rect.right - parseFloat(cs.paddingRight);
      // на телефоне заход и клиренс меньше — руки не съедают контент
      const over = window.innerWidth < 640 ? 20 : 34;
      const clr = Math.min(190, window.innerWidth * 0.28);
      const wL = elL.offsetWidth;
      const wR = elR.offsetWidth;
      const lL = Math.max(cLeft + over - CFG[0].tipX * wL, clr - CFG[0].tipX * wL);
      const lR = Math.min(
        cRight - over - CFG[1].tipX * wR,
        window.innerWidth - clr - CFG[1].tipX * wR,
      );
      elL.style.left = `${Math.round(lL)}px`;
      elR.style.left = `${Math.round(lR)}px`;
      // offset* не включают transform — это чистая база для арифметики кадра
      base[0] = { left: Math.round(lL), top: elL.offsetTop, w: wL, h: elL.offsetHeight };
      base[1] = { left: Math.round(lR), top: elR.offsetTop, w: wR, h: elR.offsetHeight };
      refreshCards();
    }
    layout();
    window.addEventListener("resize", layout);

    const ph = [0, 7.3]; // рассинхрон плейхедов рук
    const grip = [0, 0];
    const lastIdx = [-1, -1];
    const norm = [false, false];
    const tipYpx = [0, 0];
    let cur = window.scrollY;
    let vel = 0;
    let still = 0;
    let lag = 0;
    let raf = 0;
    let frame = 0;

    function loop(t: number): void {
      // карточки могли перестроиться (фильтр/шрифты) — обновляем пачкой раз в ~1с
      if (++frame % 60 === 0) refreshCards();
      const y = window.scrollY;
      vel += (y - cur - vel) * 0.14;
      cur += (y - cur) * 0.1;
      const speed = Math.abs(vel);
      still = speed < 2 ? still + 1 : 0;
      // страница «проскальзывает» в хвате: руки тянутся за скроллом и возвращаются
      lag += (Math.max(-30, Math.min(30, vel * 0.5)) - lag) * 0.09;

      for (let s = 0; s < 2; s++) {
        const cfg = CFG[s];
        let idx: number;
        if (still > 4) {
          // покой: игровой idle — качание по синусоиде с замедлением на краях
          if (!norm[s]) {
            let m = ph[s] % (2 * N - 2);
            if (m < 0) m += 2 * N - 2;
            if (m > N - 1) m = 2 * N - 2 - m;
            ph[s] = m;
            norm[s] = true;
          }
          const target = cfg.oscC + cfg.oscA * Math.sin(t * cfg.oscW + cfg.oscP);
          const d = (target - ph[s]) * 0.12;
          ph[s] += Math.max(-0.16, Math.min(0.16, d));
          idx = Math.max(0, Math.min(N - 1, Math.round(ph[s])));
        } else {
          // скролл: перебирают вперёд, скорость ограничена
          norm[s] = false;
          ph[s] += Math.min(0.24, speed * cfg.gain);
          idx = pingpong(Math.floor(ph[s]));
        }
        const im = imgs[s][idx];
        if (idx !== lastIdx[s] && im.complete && im.naturalWidth > 0) {
          ctxs[s].clearRect(0, 0, FRAME_W, FRAME_H);
          ctxs[s].drawImage(im, 0, 0);
          lastIdx[s] = idx;
        }
        // хват: тишина — сжимают (вглубь), скролл — ослабляют (к краю)
        const wantGrip = still > 50 ? 1 : speed > 6 ? -1 : 0;
        grip[s] += (wantGrip - grip[s]) * (s ? 0.05 : 0.04);
        const inX = (grip[s] > 0 ? grip[s] * 12 : grip[s] * 26) * (s ? -1 : 1);
        const bob =
          Math.sin(t * 0.0011 + s * 2.1) * 3 + Math.sin(t * 0.0003 + s) * 2;
        const rot =
          (s ? -2 : 2) +
          Math.sin(t * 0.0009 + s * 1.7) * 1.1 +
          grip[s] * (s ? -1.5 : 1.5);
        els[s].style.transform = `translate3d(${inX}px,${-lag + bob}px,0) rotate(${rot}deg)`;
        // контактная тень — только когда палец над карточкой; позиция кончика
        // считается арифметикой из кэша (ноль чтений layout в кадре)
        const bs = base[s];
        const tx = bs.left + inX + bs.w * cfg.tipX;
        const ty = bs.top + (bob - lag) + bs.h * cfg.tipY;
        const g = Math.max(0, grip[s]);
        const tyDoc = ty + y;
        const overCard = cardRects.some(
          (q) => tx > q.l && tx < q.r && tyDoc > q.t && tyDoc < q.b,
        );
        shs[s].style.transform = `translate3d(${tx}px,${ty + 16}px,0)`;
        shs[s].style.opacity = overCard ? (g * 0.8).toFixed(2) : "0";
        tipYpx[s] = ty;
      }
      raf = requestAnimationFrame(loop);
    }

    // старт после декода первого кадра каждой руки; если кадры не загрузились
    // за ~16с — сдаёмся, а не крутим таймер вечно
    let bootTicks = 0;
    const boot = window.setInterval(() => {
      if (imgs[0][0].complete && imgs[1][0].complete) {
        window.clearInterval(boot);
        raf = requestAnimationFrame(loop);
      } else if (++bootTicks > 400) {
        window.clearInterval(boot);
      }
    }, 40);

    return () => {
      window.clearInterval(boot);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return (
    <>
      <div className="hands-layer" aria-hidden="true">
        <div className="hgrip hgrip--l" ref={lRef}>
          <canvas width={FRAME_W} height={FRAME_H} />
        </div>
        <div className="hgrip hgrip--r" ref={rRef}>
          <canvas width={FRAME_W} height={FRAME_H} />
        </div>
      </div>
      <div className="hgrip-sh" ref={shLRef} aria-hidden="true" />
      <div className="hgrip-sh" ref={shRRef} aria-hidden="true" />
    </>
  );
}

export function Hands() {
  const { handsOn } = usePrefs();
  return handsOn ? <HandsLayer /> : null;
}
