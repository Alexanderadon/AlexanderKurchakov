// Перекраска исходников без ctx.filter.
//
// Почему не фильтром canvas: в Safari он поддерживается частично. Проверка
// присваиванием `invert(1)` проходит, а цепочка из шести функций молча
// отбрасывается — и собор, который нарисован тёмными линиями по БЕЛОМУ, ложится
// аддитивно светлым прямоугольником в пол-экрана. Ровно это и было видно на
// iPhone. Пиксельный путь даёт один результат везде и считается один раз на
// исходнике, а не на каждом кадре и не на полноэкранном буфере.
//
// Матрицы — из спецификации CSS filter effects, чтобы результат совпадал с тем,
// что даёт браузер там, где фильтр работает.

type Mat = readonly number[]; // 3×3, по строкам

const IDENT: Mat = [1, 0, 0, 0, 1, 0, 0, 0, 1];

const SEPIA_FULL: Mat = [
  0.393, 0.769, 0.189,
  0.349, 0.686, 0.168,
  0.272, 0.534, 0.131,
];

const mix = (a: Mat, b: Mat, t: number): Mat => a.map((v, i) => v + (b[i] - v) * t);

export const sepia = (amount: number): Mat => mix(IDENT, SEPIA_FULL, amount);

export const saturate = (s: number): Mat => [
  0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
];

export const hueRotate = (deg: number): Mat => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
  ];
};

/** Произведение матриц: применяются слева направо, как в строке filter. */
export const compose = (...ms: Mat[]): Mat =>
  ms.reduce((acc, m) => {
    const out = new Array<number>(9);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        out[r * 3 + c] = m[r * 3] * acc[c] + m[r * 3 + 1] * acc[3 + c] + m[r * 3 + 2] * acc[6 + c];
      }
    }
    return out;
  }, IDENT);

export interface Tint {
  /** Инвертировать яркость до матрицы (invert(1) в начале цепочки). */
  invert?: boolean;
  matrix: Mat;
  /** Множитель яркости после матрицы. */
  brightness?: number;
  /** Контраст после яркости. */
  contrast?: number;
}

/** Собор: invert(1) sepia(1) saturate(1.25) hue-rotate(8deg) brightness(2.08) contrast(1.3) */
export const CATHEDRAL: Tint = {
  invert: true,
  matrix: compose(sepia(1), saturate(1.25), hueRotate(8)),
  brightness: 2.08,
  contrast: 1.3,
};

/** Бумага — тот же фильтр, что у .cinebg-tex на сайте. */
export const PAPER: Tint = {
  matrix: compose(sepia(0.45), hueRotate(-5), saturate(1.15)),
};

const clamp255 = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Применяет перекраску на месте, к сырым данным ImageData. */
export function applyTint(d: Uint8ClampedArray, t: Tint): void {
  const m = t.matrix;
  const br = t.brightness ?? 1;
  const ct = t.contrast ?? 1;
  const shift = (0.5 - 0.5 * ct) * 255;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    if (t.invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }
    const nr = m[0] * r + m[1] * g + m[2] * b;
    const ng = m[3] * r + m[4] * g + m[5] * b;
    const nb = m[6] * r + m[7] * g + m[8] * b;
    d[i] = clamp255(nr * br * ct + shift);
    d[i + 1] = clamp255(ng * br * ct + shift);
    d[i + 2] = clamp255(nb * br * ct + shift);
  }
}

/**
 * Перекрашенная копия исходника. Считается один раз: изображение маленькое,
 * а результат переиспользуется при каждом resize.
 */
export function bake(img: HTMLImageElement, t: Tint): HTMLCanvasElement | null {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, w);
  cv.height = Math.max(1, h);
  const g = cv.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, cv.width, cv.height);
  applyTint(data.data, t);
  g.putImageData(data, 0, 0);
  return cv;
}
