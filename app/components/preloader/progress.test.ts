import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIMING,
  initialCounter,
  progressTarget,
  smoothstep,
  stepCounter,
  type ProgressTiming,
} from "./progress";

const T: ProgressTiming = DEFAULT_TIMING;
/** Прогон счётчика до 100 при заданной частоте кадров. Возвращает время, мс. */
function runToFull(hz: number, readyAtMs: number, rand: () => number = () => 0.5): number {
  const dt = 1000 / hz;
  let c = initialCounter();
  let el = 0;
  for (let i = 0; i < 100_000 && c.pct < 100; i++) {
    el += dt;
    c = stepCounter(c, progressTarget(el, Math.min(1, el / readyAtMs), T), dt, rand);
  }
  return el;
}

describe("progressTarget", () => {
  it("не пускает счётчик вперёд минимального времени, даже если всё готово", () => {
    expect(progressTarget(0, 1, T)).toBe(0);
    expect(progressTarget(T.minMs / 2, 1, T)).toBeCloseTo(50, 5);
    expect(progressTarget(T.minMs, 1, T)).toBe(100);
  });

  it("держится за реальную готовность, пока она ниже временного пола", () => {
    // прошла половина минимума, но загружено только 20%
    expect(progressTarget(T.minMs / 2, 0.2, T)).toBeCloseTo(20, 5);
  });

  it("всё равно доходит до 100 к потолку, если загрузка зависла", () => {
    expect(progressTarget(T.maxMs, 0, T)).toBe(100);
    expect(progressTarget(T.maxMs * 2, 0, T)).toBe(100);
  });

  it("монотонен по времени", () => {
    let prev = -1;
    for (let t = 0; t <= T.maxMs * 1.5; t += 25) {
      const v = progressTarget(t, 0.4, T);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it("не выходит за 0..100 при мусорных входах", () => {
    expect(progressTarget(-500, 5, T)).toBe(0);
    expect(progressTarget(1000, -3, T)).toBeGreaterThanOrEqual(0);
    expect(progressTarget(1e9, 1, T)).toBe(100);
  });
});

describe("stepCounter", () => {
  it("никогда не идёт назад", () => {
    let c = initialCounter(60);
    c = stepCounter(c, 10, 16, () => 1); // цель ниже текущего
    expect(c.pct).toBeGreaterThanOrEqual(60);
  });

  it("не перепрыгивает цель", () => {
    let c = initialCounter(0);
    for (let i = 0; i < 500; i++) c = stepCounter(c, 42, 16, () => 1);
    expect(c.pct).toBeLessThanOrEqual(42);
  });

  it("пауза замораживает показание, а не откатывает", () => {
    const held = stepCounter({ pct: 33, holdMs: 200 }, 100, 16, () => 1);
    expect(held.pct).toBe(33);
    expect(held.holdMs).toBe(184);
  });

  it("гасит скачок dt после сна вкладки", () => {
    const a = stepCounter(initialCounter(0), 100, 5000, () => 1);
    const b = stepCounter(initialCounter(0), 100, 100, () => 1);
    expect(a.pct).toBeCloseTo(b.pct, 10);
  });

  it("щёлкает ровно в 100, а не застревает на 99.7", () => {
    let c = initialCounter(99.5);
    c = stepCounter(c, 100, 16, () => 1);
    expect(c.pct).toBe(100);
  });
});

describe("длительность прелоадера", () => {
  // Главный регресс, ради которого всё переписывалось: раньше счётчик рос на
  // КАДР и занимал 8.8 с на 60 Гц против 3.7 с на 144 Гц.
  it("не зависит от частоты кадров", () => {
    const at60 = runToFull(60, 600);
    const at144 = runToFull(144, 600);
    const at30 = runToFull(30, 600);
    for (const v of [at30, at144]) expect(Math.abs(v - at60) / at60).toBeLessThan(0.1);
  });

  it("укладывается в разумное время при быстрой загрузке", () => {
    const ms = runToFull(60, 300);
    expect(ms).toBeGreaterThan(T.minMs * 0.9); // не мигнул
    expect(ms).toBeLessThan(2600); // и не утомил
  });

  it("завершается даже если ассеты не пришли никогда", () => {
    const ms = runToFull(60, Number.POSITIVE_INFINITY);
    expect(Number.isFinite(ms)).toBe(true);
    expect(ms).toBeLessThan(T.maxMs + 1500);
  });

  it("ждёт медленную сеть, но не сверх потолка", () => {
    const ms = runToFull(60, 2500);
    expect(ms).toBeGreaterThan(2400);
    expect(ms).toBeLessThan(T.maxMs + 1000);
  });
});

describe("smoothstep", () => {
  it("зажат в 0..1 и симметричен", () => {
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 10);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(2)).toBe(1);
    expect(smoothstep(0.25) + smoothstep(0.75)).toBeCloseTo(1, 10);
  });
});
