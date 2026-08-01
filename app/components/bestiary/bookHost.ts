// Хозяин книги: тот же интерфейс BookScene, но за ним — воркер.
//
// Bestiary не знает, где живёт сцена. Он зовёт те же target/orbit/flip, что и
// раньше; хозяин пересылает их сообщениями, а состояние держит зеркалом,
// обновляемым из воркера. Зеркало отстаёт от сцены максимум на кадр — ровно
// столько же, сколько обработчик клика отставал от кадрового цикла, когда всё
// жило на одном потоке.
//
// Почему воркер, а не ещё одна оптимизация: замер показал, что заставку морозят
// неделимые задачи — разбор чанка three (~1 с) и ожидания драйвера на программу
// (80–250 мс). Их нельзя ни ускорить, ни раздробить — только унести с потока,
// который рисует заставку и двигает курсор.

import type { HostToWorker, WorkerToHost } from "./bookProtocol";
import type { BookScene } from "./threeBook";

/**
 * Поддержка на этой машине. Проверяется ДО передачи холста: transfer необратим,
 * и решение «воркер или главный поток» принимается один раз.
 * Всё перечисленное шагает одной эпохой (Chrome 69+, Firefox 105+, Safari 17+):
 * порознь эти проверки не проваливаются.
 */
export function workerSupported(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "transferControlToOffscreen" in HTMLCanvasElement.prototype &&
    typeof createImageBitmap !== "undefined"
  );
}

export interface BookHost extends BookScene {
  /** Разрешается готовностью сцены; отказ — сигнал перейти на запасной путь. */
  readonly whenReady: Promise<void>;
  /** Беда ПОСЛЕ готовности (сброс драйвера): сцена мертва, надо перестраиваться. */
  onLost?: () => void;
}

export function createBookHost(
  canvas: HTMLCanvasElement,
  sources: Record<string, string>,
  opts: { closeUp: boolean },
): BookHost {
  const state = { open: 0, page: 3, busy: false };
  let ready = false;
  // Запасное значение — ОКНО, а не двойка: по стартовой ширине сцена решает
  // плотность сеток (lite < 720) раз и навсегда. Холст, не разложенный к
  // моменту замера, отдавал бы ноль — и десктоп собирал бы половинные сетки.
  const view = (): { w: number; h: number; dpr: number } => ({
    w: Math.max(2, canvas.clientWidth || canvas.parentElement?.clientWidth || window.innerWidth),
    h: Math.max(2, canvas.clientHeight || canvas.parentElement?.clientHeight || window.innerHeight),
    dpr: window.devicePixelRatio || 1,
  });

  const worker = new Worker(new URL("./bookWorker.ts", import.meta.url), {
    type: "module",
    name: "book",
  });
  const send = (m: HostToWorker, transfer?: Transferable[]): void => {
    // После terminate постить некуда; молчаливый no-op безопаснее исключения.
    try {
      if (transfer) worker.postMessage(m, transfer);
      else worker.postMessage(m);
    } catch {
      /* воркер уже остановлен */
    }
  };

  let readyRes: () => void = () => {};
  let readyRej: (e: Error) => void = () => {};
  const whenReady = new Promise<void>((res, rej) => {
    readyRes = res;
    readyRej = rej;
  });

  worker.onmessage = (e: MessageEvent<WorkerToHost>): void => {
    const m = e.data;
    if (m.type === "state") {
      state.open = m.open;
      state.page = m.page;
      state.busy = m.busy;
      canvas.dataset.bookState = m.open.toFixed(3) + ":" + m.page.toFixed(2);
    } else if (m.type === "flag") {
      // Вехи сцены (ready/bookState/bookError) едут в dataset ПЛЕЙСХОЛДЕРА:
      // сквозные тесты и стенд смотрят на него и не знают про воркер.
      canvas.dataset[m.key] = m.value;
    } else if (m.type === "ready") {
      ready = true;
      readyRes();
    } else if (m.type === "error") {
      canvas.dataset.bookError = m.message;
      // До готовности — отказ обещания (Bestiary уйдёт на запасной путь).
      // После — отдельный канал: обещание уже съедено, но сцена мертва, и
      // молчание оставило бы пользователя с полосатым мусором вместо книги.
      if (ready) api.onLost?.();
      else readyRej(new Error(m.message));
    }
  };
  worker.onerror = (e): void => {
    // Падение самого воркера (не сцены): чанк не доехал, синтаксис, CSP.
    canvas.dataset.bookError = e.message || "воркер не поднялся";
    readyRej(new Error(canvas.dataset.bookError));
  };

  const off = canvas.transferControlToOffscreen();
  send(
    { type: "init", canvas: off, sources, closeUp: opts.closeUp, view: view() },
    [off],
  );

  // РАЗМЕР — ПО НАБЛЮДАТЕЛЮ, а не по избранным моментам.
  //
  // Раньше размеры снимались руками: при создании, при открытии модалки, по
  // window.resize. Реальный телефон это разбил: канвас переезжает между
  // плиткой и модалкой, вьюпорт встроенного браузера дышит панелями, и замер
  // «в момент открытия» ловил СТАРУЮ раскладку. Сцена запоминала широкий кадр
  // на портретном холсте — и вписывание отталкивало камеру так, что разворот
  // становился крошечным (скриншот пользователя из телеграмовского вебвью).
  // Наблюдатель отдаёт фактический размер при КАЖДОМ изменении и переживает
  // переезд холста между родителями. Вырожденные размеры (холст в момент
  // переезда) отбрасываются — стреляют нулём и портили бы кадр.
  const ro = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver((entries) => {
        const r = entries[entries.length - 1]?.contentRect;
        if (!r || r.width < 10 || r.height < 10) return;
        send({ type: "resize", w: Math.round(r.width), h: Math.round(r.height), dpr: window.devicePixelRatio || 1 });
      })
    : null;
  ro?.observe(canvas);

  // ЗАСТАВКА УШЛА, А СБОРКА ЕЩЁ ИДЁТ — воркер обязан уступить дорогу.
  //
  // Нормальный путь: заставка ждёт сигнала готовности, и темп прогрева
  // (45 мс на программу) никому не мешает. Но у ожидания есть страховочный
  // порог, и на слабой машине с медленной сетью сборка может его пробить:
  // заставка уходит, сайт показан, а драйвер продолжает получать программы —
  // и общий GPU-процесс душит уже ВИДИМУЮ страницу. Пользователь снял это на
  // видео: шлейф призрачных курсоров и подлагивающий скролл.
  //
  // Наблюдаем за тем же атрибутом, которым живёт заставка: он снят — переводим
  // прогрев на шаг 300 мс. Книга доберётся на несколько секунд позже, но сайт
  // под руками останется живым. Наблюдатель гасится по готовности: после неё
  // темп уже ничего не решает.
  let paced = false;
  const yieldRoad = (): void => {
    if (paced) return;
    if (!document.documentElement.hasAttribute("data-preload")) {
      paced = true;
      send({ type: "pace", ms: 300 });
      mo.disconnect();
    }
  };
  const mo = new MutationObserver(yieldRoad);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-preload"] });
  yieldRoad(); // заставка могла уйти (или не включаться вовсе) ещё до нас
  // Оба исхода, а не finally: у finally-цепочки отказ остался бы необработанным
  // и сыпал бы в консоль, хотя сам отказ здесь штатный (уход на запасной путь).
  whenReady.then(() => mo.disconnect(), () => mo.disconnect());

  const api: BookHost = {
    whenReady,
    get state() {
      return state;
    },
    target: (open, page) => send({ type: "target", open, page }),
    pose: (open, page) => send({ type: "pose", open, page }),
    orbit: (dx, dy) => send({ type: "orbit", dx, dy }),
    release: (vx, vy) => send({ type: "release", vx, vy }),
    resetView: () => send({ type: "resetView" }),
    turnFrom: (hint) => send({ type: "turnFrom", hint }),
    setActive: (on) => send({ type: "setActive", on }),
    setFraming: (mode) => send({ type: "setFraming", mode }),
    resize: () => {
      const v = view();
      send({ type: "resize", ...v });
    },
    // Сцена в воркере компилируется в init-конвейере; отдельная команда не нужна.
    compile: () => whenReady,
    dispose: () => {
      ro?.disconnect();
      send({ type: "dispose" });
      // Страховка: если воркер завис и не закрыл себя сам, добиваем снаружи.
      setTimeout(() => worker.terminate(), 1000);
    },
  };
  return api;
}
