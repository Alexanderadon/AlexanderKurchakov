// Бестиарий: книга лежит в плитке, по клику раскрывается в разворот, страницы
// переворачиваются. Пока пустой том — содержимое страниц и механика призыва
// приедут отдельно.
//
// Почему модалка рендерится порталом в body, а не внутри плитки: у .tile стоит
// overflow:hidden (обрезал бы крышку, вылетающую из плоскости), а .tile:hover
// ставит свой transform — он создаёт новый контекст наложения и схлопнул бы
// весь 3D в плоскость. Портал выносит сцену из-под обоих.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "~/lib/i18n";
import { prefersReducedMotion } from "~/lib/media";
import { LEAVES, OPEN_MS, SPREAD_RATIO } from "~/lib/bestiary";
import type { BookScene } from "./bestiary/threeBook";

/** peek — книга в модалке, но ещё закрыта: её можно рассмотреть и покрутить. */
type Phase = "shut" | "peek" | "opening" | "open" | "closing";

const ASSETS = [
  "/img/bestiary/cover-front.webp",
  "/img/bestiary/endpaper.webp",
  "/img/bestiary/page-left.webp",
  "/img/bestiary/page-right.webp",
  "/img/bestiary/spine.webp",
  "/img/bestiary/strap.webp",
  "/img/bestiary/plate.webp",
  "/img/bestiary/normal-cover.webp",
  "/img/bestiary/normal-page.webp",
  "/img/bestiary/normal-plate.webp",
  "/img/bestiary/foredge.webp",
  "/img/bestiary/foredge-normal.webp",
  "/img/bestiary/headband.webp",
  "/img/bestiary/strap-normal.webp",
  "/img/bestiary/catch.webp",
  "/img/bestiary/catch-normal.webp",
] as const;

function decode(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().then(() => ok(im), () => ok(im)) : ok(im));
    im.onerror = no;
    im.src = src;
  });
}

type Warm = { images: HTMLImageElement[]; make: typeof import("./bestiary/threeBook").createBook };

/**
 * Прогрев. Чанк three (131 КБ) и семь текстур тянутся ОДИН раз на модуль и
 * заранее — как только плитка подошла к экрану. Без этого по клику начиналась
 * загрузка с нуля, и пользователь секунд пять смотрел в пустой холст: открытие
 * книги обязано быть щелчком, другого варианта нет.
 */
let warming: Promise<Warm> | null = null;
function warm(): Promise<Warm> {
  if (!warming) {
    warming = Promise.all([
      Promise.all(ASSETS.map(decode)),
      import("./bestiary/threeBook"),
    ]).then(([images, mod]) => ({ images, make: mod.createBook }));
  }
  return warming;
}

export function Bestiary() {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("shut");
  const turnRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BookScene | null>(null);
  const pageRef = useRef(0); // сколько листов уже слева
  const btnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const after = useCallback((ms: number, fn: () => void): void => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  // Прогрев по приближению плитки к экрану: к моменту клика чанк и текстуры уже
  // в памяти. Запас 600 px — пользователь ещё скроллит, а книга уже готова.
  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      void warm();
      return;
    }
    const io = new IntersectionObserver(
      (ent) => {
        if (ent.some((e) => e.isIntersecting)) {
          void warm();
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const open = useCallback((): void => {
    if (phase !== "shut") return;
    // Ведём в ОСМОТР, а не сразу в раскрытие: том сначала дают рассмотреть.
    // При выключенных анимациях осматривать нечего — открываем сразу.
    if (prefersReducedMotion()) {
      setPhase("open");
      return;
    }
    setPhase("peek");
  }, [phase]);

  /** Ставим ЦЕЛЬ сцене — она доедет сама в своём цикле кадров. */
  const aim = useCallback((open: 0 | 1): void => {
    sceneRef.current?.target(open, pageRef.current);
  }, []);

  /**
   * Листание. Тычок по правой половине разворота гонит лист влево, по левой —
   * возвращает назад. Кнопок нет намеренно: книгу листают, тыкая в неё.
   *
   * Своей анимации здесь больше нет. Раньше компонент сам гнал requestAnimationFrame
   * и перерисовывал сцену по событиям — интервалы выходили неровными, и каждое
   * листание давало рывок. Теперь он только сообщает, куда ехать.
   */
  const flip = useCallback(
    (dir: 1 | -1): void => {
      const sc = sceneRef.current;
      if (!sc || phase !== "open" || sc.state.busy) return;
      const next = pageRef.current + dir;
      if (next < 0 || next > LEAVES) return;
      pageRef.current = next;
      sc.target(1, next);
    },
    [phase],
  );


  const close = useCallback((): void => {
    if (phase === "shut" || phase === "closing") return;
    const instant = prefersReducedMotion();
    setPhase("closing");
    aim(0);
    after(instant ? 0 : OPEN_MS, () => {
      setPhase("shut");
      btnRef.current?.focus();
    });
  }, [phase, after, aim]);

  // Сцена переворота живёт, пока книга открыта. Текстуры декодируем до создания
  // контекста: WebGL не умеет ждать картинку, недогруженная приедет пустой.
  useEffect(() => {
    if (phase === "shut") return;
    let dead = false;
    warm()
      .then(({ images, make }) => {
        const cv = turnRef.current;
        if (dead || !cv) return;
        const [coverFront, endpaper, pageLeft, pageRight, spine, strap, plate, nCover, nPage, nPlate,
          foredge, nForedge, headband, nStrap, catchPlate, nCatch] = images;
        sceneRef.current = make(cv, { coverFront, endpaper, pageLeft, pageRight, spine, strap, plate, nCover, nPage, nPlate,
          foredge, nForedge, headband, nStrap, catchPlate, nCatch });
        // Раскрываем НЕ сразу: книга ждёт закрытой, её можно покрутить. Открывает
        // следующий клик — иначе рассмотреть том не успеваешь.
        sceneRef.current?.target(phase === "open" ? 1 : 0, pageRef.current);
      })
      .catch(() => undefined);
    const onResize = (): void => {
      sceneRef.current?.resize();
    };
    window.addEventListener("resize", onResize);
    return () => {
      dead = true;
      window.removeEventListener("resize", onResize);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [phase === "shut"]);

  // Клавиатура: Escape закрывает, стрелки листают. Вешаем на документ, пока
  // открыто, — фокус может быть на любом элементе внутри диалога.
  useEffect(() => {
    if (phase === "shut") return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        flip(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        flip(-1);
      } else if (e.key === "Tab") {
        // Ловушка фокуса. Без неё Tab из диалога уходит на фон: экранный
        // читатель и клавиатура оказываются на странице, которая логически
        // закрыта модалкой, а вернуться обратно нечем.
        const box = dialogRef.current?.parentElement;
        if (!box) return;
        const items = Array.from(
          box.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (!items.length) {
          e.preventDefault();
          dialogRef.current?.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const cur = document.activeElement;
        if (e.shiftKey && (cur === first || cur === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && cur === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, close, flip]);

  // Фокус уводим в диалог, чтобы Escape и стрелки работали сразу, без клика.
  useEffect(() => {
    if (phase === "peek" || phase === "opening") dialogRef.current?.focus();
  }, [phase]);

  // Фон не должен прокручиваться под открытой книгой.
  useEffect(() => {
    if (phase === "shut") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Указатель: перетаскивание крутит книгу, клик без сдвига действует. Порог в
  // шесть пикселей — палец на телефоне никогда не стоит идеально ровно, и без
  // порога каждое касание считалось бы протяжкой.
  const drag = useRef({ on: false, moved: 0, x: 0, y: 0, t: 0, vx: 0, vy: 0 });

  const onDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>): void => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { on: true, moved: 0, x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 };
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>): void => {
    const d = drag.current;
    if (!d.on) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const dt = Math.max(1, performance.now() - d.t);
    d.moved += Math.abs(dx) + Math.abs(dy);
    d.vx = (dx / dt) * 1000;
    d.vy = (dy / dt) * 1000;
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = performance.now();
    sceneRef.current?.orbit(dx, dy);
  }, []);

  const onUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): void => {
      const d = drag.current;
      d.on = false;
      if (d.moved > 6) {
        sceneRef.current?.release(d.vx, d.vy);
        return;
      }
      const sc = sceneRef.current;
      if (!sc) return;
      // Клик по закрытой книге раскрывает её, по раскрытой — листает половиной,
      // в которую ткнули.
      if (sc.state.open < 0.02) {
        setPhase("opening");
        sc.target(1, pageRef.current);
        after(OPEN_MS, () => setPhase("open"));
        return;
      }
      const r = e.currentTarget.getBoundingClientRect();
      flip(e.clientX - r.left > r.width / 2 ? 1 : -1);
    },
    [after, flip],
  );

  const live = phase !== "shut";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="bshut"
        aria-expanded={live}
        aria-label={t.hero.bestiaryOpen}
        onClick={open}
      >
        <img
          className="bcover"
          src="/img/bestiary/cover.webp"
          alt={t.hero.bestiary}
          loading="lazy"
          decoding="async"
        />
      </button>

      {live &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={`bmodal bmodal--${phase}`} onClick={close}>
            <div
              ref={dialogRef}
              className="bstage"
              role="dialog"
              aria-modal="true"
              aria-label={t.hero.bestiary}
              tabIndex={-1}
              style={{ "--spread-ratio": String(SPREAD_RATIO) } as React.CSSProperties}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Книга целиком — сцена в WebGL: крышка на петле у корешка, блок
                  страниц с толщиной, форзац на изнанке крышки, камера с
                  перспективой. Прежний вариант был перебросом карточки: крышка
                  уходила ребром, и в этот кадр её подменял плоский разворот. */}
              <canvas
                ref={turnRef}
                className="bbook"
                role="img"
                aria-label={t.hero.bestiarySpread}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={() => {
                  drag.current.on = false;
                }}
              />

              {phase === "peek" && <p className="bhint">{t.hero.bestiaryHint}</p>}
            </div>

            {/* Кнопки живут вне .bstage: внутри preserve-3d-сцены WebKit
                непредсказуемо считает попадание курсора, и «перевернуть»
                оказывалась некликабельной. Здесь они привязаны к окну, а не к
                книге, — значит достижимы на любом экране. */}
            <button type="button" className="bclose" onClick={close} aria-label={t.hero.bestiaryClose}>
              ✕
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
