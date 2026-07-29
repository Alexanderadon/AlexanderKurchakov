import { describe, expect, it } from "vitest";
import {
  MAX_BUFFER_PX,
  bufferDpr,
  cathMetrics,
  eyeMetrics,
  irisProjection,
  isNarrow,
} from "./geometry";
import type { Viewport } from "./words";

const vp = (w: number, h: number): Viewport => ({ w, h, narrow: isNarrow(w, h) });

describe("isNarrow", () => {
  it.each([
    [390, 844, true],
    [820, 1180, true],
    [1440, 900, false],
    [1920, 1080, false],
    [600, 400, true], // узкий по ширине даже в альбоме
    [1024, 768, false],
  ])("%ix%i → %s", (w, h, want) => {
    expect(isNarrow(w, h)).toBe(want);
  });
});

describe("eyeMetrics", () => {
  it.each([
    [320, 568],
    [390, 844],
    [820, 1180],
    [1440, 900],
    [1920, 1080],
    [3440, 1440],
  ])("на %ix%i глаз целиком помещается в экран", (w, h) => {
    const m = eyeMetrics(vp(w, h));
    const visibleHalf = (300 + 52) * m.s; // корпус + хвостики
    expect(w / 2 - visibleHalf).toBeGreaterThanOrEqual(0);
    expect(w / 2 + visibleHalf).toBeLessThanOrEqual(w);
    expect(m.top).toBeGreaterThanOrEqual(0);
    expect(m.top + m.h).toBeLessThanOrEqual(h);
  });

  it("холст глаза отцентрован", () => {
    const m = eyeMetrics(vp(1440, 900));
    expect(m.left + m.w / 2).toBeCloseTo(720, 0);
  });

  it("масштаб не проваливается ниже минимума на крошечных экранах", () => {
    expect(eyeMetrics(vp(240, 320)).s).toBeGreaterThanOrEqual(0.26);
  });
});

describe("cathMetrics", () => {
  it.each([
    [390, 844],
    [820, 1180],
    [1440, 900],
    [2560, 1440],
  ])("на %ix%i собор стоит на полу и не выше глаза", (w, h) => {
    const v = vp(w, h);
    const c = cathMetrics(v, 1.9);
    const eye = eyeMetrics(v);
    expect(c.fy).toBeCloseTo(h * 0.935, 5);
    expect(c.top + c.h * 0.965).toBeCloseTo(c.fy, 5);
    // шпиль не должен протыкать глаз
    expect(c.top).toBeGreaterThan(eye.cy + eye.hh * 0.9);
  });

  it("на узком экране выходит за края — так он монументален", () => {
    const c = cathMetrics(vp(390, 844), 1.9);
    expect(c.w).toBeGreaterThan(390);
    expect(c.left).toBeLessThan(0);
  });

  it("на широком не вылезает за экран", () => {
    const c = cathMetrics(vp(1920, 1080), 1.9);
    expect(c.w).toBeLessThanOrEqual(1920 * 1.02 + 0.001);
  });
});

describe("irisProjection", () => {
  const IRIS = 126;
  const R = IRIS * 0.92;
  // весь диапазон отвода взгляда: влево, вправо, вверх, вниз и по диагонали
  const GAZES: [number, number][] = [
    [0, 0],
    [30, 0],
    [-30, 0],
    [78, 0],
    [-78, 0],
    [0, 40],
    [0, -40],
    [60, 30],
    [-60, -30],
  ];

  it.each([...GAZES, [78, 40] as [number, number], [-78, -40] as [number, number]])(
    "при взгляде (%i, %i) диск радужки совпадает с пятном потоков",
    (px, py) => {
      // Ровно тот баг, который поймал пользователь: диск считался эллипсом
      // ВОКРУГ ЗРАЧКА, а потоки — проекцией на сферу. На отводе взгляда центры
      // расходились: с одной стороны потоки торчали за край, с другой оставалось
      // пустое поле, и зрачок сидел не в середине радужки.
      const p = irisProjection(0, 0, IRIS, px, py);
      const b = p.bounds(R);
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i < 360; i++) {
        const [x, y] = p.project(R, (i / 360) * Math.PI * 2);
        x0 = Math.min(x0, x); x1 = Math.max(x1, x);
        y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      // центр диска берётся из проекции, а не из положения зрачка
      expect(b.cx).toBeCloseTo((x0 + x1) / 2, 1);
      expect(b.cy).toBeCloseTo((y0 + y1) / 2, 1);
      expect(b.rx).toBeCloseTo((x1 - x0) / 2, 1);
      expect(b.ry).toBeCloseTo((y1 - y0) / 2, 1);
    },
  );

  it("на отводе взгляда центр радужки НЕ совпадает со зрачком", () => {
    // если бы совпадал — вернулся бы исходный баг
    const p = irisProjection(0, 0, IRIS, 78, 0);
    const b = p.bounds(R);
    const [pupilX] = p.project(0, 0);
    expect(Math.abs(pupilX - b.cx)).toBeGreaterThan(4);
  });

  it.each(GAZES)("при взгляде (%i, %i) радужка не больше самих потоков", (px, py) => {
    // обратная сторона: пустое поле между венами и краем диска тоже видно
    const p = irisProjection(0, 0, IRIS, px, py);
    const b = p.bounds(R);
    let maxD = 0;
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const [x, y] = p.project(R, a);
      maxD = Math.max(maxD, ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2);
    }
    expect(maxD).toBeGreaterThan(0.97);
  });

  it("зрачок всегда внутри радужки", () => {
    for (const [px, py] of GAZES) {
      const p = irisProjection(0, 0, IRIS, px, py);
      const b = p.bounds(R);
      const [x, y] = p.project(0, 0); // зрачок — проекция оси взгляда
      const d = ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2;
      expect(d, `зрачок вылез при (${px}, ${py})`).toBeLessThan(0.9);
    }
  });

  it("на отводе взгляда радужка сжимается по горизонтали", () => {
    const straight = irisProjection(0, 0, IRIS, 0, 0).bounds(R);
    const aside = irisProjection(0, 0, IRIS, 78, 0).bounds(R);
    expect(aside.rx).toBeLessThan(straight.rx * 0.92);
    expect(aside.ry).toBeCloseTo(straight.ry, 0); // по вертикали почти не меняется
  });

  it("дальняя от нас сторона уходит за горизонт шара", () => {
    const p = irisProjection(0, 0, IRIS, 78, 0); // взгляд вправо
    const far = p.project(IRIS * 1.4, Math.PI / 2); // дальний край — по ходу взгляда
    const near = p.project(IRIS * 1.4, -Math.PI / 2);
    expect(far[2]).toBeLessThan(0.4); // почти на горизонте
    expect(near[2]).toBeGreaterThan(0.9); // ближний край смотрит прямо на нас
    expect(far[2]).toBeLessThan(near[2]);
  });

  it("прямой взгляд даёт симметричную радужку", () => {
    const b = irisProjection(100, 200, IRIS, 0, 0).bounds(R);
    expect(b.cx).toBeCloseTo(100, 6);
    expect(b.cy).toBeCloseTo(200, 6);
  });
});

describe("bufferDpr", () => {
  it.each([
    [1440, 900, 2],
    [1920, 1080, 2],
    [2560, 1440, 2],
    [3840, 2160, 2],
  ])("держит площадь буфера в пределах цели на %ix%i", (w, h, dpr) => {
    const d = bufferDpr(w, h, dpr);
    expect(w * d * (h * d)).toBeLessThanOrEqual(MAX_BUFFER_PX * 1.05);
  });

  it("не раздувает буфер сверх devicePixelRatio", () => {
    expect(bufferDpr(1280, 720, 1)).toBeLessThanOrEqual(1);
    expect(bufferDpr(400, 800, 3)).toBeLessThanOrEqual(1.75);
  });

  it("на 8K упирается в нижний предел, но не уходит ниже", () => {
    expect(bufferDpr(7680, 4320, 2)).toBe(0.55);
  });

  it("устойчив к нулям", () => {
    expect(Number.isFinite(bufferDpr(0, 0, 0))).toBe(true);
  });
});
