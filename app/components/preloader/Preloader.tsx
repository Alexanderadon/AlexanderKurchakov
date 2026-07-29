// Прелоадер: тьма, собор и глаз, пока грузится первый экран.
//
// Как это устроено «по-взрослому», а не как таймер на четыре секунды:
//  • Показ решается ДО первой отрисовки — инлайновым скриптом в <head>, который
//    ставит data-preload на <html>. CSS по этому атрибуту прячет контент, поэтому
//    страница не успевает мигнуть. У скрипта есть предохранитель: через 8 секунд
//    атрибут снимается сам, чтобы упавший JS не оставил сайт невидимым навсегда.
//  • Прогресс тянется за РЕАЛЬНОЙ загрузкой (шрифты, текстуры, постер героя),
//    с полом 1.1 с (мигнувший прелоадер хуже отсутствующего) и потолком 4.2 с
//    (зависшая загрузка не должна вешать сайт).
//  • Один раз за сессию: на второй странице и после возврата назад не мешает.
//  • Уважает prefers-reduced-motion и Save-Data — там его просто нет.
//  • Доступность: role="progressbar" с реальным aria-valuenow, контент под ним
//    скрыт visibility:hidden, то есть недостижим ни фокусом, ни скринридером.
import { useEffect, useRef, useState } from "react";
import { createEye, type Eye } from "./eye";
import { bufferDpr, eyeMetrics, isNarrow } from "./geometry";
import { DEFAULT_TIMING, initialCounter, smoothstep, progressTarget, stepCounter } from "./progress";
import { Readiness, decodeImage, whenFontsReady } from "./readiness";
import { createScene, type SceneImages } from "./scene";
import { stageAt, type Viewport } from "./words";
import { roman } from "./roman";

const SESSION_KEY = "kur:preloaded";
/** Разлив света в конце, мс. */
const FINALE_MS = 900;
/** Плавное исчезновение оверлея, мс. Должно совпасть с transition в CSS. */
const FADE_MS = 600;
/**
 * Жёсткий предел жизни оверлея, мс. Считать завершение только по кадрам нельзя:
 * во вкладке, открытой в фоне, requestAnimationFrame не вызывается вообще —
 * прелоадер досчитывал бы вечно и остался бы лежать поверх сайта, перехватывая
 * клики. Атрибут-гейт при этом снимал бы предохранитель в BOOT, так что сайт
 * был бы виден, но некликабелен. Таймер работает независимо от кадров.
 */
const HARD_BAIL_MS = 6500;
// Образцы обязательны: без них грузится только латинский срез, и кириллица
// в переводах отрисовалась бы подставным шрифтом.
const FONTS = [
  { font: '600 16px "Cinzel"', text: "TENEBRAE 100" },
  { font: '16px "Old Standard TT"', text: "НЕ ОБОРАЧИВАЙСЯ" },
  { font: 'italic 16px "Old Standard TT"', text: "тьма бездна" },
];

export function Preloader() {
  const [live, setLive] = useState(false);
  const [fading, setFading] = useState(false);
  const finishedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const eyeRef = useRef<HTMLCanvasElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const rnRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);

  // Первый клиентский рендер обязан совпасть с пререндером (null), поэтому
  // включаемся вторым проходом. Контент всё это время уже скрыт через CSS.
  useEffect(() => {
    if (document.documentElement.hasAttribute("data-preload")) setLive(true);
    else finish();
  }, []);

  useEffect(() => {
    if (!live) return;
    const glCanvas = glRef.current;
    const eyeCanvas = eyeRef.current;
    if (!glCanvas || !eyeCanvas) return;

    const scene = createScene(glCanvas);
    const eye: Eye | null = createEye(eyeCanvas);
    // Нет WebGL — не мучаем: сразу отдаём страницу.
    if (!scene) {
      finish();
      return;
    }

    const ready = new Readiness();
    const images: Partial<SceneImages> = {};
    let disposed = false;

    let vp: Viewport = { w: innerWidth, h: innerHeight, narrow: isNarrow(innerWidth, innerHeight) };
    const relayout = (): void => {
      vp = { w: innerWidth, h: innerHeight, narrow: isNarrow(innerWidth, innerHeight) };
      scene.layout(vp, bufferDpr(vp.w, vp.h, devicePixelRatio));
      scene.paint(vp, images);
      eye?.layout(eyeMetrics(vp), Math.min(2, devicePixelRatio || 1));
    };
    relayout();

    whenFontsReady(document, FONTS).then(() => {
      if (disposed) return;
      ready.mark("fonts");
      scene.paint(vp, images); // шрифт приехал — перепекаем слой слов
    });
    decodeImage("/img/cathedral.webp").then(
      (img) => {
        if (disposed) return;
        images.cathedral = img;
        ready.mark("cathedral");
        scene.paint(vp, images);
      },
      () => ready.mark("cathedral"),
    );
    decodeImage("/img/paper.webp").then(
      (img) => {
        if (disposed) return;
        images.paper = img;
        ready.mark("paper");
        scene.paint(vp, images);
      },
      () => ready.mark("paper"),
    );
    decodeImage("/video/hero-poster.jpg").then(
      () => ready.mark("hero"),
      () => ready.mark("hero"),
    );

    // ── факел
    let mx = vp.w * 0.5;
    let my = vp.h * 0.66;
    let tmx = mx;
    let tmy = my;
    let pointerAt = -1e9;
    let pointerSeen = false;
    const touch = matchMedia("(hover: none)").matches;
    const onMove = (x: number, y: number): void => {
      tmx = x;
      tmy = y;
      pointerAt = performance.now();
      pointerSeen = true;
    };
    const onMouse = (e: MouseEvent): void => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent): void => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    addEventListener("mousemove", onMouse, { passive: true });
    addEventListener("touchstart", onTouch, { passive: true });
    addEventListener("touchmove", onTouch, { passive: true });
    addEventListener("resize", relayout);

    // Ушли в другую вкладку — показывать заставку по возвращении бессмысленно,
    // да и кадры там всё равно не идут. Отдаём страницу сразу.
    const onHidden = (): void => {
      if (document.hidden) finish();
    };
    document.addEventListener("visibilitychange", onHidden);
    const bail = window.setTimeout(finish, HARD_BAIL_MS);

    let counter = initialCounter();
    let done = 0;
    let shown = -1;
    let startT = 0;
    let prevT = 0;
    let parX = 0;
    let parY = 0;
    let lastTx = 1e9;
    let lastTy = 1e9;
    let raf = 0;
    let ending = 0;

    const loop = (now: number): void => {
      raf = requestAnimationFrame(loop);
      if (!startT) {
        startT = now;
        prevT = now;
      }
      const dt = Math.min(100, Math.max(0, now - prevT));
      prevT = now;

      // пока мышью не двигали (и на тач-экране в простое) факел плывёт сам,
      // иначе на телефоне страница мёртвая
      if (!pointerSeen || (touch && now - pointerAt > 2600)) {
        const s = now / 1000;
        tmx = vp.w * (0.5 + Math.sin(s * 0.21) * (vp.narrow ? 0.34 : 0.3));
        tmy = vp.h * (vp.narrow ? 0.6 + Math.sin(s * 0.13 + 1.7) * 0.3 : 0.55 + Math.sin(s * 0.13 + 1.7) * 0.22);
      }
      mx += (tmx - mx) * 0.16;
      my += (tmy - my) * 0.16;

      // у параллакса своя, более вязкая инерция — тогда слои «весят»
      const amt = Math.min(vp.w, vp.h) * 0.022;
      parX += ((mx / vp.w - 0.5) * -2 * amt - parX) * 0.05;
      parY += ((my / vp.h - 0.5) * -2 * amt - parY) * 0.05;

      const ez = smoothstep(done);
      scene.render({ mx, my, parX, parY, time: now / 1000, done: ez });

      const tx = parX * 0.34;
      const ty = parY * 0.34;
      if (Math.abs(tx - lastTx) > 0.05 || Math.abs(ty - lastTy) > 0.05) {
        lastTx = tx;
        lastTy = ty;
        if (eyeCanvas) eyeCanvas.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)`;
      }
      eye?.draw(now, tmx, tmy);
      ready.mark("frame");

      if (counter.pct < 100) {
        const target = progressTarget(now - startT, ready.ratio, DEFAULT_TIMING);
        counter = stepCounter(counter, target, dt);
      } else if (done < 1) {
        done = Math.min(1, done + dt / FINALE_MS);
      } else if (!ending) {
        ending = 1;
        finish();
      }

      const iv = Math.floor(counter.pct);
      if (iv !== shown) {
        shown = iv;
        if (numRef.current) numRef.current.textContent = String(iv);
        if (rnRef.current) rnRef.current.textContent = roman(iv);
        if (barRef.current) barRef.current.style.width = `${iv}%`;
        if (rootRef.current) rootRef.current.setAttribute("aria-valuenow", String(iv));
        const st = stageAt(iv);
        if (capRef.current) capRef.current.innerHTML = "";
        if (capRef.current) {
          const b = document.createElement("b");
          b.textContent = st[1];
          capRef.current.append(b, ` · ${st[2]}`);
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(bail);
      removeEventListener("mousemove", onMouse);
      removeEventListener("touchstart", onTouch);
      removeEventListener("touchmove", onTouch);
      removeEventListener("resize", relayout);
      document.removeEventListener("visibilitychange", onHidden);
      scene.dispose();
    };
  }, [live]);

  // Идемпотентно: зовётся и из цикла, и из таймера-предохранителя, и при уходе
  // вкладки в фон — гонка между ними не должна ничего ломать.
  function finish(): void {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* приватный режим — переживём */
    }
    document.documentElement.removeAttribute("data-preload");
    setFading(true);
    window.setTimeout(() => setLive(false), FADE_MS);
  }

  if (!live) return null;

  return (
    <div
      ref={rootRef}
      className="preload"
      data-fade={fading ? "" : undefined}
      role="progressbar"
      aria-label="Загрузка сайта"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <canvas className="preload-gl" ref={glRef} aria-hidden="true" />
      <canvas className="preload-eye" ref={eyeRef} aria-hidden="true" />
      <p className="preload-top">
        LUX IN TENEBRIS LUCET
        <s>и свет во тьме светит</s>
      </p>
      <div className="preload-hud">
        <div className="preload-num">
          <span ref={numRef}>0</span>
          <i>%</i>
        </div>
        <div className="preload-rn">
          <span ref={rnRef}>·</span>
        </div>
        <div className="preload-bar">
          <u ref={barRef} />
        </div>
        <p className="preload-cap" ref={capRef}>
          <b>tenebrae</b> · тьма
        </p>
      </div>
    </div>
  );
}
