// Обрез блока, построенный КОДОМ.
//
// Отдельный файл-текстура тут не нужен: обрез — это регулярные вертикальные
// кромки листов с разбросом по толщине и светлоте, а такое рисуется процедурно
// точнее, чем генерируется картинкой. Гарантируется стыковка по горизонтали
// (иначе на обрезе виден шов), любое разрешение и ноль байт трафика.
//
// Из той же картинки снимается карта нормалей: наклон по X берётся разностью
// соседних пикселей по яркости. Поэтому кромки не нарисованные, а ловящие свет —
// именно этого не хватало, когда обрез был однотонной плитой.

import { RepeatWrapping, SRGBColorSpace, Texture } from "three";

const W = 1024;
const H = 64;

/** Детерминированный шум: обрез одинаков при каждой загрузке. */
const rnd = (i: number): number => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

export interface EdgeMaps {
  map: Texture;
  normal: Texture;
}

export function makeEdgeMaps(): EdgeMaps | null {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  if (!g) return null;

  g.fillStyle = "#8d8778";
  g.fillRect(0, 0, W, H);

  let x = 0;
  let i = 0;
  while (x < W) {
    const w = 1 + Math.floor(rnd(i) * 2.2); // толщина листа
    const gap = rnd(i + 91) < 0.13 ? 2 : 0; // редкий выступающий лист
    const v = 0.62 + rnd(i + 7) * 0.34; // светлота кромки
    const soil = rnd(i + 313) < 0.05 ? 0.7 : 1; // потемневшие полосы
    const c = Math.round(210 * v * soil);
    g.fillStyle = `rgb(${c},${Math.round(c * 0.97)},${Math.round(c * 0.88)})`;
    g.fillRect(x, 0, w, H);
    // Тёмная щель между листами — то, из чего и складывается ощущение стопки.
    g.fillStyle = "rgba(20,19,15,0.55)";
    g.fillRect(x + w, 0, 1, H);
    x += w + 1 + gap;
    i++;
  }

  const map = new Texture(cv);
  map.colorSpace = SRGBColorSpace;
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.needsUpdate = true;

  // ── Карта нормалей из яркости. Кромки строго вертикальны, поэтому по Y наклона
  // нет и зелёный канал остаётся ровно 128 — «нулевой наклон».
  const src = g.getImageData(0, 0, W, H).data;
  const ncv = document.createElement("canvas");
  ncv.width = W;
  ncv.height = H;
  const ng = ncv.getContext("2d");
  if (!ng) return null;
  const out = ng.createImageData(W, H);
  const lum = (px: number, py: number): number => {
    const k = ((py + H) % H) * W * 4 + ((((px % W) + W) % W) * 4);
    return (src[k] * 0.299 + src[k + 1] * 0.587 + src[k + 2] * 0.114) / 255;
  };
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const dx = (lum(px + 1, py) - lum(px - 1, py)) * 2.2;
      const nx = Math.max(-1, Math.min(1, -dx));
      const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx));
      const k = (py * W + px) * 4;
      out.data[k] = Math.round((nx * 0.5 + 0.5) * 255);
      out.data[k + 1] = 128;
      out.data[k + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      out.data[k + 3] = 255;
    }
  }
  ng.putImageData(out, 0, 0);
  const normal = new Texture(ncv);
  normal.wrapS = RepeatWrapping;
  normal.wrapT = RepeatWrapping;
  normal.needsUpdate = true;

  return { map, normal };
}
