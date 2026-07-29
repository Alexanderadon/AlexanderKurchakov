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
import { OPEN_MS, PAGE, SPREAD_RATIO, TURN_MS } from "~/lib/bestiary";
import { createTurn, type TurnScene } from "./bestiary/pageTurn";

type Phase = "shut" | "opening" | "open" | "closing";

export function Bestiary() {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("shut");
  // turned — где лист лежит СЕЙЧАС, а не «идёт ли анимация». Раньше состояние
  // сбрасывалось по таймеру, класс снимался, и лист уезжал обратно: страница
  // переворачивалась и тут же возвращалась. lock только гасит кнопку на время хода.
  const [turned, setTurned] = useState(false);
  const [lock, setLock] = useState(false);
  const turnRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<TurnScene | null>(null);
  const rafRef = useRef(0);
  const posRef = useRef(0); // где лист лежит сейчас, 0..1
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

  const close = useCallback((): void => {
    if (phase !== "open" && phase !== "opening") return;
    const instant = prefersReducedMotion();
    setPhase("closing");
    setTurned(false);
    setLock(false);
    posRef.current = 0;
    sceneRef.current?.draw(0);
    after(instant ? 0 : OPEN_MS, () => {
      setPhase("shut");
      btnRef.current?.focus();
    });
  }, [phase, after]);

  const turn = useCallback((): void => {
    if (lock || phase !== "open") return;
    const to = posRef.current > 0.5 ? 0 : 1;
    setTurned(to === 1);

    const scene = sceneRef.current;
    if (!scene) return;
    if (prefersReducedMotion()) {
      posRef.current = to;
      scene.draw(to);
      return;
    }

    setLock(true);
    const from = posRef.current;
    const t0 = performance.now();
    cancelAnimationFrame(rafRef.current);
    const step = (now: number): void => {
      const k = Math.min(1, (now - t0) / TURN_MS);
      // Разгон и торможение: страницу подхватывают и кладут, а не дёргают.
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      posRef.current = from + (to - from) * e;
      scene.draw(posRef.current);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
      else setLock(false);
    };
    rafRef.current = requestAnimationFrame(step);
    // Страховка: если цикл кадров встанет (в headless WebKit он до конца не
    // доходил), кнопка иначе останется заблокированной навсегда, и книгу больше
    // не полистать. Лист доводим до конечного положения руками.
    after(TURN_MS + 260, () => {
      if (posRef.current !== to) {
        posRef.current = to;
        sceneRef.current?.draw(to);
      }
      cancelAnimationFrame(rafRef.current);
      setLock(false);
    });
  }, [lock, phase, after]);

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
    Promise.all([load("/img/bestiary/page-right.webp"), load("/img/bestiary/page-left.webp")])
      .then(([front, back]) => {
        const cv = turnRef.current;
        if (dead || !cv) return;
        sceneRef.current = createTurn(cv, { front, back, rect: PAGE });
        sceneRef.current?.draw(posRef.current);
      })
      .catch(() => undefined);
    const onResize = (): void => {
      sceneRef.current?.resize();
      sceneRef.current?.draw(posRef.current);
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
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        if (e.target === dialogRef.current) {
          e.preventDefault();
          turn();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, close, turn]);

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
              {/* Крышка уходит ребром: на −90° её ширина равна нулю, и подмена
                  альбомной обложки на книжный разворот происходит там, где
                  смотреть не на что. */}
              <img className="bface bface--cover" src="/img/bestiary/cover.webp" alt="" aria-hidden="true" />
              <div className="bface bface--spread">
                <img className="bspread" src="/img/bestiary/spread.webp" alt="" aria-hidden="true" />
                {/* Лист рисуется сеткой в WebGL, а не поворотом DOM-элемента:
                    CSS умеет только жёсткий поворот плоскости, и лист читался
                    картонкой на петле. Здесь бумага гнётся, а свет считается
                    из нормали каждый кадр. */}
                <canvas ref={turnRef} className="bturn" aria-hidden="true" />
              </div>

            </div>

            {/* Кнопки живут вне .bstage: внутри preserve-3d-сцены WebKit
                непредсказуемо считает попадание курсора, и «перевернуть»
                оказывалась некликабельной. Здесь они привязаны к окну, а не к
                книге, — значит достижимы на любом экране. */}
            <button
              type="button"
              className="bnext"
              disabled={lock}
              onClick={(e) => {
                e.stopPropagation();
                turn();
              }}
            >
              {t.hero.bestiaryTurn}
            </button>
            <button type="button" className="bclose" onClick={close} aria-label={t.hero.bestiaryClose}>
              ✕
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
