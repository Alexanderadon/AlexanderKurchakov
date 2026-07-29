// Словарь и раскладка надписей прелоадера.
//
// Латынь пишется обычной орфографией, через U. Римская эпиграфика (V вместо U:
// ABYSSVS, LVX) выглядит уместнее по стилю, но читается как опечатка — а надпись,
// которую принимают за ошибку, ошибкой и является. Смешивать две системы на одной
// странице нельзя тем более: раньше крупные слова шли через V, а подписи счётчика
// через U.
//
// Слова кладутся не в фиксированные доли экрана, а в ЗОНЫ, которые считаются от
// живой геометрии глаза и собора. На широком экране свободны колонки слева и
// справа от глаза; на узком глаз занимает всю ширину, и свободны полосы над ним
// и между ним и собором. Поэтому у слова две прописки.

export type Side = "L" | "R" | "B";

export interface WordSpec {
  /** Латинское слово. */
  t: string;
  /** Перевод на полях; null — стоит само по себе. */
  ru: string | null;
  /** Колонка (L/R) или строка по цоколю собора (B). */
  side: Side;
  /** Порядок в колонке на широком экране. */
  i: number;
  /** Номер строки на узком экране; null — не показывать. */
  n: number | null;
}

export const WORDS: readonly WordSpec[] = [
  { t: "TENEBRAE", ru: "тьма", side: "L", i: 0, n: 0 },
  { t: "ABYSSUS", ru: "бездна", side: "L", i: 1, n: 2 },
  { t: "SILENTIUM", ru: "тишина", side: "L", i: 2, n: null },
  { t: "NOX", ru: "ночь", side: "R", i: 0, n: 1 },
  { t: "UMBRA", ru: "тень", side: "R", i: 1, n: null },
  { t: "NIHIL", ru: "ничто", side: "R", i: 2, n: 3 },
  { t: "НЕ ОБОРАЧИВАЙСЯ", ru: null, side: "B", i: 0, n: 0 },
];

/** Подписи стадий: латынь + перевод. Тоже через U — одна орфография на всё. */
export const STAGES: readonly [number, string, string][] = [
  [0, "tenebrae", "тьма"],
  [18, "fundamenta", "основания"],
  [40, "columnae", "столпы"],
  [62, "fenestrae", "окна"],
  [82, "lumen", "свет"],
  [96, "advenit", "грядёт"],
];

export const stageAt = (pct: number): readonly [number, string, string] => {
  let found = STAGES[0];
  for (const s of STAGES) if (pct >= s[0]) found = s;
  return found;
};

export interface Viewport {
  w: number;
  h: number;
  /** Узкий макет: телефон или планшет в портрете. */
  narrow: boolean;
}

export interface EyeBox {
  /** Центр глаза по вертикали. */
  cy: number;
  /** Половина высоты видимой части. */
  hh: number;
}

export interface Layout {
  /** Левая ось выключки. */
  axL: number;
  /** Правая ось выключки. */
  axR: number;
  /** Верх колонки/полосы. */
  top: number;
  /** Высота колонки/полосы. */
  hgt: number;
  /** Сколько строк делить. */
  rows: number;
  /** Базовая линия у цоколя собора. */
  baseY: number;
}

/**
 * Оси выключки уведены от самых краёв: виньетка сайта (.cinebg-vig) гасит там
 * до 76%, а текст лежит прямо на фоне, без плашки — в отличие от карточек.
 */
export function layoutWords(vp: Viewport, eye: EyeBox, cathTop: number, floorY: number): Layout {
  const hb = vp.h * (vp.narrow ? 0.105 : 0.13);
  const axL = vp.w * 0.075;
  const axR = vp.w * 0.925;
  const baseY = floorY + vp.h * 0.016;
  if (!vp.narrow) {
    // низ колонок держим выше счётчика, иначе последняя строка садится на него
    return { axL, axR, top: hb, hgt: Math.max(60, vp.h * 0.76 - hb), rows: 3, baseY };
  }
  const top = eye.cy + eye.hh * 1.45;
  return { axL, axR, top, hgt: Math.max(60, cathTop - top - vp.h * 0.01), rows: 4, baseY };
}

export interface PlacedWord extends WordSpec {
  x: number;
  y: number;
  /** -1 по левому краю, 0 по центру, 1 по правому. */
  align: -1 | 0 | 1;
  /** Доступная ширина: слово ужимается, чтобы не уйти за край. */
  room: number;
}

export function placeWords(vp: Viewport, l: Layout): PlacedWord[] {
  const step = l.hgt / l.rows;
  const out: PlacedWord[] = [];
  for (const w of WORDS) {
    if (vp.narrow && w.n === null) continue;
    const base = w.side === "B";
    const align: -1 | 0 | 1 = base ? 0 : w.side === "L" ? -1 : 1;
    const x = base ? vp.w * 0.5 : align < 0 ? l.axL : l.axR;
    const y = base ? l.baseY : l.top + step * ((vp.narrow ? (w.n as number) : w.i) + 0.5);
    const room = base ? vp.w * 0.84 : align < 0 ? vp.w * 0.945 - x : x - vp.w * 0.055;
    out.push({ ...w, x, y, align, room });
  }
  return out;
}
