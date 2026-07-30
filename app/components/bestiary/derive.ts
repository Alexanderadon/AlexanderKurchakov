// Карты рельефа, выведенные ИЗ цветной текстуры.
//
// Зачем, если карты можно сгенерировать. Потому что сгенерированные независимо
// цветная текстура и карта нормалей не совпадают: рельеф оказывается не там, где
// рисунок. Замер на нашей обложке дал корреляцию 0.12 — то есть карты почти
// независимы, и именно это читается как каша: свет ложится по одному узору, а
// золото нарисовано по другому.
//
// Выведенная карта совпадает с рисунком ПО ПОСТРОЕНИЮ. Она грубее нарисованной
// (не знает, что выпуклое, а что просто светлое), но врать про положение рельефа
// не может.
//
// Порядок такой: яркость -> высота -> нормаль как градиент высоты. Размытие между
// первым и вторым шагом обязательно: без него каждая крупинка шума становится
// шипом, и поверхность выходит колючей.

import { Texture } from "three";

/** Ниже этого — фон, выше — рельеф. Снято замером: кожа ~0.08, золото ~0.5. */
const LOW = 0.13;
const HIGH = 0.44;

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function luminanceField(src: TexImageSource, W: number, H: number): Float32Array | null {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  if (!g) return null;
  g.imageSmoothingQuality = "high";
  g.drawImage(src as CanvasImageSource, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  const out = new Float32Array(W * H);
  for (let i = 0, k = 0; i < d.length; i += 4, k++) {
    out[k] = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
  }
  return out;
}

/** Размытие в два прохода: O(n·r) вместо O(n·r²), результат тот же. */
function blur(f: Float32Array, W: number, H: number, r: number): Float32Array {
  const t = new Float32Array(W * H);
  const o = new Float32Array(W * H);
  const n = r * 2 + 1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += f[y * W + Math.min(W - 1, Math.max(0, x + k))];
      t[y * W + x] = s / n;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += t[Math.min(H - 1, Math.max(0, y + k)) * W + x];
      o[y * W + x] = s / n;
    }
  }
  return o;
}

export interface Derived {
  /** Карта высот для displacementMap: чёрный низ, белый верх. */
  height: Texture;
  /** Карта нормалей, совпадающая с рисунком по построению. */
  normal: Texture;
}

/**
 * Считает высоту и нормаль из цветной текстуры.
 *
 * strength — крутизна склонов в нормали. Выше значит резче свет на кромках
 * тиснения, но и заметнее шум подложки.
 */
export function deriveMaps(src: TexImageSource, width = 768, strength = 2.6): Derived | null {
  const iw = (src as HTMLImageElement).naturalWidth || (src as HTMLCanvasElement).width;
  const ih = (src as HTMLImageElement).naturalHeight || (src as HTMLCanvasElement).height;
  if (!iw || !ih) return null;
  const W = width;
  const H = Math.round((width * ih) / iw);

  const lum = luminanceField(src, W, H);
  if (!lum) return null;
  const soft = blur(lum, W, H, 2);

  const hcv = document.createElement("canvas");
  hcv.width = W;
  hcv.height = H;
  const hg = hcv.getContext("2d");
  const ncv = document.createElement("canvas");
  ncv.width = W;
  ncv.height = H;
  const ng = ncv.getContext("2d");
  if (!hg || !ng) return null;

  const hImg = hg.createImageData(W, H);
  const nImg = ng.createImageData(W, H);
  const at = (x: number, y: number): number =>
    smoothstep(LOW, HIGH, soft[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))]);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h = at(x, y);
      const k = (y * W + x) * 4;
      const v = Math.round(h * 255);
      hImg.data[k] = v;
      hImg.data[k + 1] = v;
      hImg.data[k + 2] = v;
      hImg.data[k + 3] = 255;

      // Собель по высоте: наклон поверхности и есть нормаль.
      const dx =
        (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) -
          at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)) / 4;
      const dy =
        (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) -
          at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)) / 4;
      const nx = -dx * strength;
      const ny = -dy * strength;
      const len = Math.hypot(nx, ny, 1);
      nImg.data[k] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      nImg.data[k + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      nImg.data[k + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      nImg.data[k + 3] = 255;
    }
  }
  hg.putImageData(hImg, 0, 0);
  ng.putImageData(nImg, 0, 0);

  const height = new Texture(hcv);
  height.needsUpdate = true;
  const normal = new Texture(ncv);
  normal.needsUpdate = true;
  return { height, normal };
}
