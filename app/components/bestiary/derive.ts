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

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Поле высоты из цвета. Одной яркости мало: тёмная трещина кожи и тёмный участок
 * золота дают одно и то же число, а физически это впадина и выступ.
 *
 * Различаем по ТЕПЛОТЕ. Золото тиснения тёплое — красного заметно больше синего.
 * Кожа и трещины нейтральные. Поэтому высота складывается из двух вкладов:
 * тёплое поднимаем сильно, нейтральное светлое — слабо, нейтральное тёмное
 * опускаем ниже нуля, в углубление.
 */
function heightField(
  src: TexImageSource,
  W: number,
  H: number,
): { h: Float32Array; gold: Float32Array } | null {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  if (!g) return null;
  g.imageSmoothingQuality = "high";
  g.drawImage(src as CanvasImageSource, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  const out = new Float32Array(W * H);
  const gold = new Float32Array(W * H);
  for (let i = 0, k = 0; i < d.length; i += 4, k++) {
    const r = d[i] / 255;
    const g = d[i + 1] / 255;
    const b = d[i + 2] / 255;
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    // Теплота: у золота красного заметно больше синего, у кожи разница около нуля.
    const warm = Math.max(0, r - b);
    // Тиснение — там, где ярко И тепло. Просто яркое (блик на коже) не поднимаем.
    const relief = smoothstep(0.1, 0.42, lum) * smoothstep(0.02, 0.13, warm);
    // Трещины: тёмное и холодное уходит НИЖЕ поверхности, а не остаётся на нуле.
    const crack = (1 - smoothstep(0.03, 0.16, lum)) * (1 - smoothstep(0.02, 0.1, warm));
    out[k] = relief - crack * 0.35;
    // Маска золота нужна отдельно: из неё собираются карты металличности и
    // шероховатости — металл там же, где рисунок, по построению.
    gold[k] = relief;
  }
  return { h: out, gold };
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
  /** Карта металличности: золото — металл, кожа — нет. */
  metal: Texture;
  /** Карта шероховатости: золото полировано, кожа матовая. */
  rough: Texture;
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

  const fields = heightField(src, W, H);
  if (!fields) return null;
  const soft = blur(fields.h, W, H, 2);
  // Золото размывается чуть-чуть: границе металла нужна резкость, но без
  // размытия каждая крупинка мерцает на бликах.
  const goldSoft = blur(fields.gold, W, H, 1);

  const hcv = document.createElement("canvas");
  hcv.width = W;
  hcv.height = H;
  const hg = hcv.getContext("2d");
  const ncv = document.createElement("canvas");
  ncv.width = W;
  ncv.height = H;
  const ng = ncv.getContext("2d");
  const mcv = document.createElement("canvas");
  mcv.width = W;
  mcv.height = H;
  const mg = mcv.getContext("2d");
  const rcv = document.createElement("canvas");
  rcv.width = W;
  rcv.height = H;
  const rg = rcv.getContext("2d");
  if (!hg || !ng || !mg || !rg) return null;

  const hImg = hg.createImageData(W, H);
  const nImg = ng.createImageData(W, H);
  const mImg = mg.createImageData(W, H);
  const rImg = rg.createImageData(W, H);
  // Поле уже нормировано в heightField: пороги там же, здесь только зажим.
  const at = (x: number, y: number): number => {
    const v = soft[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
    return Math.min(1, Math.max(0, v * 0.74 + 0.26));
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h = at(x, y);
      const k = (y * W + x) * 4;
      const v = Math.round(h * 255);
      hImg.data[k] = v;
      hImg.data[k + 1] = v;
      hImg.data[k + 2] = v;
      hImg.data[k + 3] = 255;

      // Металличность и шероховатость из маски золота. Материал ставит оба
      // параметра в единицу, значения целиком живут в картах: кожа — матовый
      // диэлектрик, тиснение — полированный металл, который и ловит окружение.
      const gld = goldSoft[y * W + x];
      const mv = Math.round(Math.min(1, 0.06 + 0.9 * gld) * 255);
      const rv = Math.round(Math.min(1, Math.max(0, 0.78 - 0.5 * gld)) * 255);
      mImg.data[k] = mv;
      mImg.data[k + 1] = mv;
      mImg.data[k + 2] = mv;
      mImg.data[k + 3] = 255;
      rImg.data[k] = rv;
      rImg.data[k + 1] = rv;
      rImg.data[k + 2] = rv;
      rImg.data[k + 3] = 255;

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
  mg.putImageData(mImg, 0, 0);
  rg.putImageData(rImg, 0, 0);

  const height = new Texture(hcv);
  height.needsUpdate = true;
  const normal = new Texture(ncv);
  normal.needsUpdate = true;
  const metal = new Texture(mcv);
  metal.needsUpdate = true;
  const rough = new Texture(rcv);
  rough.needsUpdate = true;
  return { height, normal, metal, rough };
}
