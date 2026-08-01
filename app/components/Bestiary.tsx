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
import { BOOK_TEXTURE_KEYS, BOOK_TEXTURE_SRC } from "./bestiary/assets";
import { createBookHost, workerSupported } from "./bestiary/bookHost";
import type { BookScene, BookTextures } from "./bestiary/threeBook";

/** peek — книга в модалке, но ещё закрыта: её можно рассмотреть и покрутить. */
type Phase = "shut" | "peek" | "opening" | "open" | "closing";

function decode(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => (im.decode ? im.decode().then(() => ok(im), () => ok(im)) : ok(im));
    im.onerror = no;
    im.src = src;
  });
}

type Warm = {
  tex: BookTextures;
  make: typeof import("./bestiary/threeBook").createBook;
  relief: typeof import("./bestiary/threeBook").reliefSteps;
};

/**
 * Прогрев ЗАПАСНОГО пути (главный поток, для машин без OffscreenCanvas).
 *
 * В режиме воркера эта функция НЕ ЗОВЁТСЯ, и это условие всего переезда: здесь
 * живёт единственный import сцены на главном потоке, и он тянет за собой чанк
 * three — тот самый секундный разбор, ради которого сцена и уехала. Текстуры в
 * режиме воркера тоже грузит сам воркер.
 */
let warming: Promise<Warm> | null = null;
function warm(): Promise<Warm> {
  if (!warming) {
    warming = Promise.all([
      Promise.all(BOOK_TEXTURE_KEYS.map(async (k) => [k, await decode(BOOK_TEXTURE_SRC[k])] as const)),
      import("./bestiary/threeBook"),
    ]).then(([pairs, mod]) => ({
      // По ИМЕНАМ, а не по позициям: прежняя деструктуризация из шестнадцати
      // переменных подряд перепутала бы карты от сдвига на одну строку, не
      // потревожив ни типы, ни тесты.
      tex: Object.fromEntries(pairs) as unknown as BookTextures,
      make: mod.createBook,
      relief: mod.reliefSteps,
    }));
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
  const slotRef = useRef<HTMLDivElement>(null);
  const tileSlotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tileLive, setTileLive] = useState(false);
  useEffect(() => {
    let dead = false;
    // Пауза между тяжёлыми шагами: ровно один кадр, а не «до свободного окна».
    //
    // Было requestIdleCallback. Под работающей заставкой свободных окон почти
    // нет — она сама рисует сцену каждый кадр, — и конвейер растягивался: на
    // проде оверлей держался 7.5 с при 733 мс настоящей работы. Всё, что нужно
    // от паузы, — отдать браузеру кадр, чтобы анимация заставки не дёрнулась;
    // ждать полной тишины незачем, потому что тишины под заставкой не бывает.
    const breath = (): Promise<void> =>
      new Promise((res) => requestAnimationFrame(() => setTimeout(res, 0)));
    // Вся подготовка идёт ПОД прелоадером, и он ждёт её сигнала (markBookReady):
    // после его ухода не остаётся ни лагов, ни постера вместо книги. Плавность —
    // из устройства шагов: derive-карты по одной в idle-окна, сцены рождаются
    // спящими, шейдеры компилируются асинхронно (compileAsync) — синхронных
    // фризов нет вовсе, пусть прелоадер работает дольше.
    // Холст создаётся кодом (не из JSX — React рассылает события по дереву
    // файберов, перенесённый JSX-узел уносил pointerup мимо модалки) и один
    // ездит между плиткой и модалкой.
    const bornCanvas = (): HTMLCanvasElement | null => {
      if (!tileSlotRef.current) return null;
      const cv = document.createElement("canvas");
      cv.className = "btile";
      cv.setAttribute("aria-hidden", "true");
      tileSlotRef.current.appendChild(cv);
      canvasRef.current = cv;
      return cv;
    };
    // ЗАПАСНОЙ путь: сцена на главном потоке, как жила всегда. Сюда попадают
    // машины без OffscreenCanvas (Safari до 17-й) и падение воркера на взлёте.
    const mainThreadPath = async (): Promise<void> => {
      const { tex, make, relief } = await warm();
      for (const stepFn of relief(tex)) {
        await breath();
        if (dead) return;
        stepFn();
      }
      await breath();
      if (dead || sceneRef.current) return;
      const cv = bornCanvas();
      if (!cv) return;
      // ОДНА сцена на обе роли: канвас ездит между плиткой и модалкой, рамка
      // кадра переключается setFraming.
      const sc = make(cv, tex, { closeUp: true, dormant: true });
      sceneRef.current = sc;
      if (sc) {
        sc.target(0, pageRef.current);
        await sc.compile();
        if (dead) return;
        sc.setActive(true);
        setTileLive(true);
        if (import.meta.env.DEV) {
          (window as unknown as { __book?: BookScene | null }).__book = sc;
        }
      }
    };
    // ОСНОВНОЙ путь: сцена в ВОРКЕРЕ. Разбор three (~1 с), компиляция программ
    // (~2 с ожиданий драйвера) и карты рельефа уходят со второго потока — тому,
    // что рисует заставку и двигает курсор, мешать больше нечем. Сеть и декод
    // шестнадцати текстур воркер тоже берёт на себя.
    const workerPath = async (): Promise<boolean> => {
      // ?book-main — принудительный запасной путь. Это не отладочная игрушка:
      // запасной путь исполняется у всех, у кого нет OffscreenCanvas (старые
      // Safari, часть вебвью), и без рычага его нельзя было бы ни прогнать в
      // тестах, ни сверить картинку на обычном Chromium.
      if (new URLSearchParams(location.search).has("book-main")) return false;
      if (!workerSupported()) return false;
      const cv = bornCanvas();
      if (!cv) return false;
      const host = createBookHost(cv, BOOK_TEXTURE_SRC, { closeUp: true });
      sceneRef.current = host;
      host.target(0, pageRef.current);
      try {
        await host.whenReady;
      } catch {
        // Воркер не взлетел. Холст уже необратимо передан ему — рождаем новый
        // и уходим на главный поток, как жили до переезда.
        if (!dead) {
          host.dispose();
          sceneRef.current = null;
          canvasRef.current?.remove();
          canvasRef.current = null;
        }
        return false;
      }
      if (dead) return true;
      // Сброс драйвера ПОСЛЕ готовности (полосатый мусор вместо тома на
      // слабых картах): молча оставить его нельзя. Сносим мёртвый воркер и
      // перестраиваемся на главном потоке — сайт к этому моменту показан, а
      // прогрев запасного пути дышит паузами между шагами.
      host.onLost = () => {
        if (dead || sceneRef.current !== host) return;
        host.dispose();
        sceneRef.current = null;
        setTileLive(false);
        canvasRef.current?.remove();
        canvasRef.current = null;
        void mainThreadPath();
      };
      setTileLive(true);
      if (import.meta.env.DEV) {
        (window as unknown as { __book?: BookScene | null }).__book = host;
      }
      return true;
    };
    void (async () => {
      try {
        if (!(await workerPath()) && !dead) await mainThreadPath();
      } finally {
        // Отпускаем прелоадер и при успехе, и при падении: без книги ему тем
        // более незачем стоять.
        markBookReady();
      }
    })();
    const onR = (): void => {
      sceneRef.current?.resize();
    };
    window.addEventListener("resize", onR);
    return () => {
      dead = true;
      window.removeEventListener("resize", onR);
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
      sceneRef.current?.orbit(dx, dy);
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
    // Тач-экран: тап порождает синтетический mouseenter, том доворачивается
    // «к курсору», а mouseleave, возвращающий его на место, не приходит
    // НИКОГДА — пальцу неоткуда уйти. Этот бесхозный поворот уезжал в модалку
    // и перекашивал разворот: правая страница уходила за грань кадра. На
    // устройствах без наведения доворот с плитки — случайность, сбрасываем.
    // Десктоп не трогаем: там перенос поворота из плитки в осмотр — осознанная
    // непрерывность, и эталоны кадра сняты с ним.
    if (matchMedia("(hover: none)").matches) sceneRef.current?.resetView();
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
    const cv = canvasRef.current;
    const slot = slotRef.current;
    const home = tileSlotRef.current;
    const sc = sceneRef.current;
    if (!cv || !slot || !home || !sc) return;
    // ПЕРЕЕЗД, а не вторая сцена: тот же канвас вынимается из плитки и
    // вставляется в модалку. WebGL-контекст переживает перенос узла между
    // родителями — теряется он только при удалении из документа, а тут узел
    // всё время остаётся в дереве.
    //
    // Класс МЕНЯЕМ, а не добавляем: у плиточного канваса opacity:0 вне
    // .bshut[data-live], pointer-events:none и своя drop-shadow с переходом —
    // в модалке всё это лишнее.
    cv.classList.remove("btile");
    cv.classList.add("bbook");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", t.hero.bestiarySpread);
    cv.removeAttribute("aria-hidden");
    slot.appendChild(cv);
    sc.setFraming("spread");
    sc.resize();
    // iOS доводит раскладку ПОСЛЕ вставки: немедленный замер там ловит старую
    // геометрию. Кадром позже наблюдатель уже видит настоящую — добираем.
    requestAnimationFrame(() => sc.resize());
    // Раскрываем НЕ сразу: книга ждёт закрытой, её можно покрутить. Открывает
    // следующий клик — иначе рассмотреть том не успеваешь.
    sc.target(phase === "open" ? 1 : 0, pageRef.current);
    return () => {
      cv.classList.remove("bbook");
      cv.classList.add("btile");
      cv.removeAttribute("role");
      cv.removeAttribute("aria-label");
      cv.setAttribute("aria-hidden", "true");
      home.appendChild(cv);
      sc.setFraming("tile");
      sc.resetView();
      sc.target(0, pageRef.current);
      sc.resize();
      requestAnimationFrame(() => sc.resize());
    };
  }, [phase === "shut", tileLive, t.hero.bestiarySpread]);

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
        {/* Живой том: канвас поверх постера, постер гаснет по готовности сцены.
            Гнездо, а не сам канвас: канвас один на плитку и на модалку и ездит
            между ними, а узел, созданный из JSX, так двигать НЕЛЬЗЯ. React
            рассылает события по дереву файберов, а не по DOM: у перенесённого
            JSX-узла родителем в дереве остаётся плитка, и pointerup из модалки
            уходил в onClick кнопки .bshut вместо обработчиков книги — клик по
            тому переставал его раскрывать. У канваса, созданного вручную,
            файбера нет, и событие достаётся ближайшему предку по DOM. */}
        <div ref={tileSlotRef} className="bslot" aria-hidden="true" />
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
