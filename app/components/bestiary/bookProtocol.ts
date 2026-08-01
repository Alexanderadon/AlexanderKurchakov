// Протокол между хозяином книги (главный поток) и её сценой (воркер).
//
// Правило одно: через границу ходят только ПРОСТЫЕ данные. Никаких объектов
// three, никаких колбэков — команды вниз, состояние и вехи вверх. Всё, что
// хозяину нужно знать синхронно (state.busy в обработчике клика), он держит
// зеркалом, обновляемым сообщениями state: зеркало отстаёт от сцены максимум
// на кадр, ровно как раньше отставал сам обработчик от кадрового цикла.

/** Команды хозяина сцене. Имена и аргументы повторяют методы BookScene. */
export type HostToWorker =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      /** Имя → адрес. Воркер грузит и декодирует текстуры сам: fetch и
       *  createImageBitmap не касаются главного потока. */
      sources: Record<string, string>;
      closeUp: boolean;
      view: { w: number; h: number; dpr: number };
    }
  | { type: "target"; open: number; page: number }
  | { type: "pose"; open: number; page: number }
  | { type: "orbit"; dx: number; dy: number }
  | { type: "release"; vx: number; vy: number }
  | { type: "resetView" }
  | { type: "turnFrom"; hint: number }
  | { type: "setActive"; on: boolean }
  | { type: "setFraming"; mode: "tile" | "spread" }
  | { type: "resize"; w: number; h: number; dpr: number }
  /** Заставка ушла, а сборка ещё идёт: замедлить темп прогрева. */
  | { type: "pace"; ms: number }
  | { type: "dispose" };

/** Ответы сцены хозяину. */
export type WorkerToHost =
  /** Сцена собрана, шейдеры скомпилированы, кадровый цикл жив. */
  | { type: "ready" }
  /** Сборка не удалась: хозяин обязан перейти на запасной путь. */
  | { type: "error"; message: string }
  /** Кадровое состояние — зеркалится в state хозяина и в dataset холста. */
  | { type: "state"; open: number; page: number; busy: boolean }
  /** Вехи для тестов и стенда (ready/bookState/bookError → dataset). */
  | { type: "flag"; key: string; value: string };
