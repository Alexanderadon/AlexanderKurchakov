// Сцена книги во ВТОРОМ потоке.
//
// Здесь исполняется всё, что раньше замораживало заставку на главном:
//   разбор чанка three (~1 с одной неделимой задачей),
//   компиляция 27 программ (~2 с ожиданий драйвера по 80–250 мс),
//   карты рельефа (~0.5 с) и заливка текстур.
// Заставку, счётчик и курсор рисует главный поток — ему всё это больше не
// мешает: у воркера свой процессорный поток, а картинка уходит в тот же холст
// через OffscreenCanvas.
//
// Сеть и декод картинок тоже здесь: fetch и createImageBitmap воркеру доступны,
// главный поток не тратит на шестнадцать текстур ни миллисекунды.
//
// ВАЖНО про three: динамический import ниже — единственная точка, где чанк
// three исполняется в этом режиме. Статического импорта threeBook тут нет
// нарочно: он утянул бы сцену в бандл воркера на этапе сборки, но исполнялся
// бы всё равно здесь — а вот случайный статический импорт В ХОЗЯИНЕ вернул бы
// секундный разбор на главный поток и обнулил бы весь переезд.

import type { HostToWorker, WorkerToHost } from "./bookProtocol";
import type { BookScene, BookTextures } from "./threeBook";

const post = (m: WorkerToHost): void => {
  (self as unknown as Worker).postMessage(m);
};

let scene: BookScene | null = null;
/** Темп прогрева. Живой объект: команда pace меняет его прямо во время сборки. */
const pace = { ms: 45 };
/** Команды, пришедшие, пока сцена ещё собиралась: проигрываются по готовности. */
const backlog: HostToWorker[] = [];
let building = false;

async function init(msg: Extract<HostToWorker, { type: "init" }>): Promise<void> {
  building = true;
  // ПОТЕРЯ КОНТЕКСТА — не теория. На Windows драйвер, занятый дольше ~2 с,
  // сбрасывается системой (TDR), и все GL-контексты умирают; плейсхолдер на
  // странице в этот момент показывает полосатый мусор видеопамяти — пользователь
  // прислал его скриншот. На слабых картах наши линковки как раз способны
  // упереться в этот предел. Ловим и докладываем хозяину: у него есть запасной
  // путь и живой пользователь, у нас тут — только мёртвый контекст.
  (msg.canvas as unknown as HTMLCanvasElement).addEventListener?.("webglcontextlost", (e) => {
    (e as Event).preventDefault();
    post({ type: "error", message: "контекст потерян (сброс драйвера)" });
  });
  try {
    // Параллельно: код сцены (вместе с three) и все текстуры.
    const [mod, bitmaps] = await Promise.all([
      import("./threeBook"),
      Promise.all(
        Object.entries(msg.sources).map(async ([key, url]) => {
          const blob = await (await fetch(url)).blob();
          // Переворот — НА ДЕКОДЕ, и это не прихоть. three кладёт текстуры с
          // flipY=true и полагается на UNPACK_FLIP_Y_WEBGL, а для ImageBitmap
          // WebGL этот флаг по спецификации ИГНОРИРУЕТ — обложка приехала вверх
          // ногами, «BESTIARIUM» читался в зеркале. Переворачиваем сами при
          // создании битмапа: дальше картинка ведёт себя так, как ждёт three.
          return [key, await createImageBitmap(blob, { imageOrientation: "flipY" })] as const;
        }),
      ),
    ]);
    const tex = Object.fromEntries(bitmaps) as unknown as BookTextures;

    // Карты рельефа — по одной на проход цикла событий: воркер ничего не
    // морозит на главном потоке, но пусть и сам остаётся отзывчивым к
    // сообщениям (resize мог прийти во время сборки).
    for (const step of mod.reliefSteps(tex)) {
      step();
      await new Promise((res) => setTimeout(res, 0));
    }

    scene = mod.createBook(msg.canvas as unknown as HTMLCanvasElement, tex, {
      closeUp: msg.closeUp,
      dormant: true,
      view: msg.view,
      pace,
      report: (key, value) => post({ type: "flag", key, value }),
    });
    if (!scene) {
      post({ type: "error", message: "webgl в воркере не поднялся" });
      return;
    }
    await scene.compile();
    scene.setActive(true);

    // Кадровое состояние зеркалится хозяину: он отвечает на клики синхронно.
    let last = { open: -1, page: -1, busy: false };
    const pump = (): void => {
      if (!scene) return;
      const st = scene.state;
      if (st.open !== last.open || st.page !== last.page || st.busy !== last.busy) {
        last = { open: st.open, page: st.page, busy: st.busy };
        post({ type: "state", ...last });
      }
      setTimeout(pump, 33);
    };
    pump();

    for (const q of backlog.splice(0)) apply(q);
    building = false;
    post({ type: "ready" });
  } catch (e) {
    building = false;
    post({ type: "error", message: String(e).slice(0, 200) });
  }
}

function apply(msg: HostToWorker): void {
  if (!scene) return;
  switch (msg.type) {
    case "target":
      scene.target(msg.open, msg.page);
      break;
    case "pose":
      scene.pose(msg.open, msg.page);
      break;
    case "orbit":
      scene.orbit(msg.dx, msg.dy);
      break;
    case "release":
      scene.release(msg.vx, msg.vy);
      break;
    case "resetView":
      scene.resetView();
      break;
    case "turnFrom":
      scene.turnFrom(msg.hint);
      break;
    case "setActive":
      scene.setActive(msg.on);
      break;
    case "setFraming":
      scene.setFraming(msg.mode);
      break;
    case "resize":
      scene.resize(msg.w, msg.h, msg.dpr);
      break;
    case "dispose":
      scene.dispose();
      scene = null;
      self.close();
      break;
    default:
      break;
  }
}

self.onmessage = (e: MessageEvent<HostToWorker>): void => {
  const msg = e.data;
  if (msg.type === "init") {
    void init(msg);
    return;
  }
  // Темп обрабатывается ВНЕ очереди и до готовности сцены: команда «уступи
  // дорогу» нужна именно во время сборки — после неё ей уже нечего менять.
  if (msg.type === "pace") {
    pace.ms = msg.ms;
    return;
  }
  // Сцена ещё собирается — команды не теряются, а ждут её.
  if (!scene && (building || msg.type !== "dispose")) {
    backlog.push(msg);
    return;
  }
  apply(msg);
};
