import { describe, expect, it } from "vitest";
import { CATHEDRAL, PAPER, applyTint, compose, hueRotate, saturate, sepia } from "./tint";

/** Прогоняет один пиксель через перекраску. */
function px(r: number, g: number, b: number, t = CATHEDRAL): [number, number, number] {
  const d = new Uint8ClampedArray([r, g, b, 255]);
  applyTint(d, t);
  return [d[0], d[1], d[2]];
}

const lum = ([r, g, b]: number[]): number => (r * 0.299 + g * 0.587 + b * 0.114) / 255;

describe("матрицы", () => {
  it("нулевые величины дают тождество", () => {
    const ident = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    for (const m of [sepia(0), saturate(1), hueRotate(0)]) {
      m.forEach((v, i) => expect(v).toBeCloseTo(ident[i], 5));
    }
  });

  it("композиция тождеств — тождество", () => {
    compose(sepia(0), saturate(1), hueRotate(0)).forEach((v, i) =>
      expect(v).toBeCloseTo([1, 0, 0, 0, 1, 0, 0, 0, 1][i], 5),
    );
  });

  it("sepia уводит серое в тёплое", () => {
    const grey = 128;
    const m = sepia(1);
    const r = m[0] * grey + m[1] * grey + m[2] * grey;
    const b = m[6] * grey + m[7] * grey + m[8] * grey;
    expect(r).toBeGreaterThan(b); // красного больше синего
  });
});

describe("перекраска собора", () => {
  // Ровно тот баг, что был виден на iPhone: без инверсии белый фон чертежа
  // ложился аддитивно светлым прямоугольником в пол-экрана.
  it("белый фон чертежа становится чёрным", () => {
    const out = px(255, 255, 255);
    expect(lum(out)).toBeLessThan(0.06);
  });

  it("почти белый фон тоже гасится", () => {
    // 230 — это уже слабая линия, а не фон: она обязана слегка светиться
    for (const v of [255, 252, 248]) expect(lum(px(v, v, v))).toBeLessThan(0.12);
    expect(lum(px(230, 230, 230))).toBeGreaterThan(0.1);
  });

  // Линии чертежа лежат в верхней части диапазона (светло-серое по белому) —
  // именно там перекраска и работает. Всё, что темнее ~190, после brightness
  // уходит в насыщение: так же ведёт себя и настоящий CSS-фильтр, поэтому
  // проверяем на реальных значениях, а не на выдуманных.
  it("линия чертежа становится золотой", () => {
    const out = px(200, 200, 200);
    expect(lum(out)).toBeGreaterThan(0.4); // светится
    expect(out[0]).toBeGreaterThan(out[1]); // R > G
    expect(out[1]).toBeGreaterThan(out[2]); // G > B — тёплый, а не серый
  });

  it("оттенок садится в --fire #A8935F", () => {
    // сравниваем пропорции каналов, а не абсолют: яркость зависит от исходника
    const out = px(210, 210, 210);
    expect(out[1] / out[0]).toBeCloseTo(147 / 168, 1);
    expect(out[2] / out[0]).toBeCloseTo(95 / 168, 1);
  });

  it("монотонна в рабочем диапазоне: чем темнее линия, тем ярче результат", () => {
    let prev = -1;
    for (const v of [255, 240, 225, 210, 195]) {
      const l = lum(px(v, v, v));
      expect(l).toBeGreaterThanOrEqual(prev);
      prev = l;
    }
  });

  it("средние серые уходят в насыщение — как и в CSS-фильтре", () => {
    // задокументировано намеренно: это не баг перекраски, а поведение цепочки
    // invert → sepia → brightness(2.08), одинаковое с браузерным фильтром
    expect(lum(px(120, 120, 120))).toBe(1);
  });

  it("не выходит за границы байта", () => {
    for (const v of [0, 1, 127, 254, 255]) {
      for (const c of px(v, v, v)) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(255);
      }
    }
  });

  it("альфа не трогается", () => {
    const d = new Uint8ClampedArray([10, 20, 30, 77]);
    applyTint(d, CATHEDRAL);
    expect(d[3]).toBe(77);
  });
});

describe("перекраска бумаги", () => {
  it("не инвертирует: тёмная фактура остаётся тёмной", () => {
    expect(lum(px(20, 20, 20, PAPER))).toBeLessThan(0.15);
    expect(lum(px(230, 230, 230, PAPER))).toBeGreaterThan(0.7);
  });

  it("уводит в тепло, как sepia на сайте", () => {
    const out = px(128, 128, 128, PAPER);
    expect(out[0]).toBeGreaterThan(out[2]);
  });
});
