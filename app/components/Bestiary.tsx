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
import { LEAVES, OPEN_MS, SPREAD_RATIO, TURN_MS } from "~/lib/bestiary";
import { createBook, type BookScene } from "./bestiary/bookScene";

type Phase = "shut" | "opening" | "open" | "closing";

export function Bestiary() {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("shut");
  const turnRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<BookScene | null>(null);
  const rafRef = useRef(0);
  const safetyRef = useRef(0);
  const posRef = useRef(0); // насколько книга раскрыта сейчас, 0..1
  const turnRafRef = useRef(0);
  const turnRef2 = useRef(0); // ход текущего листа, 0..1
  const pageRef = useRef(0); // сколько листов уже слева
  const busyRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const after = useCallback((ms: number, fn: () => void): void => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(safetyRef.current);
    },
    [],
  );

  const open = useCallback((): void => {
    if (phase !== "shut") return;
    const instant = prefersReducedMotion();
    setPhase("opening");
    after(instant ? 0 : OPEN_MS, () => setPhase("open"));
  }, [phase, after]);

  const paint = useCallback((): void => {
    sceneRef.current?.draw(posRef.current, turnRef2.current, pageRef.current, LEAVES - pageRef.current);
  }, []);

  /**
   * Листание. Тычок по правой половине разворота гонит лист влево, по левой —
   * возвращает назад. Кнопок нет намеренно: книгу листают, тыкая в неё.
   */
  const flip = useCallback(
    (dir: 1 | -1): void => {
      if (busyRef.current || phase !== "open") return;
      const next = pageRef.current + dir;
      if (next < 0 || next > LEAVES) return;
      if (prefersReducedMotion()) {
        pageRef.current = next;
        paint();
        return;
      }
      busyRef.current = true;
      const t0 = performance.now();
      const step = (now: number): void => {
        const k = Math.min(1, (now - t0) / TURN_MS);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        turnRef2.current = dir > 0 ? e : 1 - e;
        paint();
        if (k < 1) {
          turnRafRef.current = requestAnimationFrame(step);
        } else {
          // Лист доехал — засчитываем его в стопку и обнуляем ход, иначе
          // следующий переворот стартовал бы с середины.
          pageRef.current = next;
          turnRef2.current = 0;
          busyRef.current = false;
          paint();
        }
      };
      if (dir < 0) {
        pageRef.current = next;
        turnRef2.current = 1;
      }
      turnRafRef.current = requestAnimationFrame(step);
    },
    [phase, paint],
  );

  /** Гонит сцену от текущего положения к целевому: 0 — закрыта, 1 — раскрыта. */
  const run = useCallback(
    (to: 0 | 1): void => {
      const scene = sceneRef.current;
      if (!scene) return;
      if (prefersReducedMotion()) {
        posRef.current = to;
        paint();
        return;
      }
      const from = posRef.current;
      if (from === to) return;
      const t0 = performance.now();
      cancelAnimationFrame(rafRef.current);
      const step = (now: number): void => {
        const k = Math.min(1, (now - t0) / OPEN_MS);
        posRef.current = from + (to - from) * k;
        paint();
        if (k < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          // Ход дошёл сам — снимаем свою страховку, чтобы она не сработала
          // потом вхолостую.
          rafRef.current = 0;
          clearTimeout(safetyRef.current);
          safetyRef.current = 0;
        }
      };
      rafRef.current = requestAnimationFrame(step);
      // Страховка: если цикл кадров встанет (в headless WebKit он до конца не
      // доходил), книга иначе замрёт на полпути.
      //
      // Держим её в ОТДЕЛЬНОМ ref и гасим предыдущую. Раньше страховка жила в
      // общем списке таймеров: открыл книгу, быстро закрыл — и таймер от первого
      // хода отменял requestAnimationFrame второго, книга застревала на полпути.
      clearTimeout(safetyRef.current);
      safetyRef.current = window.setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        posRef.current = to;
        paint();
      }, OPEN_MS + 260);
    },
    [paint],
  );

  const close = useCallback((): void => {
    if (phase !== "open" && phase !== "opening") return;
    const instant = prefersReducedMotion();
    setPhase("closing");
    run(0);
    after(instant ? 0 : OPEN_MS, () => {
      setPhase("shut");
      btnRef.current?.focus();
    });
  }, [phase, after, run]);

  // Сцена переворота живёт, пока книга открыта. Текстуры декодируем до создания
  // контекста: WebGL не умеет ждать картинку, недогруженная приедет пустой.
  useEffect(() => {
    if (phase === "shut") return;
    let dead = false;
    const load = (src: string): Promise<HTMLImageElement> =>
      new Promise((ok, no) => {
        const im = new Image();
        im.onload = () => (im.decode ? im.decode().then(() => ok(im), () => ok(im)) : ok(im));
        im.onerror = no;
        im.src = src;
      });
    Promise.all([
      load("/img/bestiary/cover-front.webp"),
      load("/img/bestiary/endpaper.webp"),
      load("/img/bestiary/page-left.webp"),
      load("/img/bestiary/page-right.webp"),
      load("/img/bestiary/spine.webp"),
      load("/img/bestiary/clasp.webp"),
      load("/img/bestiary/strap.webp"),
      load("/img/bestiary/plate.webp"),
    ])
      .then(([coverFront, endpaper, pageLeft, pageRight, spine, clasp, strap, plate]) => {
        const cv = turnRef.current;
        if (dead || !cv) return;
        sceneRef.current = createBook(cv, { coverFront, endpaper, pageLeft, pageRight, spine, clasp, strap, plate });
        paint();
        run(phase === "closing" ? 0 : 1);
      })
      .catch(() => undefined);
    const onResize = (): void => {
      sceneRef.current?.resize();
      paint();
    };
    window.addEventListener("resize", onResize);
    return () => {
      dead = true;
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
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
    if (phase === "opening") dialogRef.current?.focus();
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
                onClick={(e) => {
                  // Половина, по которой ткнули, и задаёт направление —
                  // ровно как листают настоящую книгу.
                  const r = e.currentTarget.getBoundingClientRect();
                  flip(e.clientX - r.left > r.width / 2 ? 1 : -1);
                }}
              />

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
