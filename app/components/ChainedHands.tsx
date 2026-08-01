// Скованные руки у подножия страницы.
//
// Три коротких петли, снятые с живой натуры (пользовательское видео, перевёрнуто
// кистями вниз) и переведённые в язык остальных рук сайта: жирный белый контур
// силуэта плюс тонкая гравировка звеньев. Кадры лежат последовательностями webp
// с альфой — как у рук первого экрана, никакого 3D: узнику за сценой хватает
// плоти из двадцати кадров.
//
// Петли НЕ зациклены в исходнике (живая съёмка не возвращается в исходную позу),
// поэтому играются маятником: вперёд-назад. Между петлями — короткое затухание
// и смена, порядок случайный без повтора подряд: узник то сцепляет ладони, то
// тянет цепь, то перехватывает — и никогда не крутит одно и то же дважды.
import { useEffect, useRef, useState } from "react";
import { useRafLoop } from "~/hooks/useRafLoop";
import { prefersReducedMotion } from "~/lib/media";

const LOOPS = ["a", "b", "c"] as const;
const FRAMES = 20;
const FPS = 8;
/** Кадры смены петли: затухание вниз и подъём новой. */
const FADE_STEPS = 5;
/** Полных проходов маятника до смены петли. */
const CYCLES_PER_LOOP = 2;

const src = (loop: string, i: number): string =>
  `/img/chains/${loop}/f${String(i + 1).padStart(2, "0")}.webp`;

export function ChainedHands() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);
  /** Подножие реально в кадре — узник поднимается из-за кромки. */
  const [shown, setShown] = useState(false);
  // Кадры грузятся лениво, когда подножие страницы подходит к экрану: 60 webp
  // на 736 КБ незачем тянуть тому, кто не долистал.
  const frames = useRef<HTMLImageElement[][]>([]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "700px" },
    );
    io.observe(el);
    const rise = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.intersectionRatio > 0.22)) {
          setShown(true);
          rise.disconnect();
        }
      },
      { threshold: [0, 0.25, 0.5] },
    );
    rise.observe(el);
    return () => {
      io.disconnect();
      rise.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!near) return;
    frames.current = LOOPS.map((loop) =>
      Array.from({ length: FRAMES }, (_, i) => {
        const im = new Image();
        im.src = src(loop, i);
        return im;
      }),
    );
  }, [near]);

  // Состояние проигрывателя живёт в ref: цикл кадров не должен перерисовывать
  // React. dir — направление маятника, fade — счётчик кадров смены петли.
  const play = useRef({ loop: 0, i: 0, dir: 1, cycles: 0, fade: 0, nextLoop: 0 });

  useRafLoop(
    () => {
      const cv = canvasRef.current;
      const seq = frames.current[play.current.loop];
      if (!cv || !seq) return;
      const g = cv.getContext("2d");
      if (!g) return;
      const p = play.current;
      const img = seq[p.i];
      if (!img || !img.complete || !img.naturalWidth) return;

      if (cv.width !== img.naturalWidth) {
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
      }
      g.clearRect(0, 0, cv.width, cv.height);
      // На смене петли старая тонет, новая всплывает — без чёрного кадра.
      if (p.fade > 0) {
        const t = p.fade / FADE_STEPS;
        const nseq = frames.current[p.nextLoop];
        const nimg = nseq?.[0];
        g.globalAlpha = t;
        g.drawImage(img, 0, 0);
        if (nimg?.complete && nimg.naturalWidth) {
          g.globalAlpha = 1 - t;
          g.drawImage(nimg, 0, 0);
        }
        g.globalAlpha = 1;
        p.fade--;
        if (p.fade === 0) {
          p.loop = p.nextLoop;
          p.i = 0;
          p.dir = 1;
          p.cycles = 0;
        }
        return;
      }
      g.drawImage(img, 0, 0);

      // Маятник: у краёв разворачиваемся; полный цикл = вернулись в ноль.
      p.i += p.dir;
      if (p.i >= FRAMES - 1) {
        p.i = FRAMES - 1;
        p.dir = -1;
      } else if (p.i <= 0) {
        p.i = 0;
        p.dir = 1;
        p.cycles++;
        if (p.cycles >= CYCLES_PER_LOOP) {
          // Следующая петля — любая другая: узник не повторяется.
          const others = [0, 1, 2].filter((n) => n !== p.loop);
          p.nextLoop = others[(Math.random() * others.length) | 0];
          p.fade = FADE_STEPS;
        }
      }
    },
    { fps: FPS, watch: wrapRef, enabled: near && !prefersReducedMotion() },
  );

  return (
    <div ref={wrapRef} className="chains-stage" data-in={shown ? "" : undefined} aria-hidden="true">
      <canvas ref={canvasRef} className="chains-cv" />
    </div>
  );
}
