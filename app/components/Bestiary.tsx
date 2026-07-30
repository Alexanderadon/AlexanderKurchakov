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

type Phase = "shut" | "opening" | "open" | "closing";

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

  const open = useCallback((): void => {
    if (phase !== "shut") return;
    const instant = prefersReducedMotion();
    setPhase("opening");
    after(instant ? 0 : OPEN_MS, () => setPhase("open"));
  }, [phase, after]);

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
    if (phase !== "open" && phase !== "opening") return;
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
      load("/img/bestiary/strap.webp"),
      load("/img/bestiary/plate.webp"),
    ])
      .then(async ([coverFront, endpaper, pageLeft, pageRight, spine, strap, plate]) => {
        // Динамический импорт: three уезжает в свой чанк и грузится только при
        // открытии книги. Первый экран от библиотеки не потяжелел ни на байт —
        // это было главное возражение против неё, и оно снято технически.
        const { createBook } = await import("./bestiary/threeBook");
        const cv = turnRef.current;
        if (dead || !cv) return;
        sceneRef.current = createBook(cv, { coverFront, endpaper, pageLeft, pageRight, spine, strap, plate });
        sceneRef.current?.target(phase === "closing" ? 0 : 1, pageRef.current);
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
