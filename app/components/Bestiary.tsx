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
import { bookCreak, bookRustle } from "~/lib/bookSounds";
import { markBookReady } from "~/lib/bookReady";
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

type Warm = {
  images: HTMLImageElement[];
  make: typeof import("./bestiary/threeBook").createBook;
  relief: typeof import("./bestiary/threeBook").reliefSteps;
};

/**
 * Прогрев. Чанк three (131 КБ) и семь текстур тянутся ОДИН раз на модуль и
 * заранее — как только плитка подошла к экрану. Без этого по клику начиналась
 * загрузка с нуля, и пользователь секунд пять смотрел в пустой холст: открытие
 * книги обязано быть щелчком, другого варианта нет.
 */
let warming: Promise<Warm> | null = null;
// Прогрев — только СЕТЬ и декод картинок: это не дёргает главный поток и
// спокойно идёт под прелоадером. Вся тяжёлая работа CPU (карты рельефа,
// сборка сцен, компиляция шейдеров) — отдельным конвейером после него.
function warm(): Promise<Warm> {
  if (!warming) {
    warming = Promise.all([
      Promise.all(ASSETS.map(decode)),
      import("./bestiary/threeBook"),
    ]).then(([images, mod]) => ({ images, make: mod.createBook, relief: mod.reliefSteps }));
  }
  return warming;
}

export function Bestiary() {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>("shut");
  const sceneRef = useRef<BookScene | null>(null);
  const pageRef = useRef(Math.floor(LEAVES / 2)); // сколько листов уже слева
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

  // В плитке живёт СВОЯ уменьшенная сцена той же книги: закрытый том вместо
  // постера. Прогрев стартует сразу после монтирования (в idle) — плитке всё
  // равно нужны чанк и текстуры, а заодно к клику готова и модалка: прежняя
  // ленивая загрузка по доскроллу оставляла клик с ожиданием в секунды.
  const tileRef = useRef<HTMLCanvasElement>(null);
  const tileSceneRef = useRef<BookScene | null>(null);
  const modalCvRef = useRef<HTMLCanvasElement | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [tileLive, setTileLive] = useState(false);
  // Отдельный сигнал готовности модальной сцены: она доезжает ПОЗЖЕ плитки, и
  // если модалку открыли в этот зазор, вставка канваса обязана повториться.
  const [modalLive, setModalLive] = useState(false);
  useEffect(() => {
    let dead = false;
    const idle =
      (window as unknown as { requestIdleCallback?: (fn: () => void) => number }).requestIdleCallback ??
      ((fn: () => void) => window.setTimeout(fn, 120));
    // Пауза до следующего свободного окна главного потока: тяжёлые шаги идут
    // ПООДИНОЧКЕ, между ними страница успевает нарисовать кадры.
    const breath = (): Promise<void> => new Promise((res) => idle(() => res()));
    // Вся подготовка идёт ПОД прелоадером, и он ждёт её сигнала (markBookReady):
    // после его ухода не остаётся ни лагов, ни постера вместо книги. Плавность —
    // из устройства шагов: derive-карты по одной в idle-окна, сцены рождаются
    // спящими, шейдеры компилируются асинхронно (compileAsync) — синхронных
    // фризов нет вовсе, пусть прелоадер работает дольше.
    void (async () => {
      try {
        const { images, make, relief } = await warm();
        const [coverFront, endpaper, pageLeft, pageRight, spine, strap, plate, nCover, nPage, nPlate,
          foredge, nForedge, headband, nStrap, catchPlate, nCatch] = images;
        const tex = { coverFront, endpaper, pageLeft, pageRight, spine, strap, plate,
          nCover, nPage, nPlate, foredge, nForedge, headband, nStrap, catchPlate, nCatch };
        for (const stepFn of relief(tex)) {
          await breath();
          if (dead) return;
          stepFn();
        }
        await breath();
        if (dead || !tileRef.current || tileSceneRef.current) return;
        // Плитка: голая книга без подиума, фронтальной рамкой.
        const ts = make(tileRef.current, tex, { closeUp: true, bare: true, dormant: true });
        tileSceneRef.current = ts;
        if (ts) {
          await ts.compile();
          if (dead) return;
          ts.setActive(true);
          setTileLive(true);
          // Плитка ожила — прелоадер можно отпускать: видимого постера уже нет.
          // Модальная сцена доготовится асинхронно в фоне, без рывков.
          markBookReady();
        }
        await breath();
        if (dead) return;
        // Модальная сцена: спящая, скомпилированная заранее — проснётся при
        // открытии. Пересборок нет, клик мгновенный.
        const mc = document.createElement("canvas");
        mc.className = "bbook";
        modalCvRef.current = mc;
        const ms = make(mc, tex, { dormant: true });
        sceneRef.current = ms;
        ms?.target(0, pageRef.current);
        // Сцена есть — вставлять уже можно (если модалку открыли раньше времени,
        // недокомпилированное доберёт первый кадр). Прогрев продолжается фоном.
        setModalLive(true);
        if (ms) await ms.compile();
        if (dead) return;
        if (import.meta.env.DEV) {
          (window as unknown as { __book?: BookScene | null }).__book = sceneRef.current;
        }
      } finally {
        // Отпускаем прелоадер и при успехе, и при падении сети: без книги ему
        // тем более незачем стоять.
        markBookReady();
      }
    })();
    const onR = (): void => {
      tileSceneRef.current?.resize();
      sceneRef.current?.resize();
    };
    window.addEventListener("resize", onR);
    return () => {
      dead = true;
      window.removeEventListener("resize", onR);
      tileSceneRef.current?.dispose();
      tileSceneRef.current = null;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Наведение на плитку: том мягко доворачивается к курсору и так же мягко
  // возвращается — живая книга, а не картинка. Тайловая сцена своя, поэтому
  // модалке эти повороты не передаются.
  const sway = useRef({ raf: 0, cx: 0, cy: 0, tx: 0, ty: 0 });
  const swayTo = useCallback((tx: number, ty: number): void => {
    if (prefersReducedMotion()) return;
    const s = sway.current;
    s.tx = tx;
    s.ty = ty;
    if (s.raf) return;
    const step = (): void => {
      const dx = (s.tx - s.cx) * 0.14;
      const dy = (s.ty - s.cy) * 0.14;
      s.cx += dx;
      s.cy += dy;
      tileSceneRef.current?.orbit(dx, dy);
      if (Math.abs(s.tx - s.cx) > 0.4 || Math.abs(s.ty - s.cy) > 0.4) {
        s.raf = requestAnimationFrame(step);
      } else {
        s.raf = 0;
      }
    };
    s.raf = requestAnimationFrame(step);
  }, []);
  useEffect(() => () => cancelAnimationFrame(sway.current.raf), []);

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
      // Шелест уважает reduced motion: кому не нужна анимация, тому и звук её.
      if (!prefersReducedMotion()) bookRustle();
    },
    [phase],
  );


  const close = useCallback((): void => {
    if (phase === "shut" || phase === "closing") return;
    const instant = prefersReducedMotion();
    setPhase("closing");
    aim(0);
    if (!instant) bookCreak();
    after(instant ? 0 : OPEN_MS, () => {
      setPhase("shut");
      btnRef.current?.focus();
    });
  }, [phase, after, aim]);

  // Открытие модалки: ГОТОВЫЙ канвас книги вставляется в гнездо, закрытие
  // вынимает его, не разрушая сцену. Пересборки нет — нет ни фриза, ни
  // исчезающей книги. Если открыли раньше, чем прогрелось (медленная сеть),
  // эффект добежит по tileLive.
  useEffect(() => {
    if (phase === "shut") return;
    const mc = modalCvRef.current;
    const slot = slotRef.current;
    const sc = sceneRef.current;
    if (!mc || !slot || !sc) return;
    mc.setAttribute("role", "img");
    mc.setAttribute("aria-label", t.hero.bestiarySpread);
    slot.appendChild(mc);
    sc.setActive(true);
    sc.resize();
    // Раскрываем НЕ сразу: книга ждёт закрытой, её можно покрутить. Открывает
    // следующий клик — иначе рассмотреть том не успеваешь.
    sc.target(phase === "open" ? 1 : 0, pageRef.current);
    return () => {
      mc.remove();
      sc.setActive(false);
    };
  }, [phase === "shut", modalLive, t.hero.bestiarySpread]);

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

  // Указатель: перетаскивание крутит книгу, а у РАСКРЫТОЙ книги горизонтальная
  // протяжка ТЯНЕТ ЛИСТ — палец ведёт страницу, отпустил — долетает или
  // возвращается. Клик без сдвига действует как раньше. Порог в шесть пикселей —
  // палец на телефоне никогда не стоит идеально ровно.
  const drag = useRef({ on: false, moved: 0, x: 0, y: 0, sx: 0, sy: 0, t: 0, vx: 0, vy: 0, mode: 0 });
  const dragTurn = useRef({ base: 0, dir: 1 as 1 | -1, frac: 0 });

  const onDown = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      on: true,
      moved: 0,
      x: e.clientX,
      y: e.clientY,
      sx: e.clientX,
      sy: e.clientY,
      t: performance.now(),
      vx: 0,
      vy: 0,
      mode: 0,
    };
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
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

      // Режим решается по первому уверенному сдвигу: горизонталь у раскрытой
      // книги — лист, всё остальное — вращение тома.
      if (d.mode === 0 && d.moved > 8) {
        const sc = sceneRef.current;
        const horizontal = Math.abs(e.clientX - d.sx) > Math.abs(e.clientY - d.sy) * 1.2;
        if (phase === "open" && sc && !sc.state.busy && horizontal) {
          d.mode = 2;
          const r = e.currentTarget.getBoundingClientRect();
          dragTurn.current = {
            base: pageRef.current,
            dir: e.clientX < d.sx ? 1 : -1,
            frac: 0,
          };
          sc.turnFrom(1 - 2 * ((d.sy - r.top) / r.height));
        } else {
          d.mode = 1;
        }
      }
      if (d.mode === 2) {
        const sc = sceneRef.current;
        if (!sc) return;
        const r = e.currentTarget.getBoundingClientRect();
        const tn = dragTurn.current;
        const raw = ((tn.dir > 0 ? d.sx - e.clientX : e.clientX - d.sx) / (r.width * 0.45));
        const target = tn.base + tn.dir;
        // На крайних страницах лист упирается: даём восьмую часть хода и не пускаем.
        const limit = target < 0 || target > LEAVES ? 0.12 : 1;
        tn.frac = Math.min(limit, Math.max(0, raw));
        sc.pose(1, tn.base + tn.dir * tn.frac);
        return;
      }
      if (d.mode === 1) sceneRef.current?.orbit(dx, dy);
    },
    [phase],
  );

  const onUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): void => {
      const d = drag.current;
      d.on = false;
      // Отпустили лист: дальше полёт сам — вперёд, если протянули дальше трети
      // хода или махнули с размаху, иначе лист возвращается на место.
      if (d.mode === 2) {
        const sc = sceneRef.current;
        if (!sc) return;
        const tn = dragTurn.current;
        const target = tn.base + tn.dir;
        const flung = tn.dir > 0 ? d.vx < -260 : d.vx > 260;
        const commit = target >= 0 && target <= LEAVES && (tn.frac > 0.36 || flung);
        const dest = commit ? target : tn.base;
        pageRef.current = dest;
        sc.target(1, dest);
        if (commit && !prefersReducedMotion()) bookRustle();
        return;
      }
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
        if (!prefersReducedMotion()) bookCreak();
        after(OPEN_MS, () => setPhase("open"));
        return;
      }
      const r = e.currentTarget.getBoundingClientRect();
      // Точка подхвата по высоте: лист закручивается сильнее с той стороны,
      // за которую его взяли.
      sc.turnFrom(1 - 2 * ((e.clientY - r.top) / r.height));
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
        data-live={tileLive ? "1" : undefined}
        onClick={open}
        onMouseEnter={() => swayTo(-34, -12)}
        onMouseLeave={() => swayTo(0, 0)}
      >
        <img
          className="bcover"
          src="/img/bestiary/cover.webp"
          alt={t.hero.bestiary}
          loading="lazy"
          decoding="async"
        />
        {/* Живой том: канвас поверх постера, постер гаснет по готовности сцены. */}
        <canvas ref={tileRef} className="btile" aria-hidden="true" />
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
              <div
                ref={slotRef}
                className="bbook-host"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={() => {
                  const d = drag.current;
                  if (d.mode === 2) {
                    // Системный обрыв жеста: лист возвращается на место.
                    sceneRef.current?.target(1, dragTurn.current.base);
                  }
                  d.on = false;
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
