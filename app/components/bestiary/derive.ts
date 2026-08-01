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
import { ctx2d, scratch } from "./scratch";

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
  const cv = scratch(W, H);
  const g = ctx2d(cv);
  if (!g) return null;
  g.imageSmoothingQuality = "high";
  // ImageBitmap приходит из воркера УЖЕ перевёрнутым: WebGL игнорирует для него
  // флаг переворота, и битмапы разворачивают на декоде — иначе обложка вставала
  // вверх ногами. Но ЗДЕСЬ пиксели читает процессор, ему нужен исходный верх:
  // карты рельефа строятся в координатах картинки и переворачиваются потом,
  // при заливке холста в текстуру, как у всех. Без обратного разворота тиснение
  // считалось из зеркала — призрак «BESTIARIUM» на коже читался задом наперёд.
  // Главного потока это не касается: там источники — HTMLImageElement.
  const flipped = typeof ImageBitmap !== "undefined" && src instanceof ImageBitmap;
  if (flipped) {
    g.translate(0, H);
    g.scale(1, -1);
  }
  g.drawImage(src as CanvasImageSource, 0, 0, W, H);
  if (flipped) g.setTransform(1, 0, 0, 1, 0, 0);
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

  const hcv = scratch(W, H);
  const hg = ctx2d(hcv);
  const ncv = scratch(W, H);
  const ng = ctx2d(ncv);
  const mcv = scratch(W, H);
  const mg = ctx2d(mcv);
  const rcv = scratch(W, H);
  const rg = ctx2d(rcv);
  if (!hg || !ng || !mg || !rg) return null;

  const hImg = hg.createImageData(W, H);
  const nImg = ng.createImageData(W, H);
  const mImg = mg.createImageData(W, H);
  const rImg = rg.createImageData(W, H);
  // ЗАГОТОВКИ вместо пересчёта в каждом пикселе.
  //
  // Раньше здесь была функция at(x,y), которая на каждый вызов зажимала обе
  // координаты и заново приводила высоту. Собель зовёт её восемь раз, плюс
  // девятый — для самой высоты: на 768×1110 это девять миллионов вызовов с
  // четырьмя Math.min/max каждый. Приводим поле ОДИН раз, а соседей берём
  // прямым индексом.
  const hh = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const v = soft[i] * 0.74 + 0.26;
    hh[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  // Износ и «пятна» раскладываются на произведение множителя по столбцу и
  // множителя по строке — значит считаются W + H раз, а не W·H.
  const colBorder = new Float32Array(W);
  const colPatch = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    colBorder[x] = smoothstep(0, 0.055, Math.min(x, W - 1 - x) / W);
    colPatch[x] = Math.sin(x * 0.011 + 3.1);
  }

  for (let y = 0; y < H; y++) {
    const rowUp = (y > 0 ? y - 1 : 0) * W;
    const row = y * W;
    const rowDn = (y < H - 1 ? y + 1 : H - 1) * W;
    const rowBorder = smoothstep(0, 0.075, Math.min(y, H - 1 - y) / H);
    const rowPatch = Math.sin(y * 0.014 + 1.2);
    for (let x = 0; x < W; x++) {
      const xm = x > 0 ? x - 1 : 0;
      const xp = x < W - 1 ? x + 1 : W - 1;
      const h = hh[row + x];
      const k = (row + x) * 4;
      const v = (h * 255 + 0.5) | 0;
      hImg.data[k] = v;
      hImg.data[k + 1] = v;
      hImg.data[k + 2] = v;
      hImg.data[k + 3] = 255;

      // Металличность и шероховатость из маски золота. Материал ставит оба
      // параметра в единицу, значения целиком живут в картах: кожа — матовый
      // диэлектрик, тиснение — полированный металл, который и ловит окружение.
      //
      // ПОТЁРТОСТИ. У древнего тома позолота не бывает равномерно свежей: у
      // кромок и углов её съедают руки и полка. Вклад золота гасится к границам
      // листа, и не ровной виньеткой, а пятнами — низкочастотный синус даёт
      // неравномерность износа. Стёртое золото заодно матовеет.
      const gld = goldSoft[row + x];
      const border = colBorder[x] * rowBorder;
      const patch = 0.82 + 0.18 * colPatch[x] * rowPatch;
      const wear = Math.min(1, (0.28 + 0.72 * border) * patch);
      const gw = gld * wear;
      const mv = (Math.min(1, 0.06 + 0.9 * gw) * 255 + 0.5) | 0;
      const rv = (Math.min(1, Math.max(0, 0.78 - 0.5 * gw)) * 255 + 0.5) | 0;
      mImg.data[k] = mv;
      mImg.data[k + 1] = mv;
      mImg.data[k + 2] = mv;
      mImg.data[k + 3] = 255;
      rImg.data[k] = rv;
      rImg.data[k + 1] = rv;
      rImg.data[k + 2] = rv;
      rImg.data[k + 3] = 255;

      // Собель по высоте: наклон поверхности и есть нормаль.
      const nw = hh[rowUp + xm];
      const nn = hh[rowUp + x];
      const ne = hh[rowUp + xp];
      const ww = hh[row + xm];
      const ee = hh[row + xp];
      const sw = hh[rowDn + xm];
      const ss = hh[rowDn + x];
      const se = hh[rowDn + xp];
      const dx = (ne + 2 * ee + se - nw - 2 * ww - sw) / 4;
      const dy = (sw + 2 * ss + se - nw - 2 * nn - ne) / 4;
      const nx = -dx * strength;
      const ny = -dy * strength;
      // sqrt, а не hypot: hypot в V8 масштабирует аргументы ради защиты от
      // переполнения, которого здесь быть не может — оба слагаемых меньше пяти.
      const inv = 0.5 / Math.sqrt(nx * nx + ny * ny + 1);
      nImg.data[k] = (((nx * inv + 0.5) * 255) + 0.5) | 0;
      nImg.data[k + 1] = (((ny * inv + 0.5) * 255) + 0.5) | 0;
      nImg.data[k + 2] = (((inv + 0.5) * 255) + 0.5) | 0;
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
