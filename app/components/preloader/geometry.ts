// Геометрия сцены: где стоит глаз и какого размера собор. Обе величины нужны
// и рисованию, и раскладке слов, поэтому вынесены отдельно и покрыты тестами.
import type { Viewport } from "./words";

/** Узкий макет: телефон или планшет в портрете. */
export const isNarrow = (w: number, h: number): boolean => w < 620 || h > w * 1.05;

export interface EyeMetrics {
  /** Общий масштаб глаза. */
  s: number;
  /** Размер холста глаза, CSS-пиксели. */
  w: number;
  h: number;
  /** Положение холста. */
  left: number;
  top: number;
  /** Центр и половина высоты видимой части — для раскладки слов. */
  cy: number;
  hh: number;
}

export function eyeMetrics(vp: Viewport): EyeMetrics {
  const s = Math.max(
    0.26,
    vp.narrow
      ? Math.min(vp.w / 860, vp.h / 1500)
      : Math.max(0.32, Math.min(vp.w / 1100, vp.h / 900) * 0.82),
  );
  const w = Math.round(800 * s);
  const h = Math.round(470 * s);
  const left = Math.round(vp.w * 0.5 - w / 2);
  const top = Math.round((vp.narrow ? vp.h * 0.3 : vp.h * 0.295) - h / 2);
  return { s, w, h, left, top, cy: top + h / 2, hh: 128 * s };
}

export interface CathMetrics {
  /** Линия пола. */
  fy: number;
  w: number;
  h: number;
  left: number;
  top: number;
}

/**
 * На узком экране собор шире экрана и уходит за края — так он читается
 * монументально, а не марочкой в углу.
 */
export function cathMetrics(vp: Viewport, aspect: number): CathMetrics {
  const fy = vp.h * 0.935;
  const w = vp.narrow
    ? Math.min(vp.h * 0.34 * aspect, vp.w * 1.45)
    : Math.min(vp.h * 0.5 * aspect, vp.w * 1.02);
  const h = w / aspect;
  return { fy, w, h, left: (vp.w - w) / 2, top: fy - h * 0.965 };
}

/**
 * Проекция радужки на глазное яблоко. Зрачок — это проекция оси взгляда, а
 * точка радужки считается поворотом шара, поэтому ближняя к нам сторона
 * расходится, а дальняя сжимается и уходит за горизонт.
 *
 * bounds() существует ровно затем, чтобы диск радужки и потоки внутри неё
 * считались ОДНОЙ моделью. Пока диск был простым эллипсом вокруг зрачка, на
 * отводе взгляда модели расходились: вены торчали за край с одной стороны и не
 * доставали до него с другой, а зрачок сидел не в середине радужки.
 */
export interface IrisProjection {
  /** r — расстояние по поверхности от зрачка, a — угол. z<0 значит «за горизонтом». */
  project(r: number, a: number): [number, number, number];
  /** Габариты проекции окружности радиуса r: центр и полуоси. */
  bounds(r: number): { cx: number; cy: number; rx: number; ry: number };
}

export function irisProjection(
  cx: number,
  cy: number,
  iris: number,
  px: number,
  py: number,
): IrisProjection {
  const Rb = iris * 1.22; // радиус яблока
  const sB = Math.max(-0.72, Math.min(0.72, -py / Rb));
  const cB = Math.sqrt(1 - sB * sB);
  const sA = Math.max(-0.82, Math.min(0.82, px / Rb / cB));
  const cA = Math.sqrt(1 - sA * sA);
  const Ux = cA;
  const Uz = -sA;
  const Vx = sA * sB;
  const Vy = cB;
  const Vz = cA * sB;
  const Gx = cB * sA;
  const Gy = -sB;
  const Gz = cB * cA;

  const project = (r: number, a: number): [number, number, number] => {
    const sx = Math.sin(a) * r * 0.62; // радужка — вертикальный овал
    const sy = Math.cos(a) * r;
    const tx = Ux * sx + Vx * sy;
    const ty = Vy * sy;
    const tz = Uz * sx + Vz * sy;
    // sqrt, а не Math.hypot: вызовов тысячи за кадр, hypot в V8 кратно дороже
    const tl = Math.sqrt(tx * tx + ty * ty + tz * tz) / Rb;
    const c = Math.cos(tl);
    const k = tl > 1e-6 ? Math.sin(tl) / (tl * Rb) : 1 / Rb;
    return [cx + Rb * (Gx * c + tx * k), cy + Rb * (Gy * c + ty * k), Gz * c + tz * k];
  };

  return {
    project,
    bounds(r) {
      // Габариты берём выборкой по контуру, а не по четырём точкам на осях:
      // экспоненциальное отображение на сферу даёт не эллипс, а слегка
      // яйцевидную фигуру, и её крайние точки на оси не лежат.
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (let i = 0; i < 48; i++) {
        const [x, y] = project(r, (i / 48) * Math.PI * 2);
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
      // Эллипс, вписанный в габариты, по диагоналям чуть уже фигуры. Раздувать
      // его до полного накрытия нельзя: тогда при взгляде вбок радужка растёт и
      // по вертикали, чего в природе не бывает. Оставляем габариты как есть —
      // и потоки, и край диска к рубежу всё равно гаснут, промах не виден.
      return {
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2,
        rx: Math.max(4, (x1 - x0) / 2),
        ry: Math.max(4, (y1 - y0) / 2),
      };
    },
  };
}

/**
 * Видимость потока по нормированному расстоянию до края радужки (величина в
 * квадрате, как её отдаёт сравнение с эллипсом bounds).
 *
 * Затухание считается ИМЕННО так, а не по расстоянию вдоль поверхности шара:
 * контур проекции — не эллипс, и на косом взгляде поток на том же поверхностном
 * радиусе выходит за диск на 21%. Привязка к границе диска убирает расхождение
 * при любом направлении взгляда по построению.
 */
export const rimFade = (d2: number): number => {
  // Корень обязателен: d2 — квадрат нормированного расстояния, и без него
  // затухание размазывается по всей радужке. Гаснуть должны только внешние 18%
  // радиуса, остальное светит в полную силу.
  const dn = Math.sqrt(Math.max(0, d2));
  return Math.max(0, Math.min(1, (1 - dn) / 0.18));
};

/** Целевая площадь буфера, пикселей. */
export const MAX_BUFFER_PX = 3.2e6;

/**
 * Площадь буфера ограничена: на 4K с dpr 2 это 33 Мпикс, которые мягкому свету
 * ничего не добавляют, а слабую видеокарту кладут.
 *
 * Нижний предел раньше стоял на 0.8 и молча ломал весь расчёт: на 4K формула
 * просила 0.62, floor поднимал до 0.8, и буфер выходил 5.3 Мпикс вместо 3.2 —
 * на две трети больше обещанного. 0.55 держит ограничение вплоть до 4K.
 */
export function bufferDpr(w: number, h: number, devicePixelRatio: number): number {
  const byArea = Math.sqrt(MAX_BUFFER_PX / Math.max(1, w * h));
  return Math.max(0.55, Math.min(devicePixelRatio || 1, 1.75, byArea));
}
