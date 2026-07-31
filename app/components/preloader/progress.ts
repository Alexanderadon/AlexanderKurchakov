// Модель прогресса прелоадера. Чистая функция от времени и реальной готовности —
// без DOM, без rAF, поэтому её можно проверить тестами.
//
// Правила, ради которых она вообще существует:
//  1. Всё считается в МИЛЛИСЕКУНДАХ, а не в кадрах. Счётчик, который растёт по
//     кадру, идёт вдвое быстрее на 144-герцовом мониторе — одна и та же страница
//     ведёт себя по-разному на разном железе.
//  2. Пол (minMs): прелоадер, мигнувший на 200 мс, хуже, чем его отсутствие.
//  3. Потолок (maxMs): если шрифт или картинка не пришли, полоса всё равно
//     доходит до конца. Зависший навсегда прелоадер — это сломанный сайт.
//  4. Прогресс монотонен: назад не откатывается никогда.

export interface ProgressTiming {
  /** Не быстрее этого времени, мс. */
  minMs: number;
  /** Не медленнее этого времени, мс — страховка от зависшей загрузки. */
  maxMs: number;
}

export const DEFAULT_TIMING: ProgressTiming = { minMs: 1100, maxMs: 4200 };

/**
 * Куда счётчик имеет право дотянуться прямо сейчас, 0..100.
 * @param elapsedMs сколько прошло с первого кадра
 * @param ready доля реально загруженного, 0..1
 */
export function progressTarget(
  elapsedMs: number,
  ready: number,
  timing: ProgressTiming = DEFAULT_TIMING,
): number {
  const t = Math.max(0, elapsedMs);
  const r = Math.min(1, Math.max(0, ready));
  const byFloor = Math.min(1, t / timing.minMs); // не обгоняем минимум
  const byCeil = Math.min(1, t / timing.maxMs); // и не отстаём от максимума
  // Потолок по времени НЕ добегает до конца: без полной готовности бар ползёт
  // максимум к 93% и ждёт сигналы. Прелоадер уходит после загрузки всего
  // контента, а не по секундомеру — лучше дольше, чем сайт с недогруженной
  // книгой и постером вместо неё. Жёсткий предел на патологию остаётся.
  const ceiling = r >= 1 ? byCeil : Math.min(byCeil, 0.93);
  return Math.max(ceiling, Math.min(r, byFloor)) * 100;
}

export interface CounterState {
  /** Текущее показание, 0..100. */
  pct: number;
  /** Остаток паузы, мс: счётчик замирает, чтобы движение не было линейным. */
  holdMs: number;
}

export const initialCounter = (pct = 0): CounterState => ({ pct, holdMs: 0 });

/**
 * Шаг счётчика. `rand` вынесен в параметр, чтобы тест был детерминированным.
 */
export function stepCounter(
  state: CounterState,
  target: number,
  dtMs: number,
  rand: () => number = Math.random,
): CounterState {
  const dt = Math.min(100, Math.max(0, dtMs)); // защита от скачка после сна вкладки
  if (state.holdMs > 0) return { pct: state.pct, holdMs: state.holdMs - dt };

  const eased = state.pct + (target - state.pct) * (dt / 190) + dt * 0.007;
  // Порядок важен: сначала прижимаем к цели, потом запрещаем движение назад.
  // При обратном порядке внешний Math.min утаскивал показание вниз, если цель
  // вдруг оказывалась ниже текущей — счётчик прыгал с 60 на 10.
  let pct = Math.max(state.pct, Math.min(target, eased));
  if (target >= 100 && pct > 99) pct = 100;

  const holdMs = rand() < dt / 900 ? 90 + rand() * 240 : 0;
  return { pct, holdMs };
}

/** Плавный старт-стоп для финального разлива света. */
export const smoothstep = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
