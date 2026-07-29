import { describe, expect, it } from "vitest";
import { STAGES, WORDS, layoutWords, placeWords, stageAt, type Viewport } from "./words";
import { cathMetrics, eyeMetrics, isNarrow } from "./geometry";

const vp = (w: number, h: number): Viewport => ({ w, h, narrow: isNarrow(w, h) });
const SCREENS: [string, number, number][] = [
  ["ноутбук", 1440, 900],
  ["десктоп", 1920, 1080],
  ["4K", 2560, 1440],
  ["широкий", 3440, 1440],
  ["планшет портрет", 820, 1180],
  ["телефон", 390, 844],
  ["мелкий телефон", 320, 568],
];

function place(w: number, h: number) {
  const v = vp(w, h);
  const eye = eyeMetrics(v);
  const cath = cathMetrics(v, 1.9);
  const l = layoutWords(v, eye, cath.top, cath.fy);
  return { v, eye, cath, l, words: placeWords(v, l) };
}

describe("словарь", () => {
  // Пользователь дважды прочитал стилизацию как опечатку: сперва дореформенный
  // русский, потом римскую эпиграфику. Надпись, которую принимают за ошибку,
  // ошибкой и является — поэтому в латыни только U и одна орфография на всё.
  it("в латыни нет римского V вместо U", () => {
    const latin = WORDS.filter((w) => /^[A-Z ]+$/.test(w.t));
    expect(latin.length).toBeGreaterThan(0);
    for (const w of latin) {
      expect(w.t, `${w.t}: V вместо U`).not.toMatch(/V[SM]\b/);
      expect(w.t).not.toMatch(/^V(MBRA|X)/);
    }
    expect(WORDS.map((w) => w.t)).toContain("ABYSSUS");
    expect(WORDS.map((w) => w.t)).toContain("UMBRA");
    expect(WORDS.map((w) => w.t)).toContain("SILENTIUM");
  });

  it("подписи стадий в той же орфографии, что и слова", () => {
    for (const [, lat] of STAGES) expect(lat).not.toMatch(/V[SM]\b/);
    expect(STAGES.map((s) => s[1])).toContain("lumen");
  });

  it("у каждого латинского слова есть перевод", () => {
    for (const w of WORDS) {
      if (/^[A-Z ]+$/.test(w.t)) expect(w.ru, `${w.t} без перевода`).toBeTruthy();
    }
  });

  it("стадии идут по возрастанию и покрывают весь диапазон", () => {
    for (let i = 1; i < STAGES.length; i++) expect(STAGES[i][0]).toBeGreaterThan(STAGES[i - 1][0]);
    expect(stageAt(0)[1]).toBe("tenebrae");
    expect(stageAt(100)[1]).toBe("advenit");
    expect(stageAt(50)[1]).toBe("columnae");
  });
});

describe("раскладка", () => {
  it.each(SCREENS)("на %s слова не уходят за экран", (_name, w, h) => {
    const { words, v } = place(w, h);
    for (const p of words) {
      expect(p.x, `${p.t} по x`).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(v.w);
      expect(p.y, `${p.t} по y`).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(v.h);
      expect(p.room, `${p.t}: нет места под текст`).toBeGreaterThan(40);
    }
  });

  it.each(SCREENS)("на %s строки в колонке не наезжают друг на друга", (_name, w, h) => {
    const { words, l } = place(w, h);
    const step = l.hgt / l.rows;
    for (const side of ["L", "R"] as const) {
      const col = words.filter((p) => p.side === side).sort((a, b) => a.y - b.y);
      for (let i = 1; i < col.length; i++) {
        expect(col[i].y - col[i - 1].y, `${col[i].t}`).toBeGreaterThanOrEqual(step - 0.01);
      }
    }
  });

  it.each(SCREENS)("на %s слова не залезают на глаз", (_name, w, h) => {
    const { words, eye, v } = place(w, h);
    // видимая часть глаза: половина ширины плюс хвостики
    const half = (300 + 52) * eye.s;
    const top = eye.cy - eye.hh * 1.2;
    const bot = eye.cy + eye.hh * 1.2;
    for (const p of words) {
      const insideY = p.y > top && p.y < bot;
      const insideX = Math.abs(p.x - v.w / 2) < half;
      expect(insideY && insideX, `${p.t} попал на глаз`).toBe(false);
    }
  });

  it("на узком экране показывается меньше слов, но самые важные остаются", () => {
    const wide = place(1440, 900).words.map((p) => p.t);
    const narrow = place(390, 844).words.map((p) => p.t);
    expect(narrow.length).toBeLessThan(wide.length);
    for (const t of ["TENEBRAE", "NOX", "ABYSSUS", "NIHIL"]) expect(narrow).toContain(t);
  });

  it("колонки выключены по общим осям, а не разбросаны", () => {
    const { words } = place(1440, 900);
    const left = words.filter((p) => p.side === "L");
    const right = words.filter((p) => p.side === "R");
    expect(new Set(left.map((p) => p.x)).size).toBe(1);
    expect(new Set(right.map((p) => p.x)).size).toBe(1);
    expect(left.every((p) => p.align === -1)).toBe(true);
    expect(right.every((p) => p.align === 1)).toBe(true);
  });

  it("низ колонок не наезжает на счётчик", () => {
    const { words, v } = place(1440, 900);
    const lowest = Math.max(...words.filter((p) => p.side !== "B").map((p) => p.y));
    expect(lowest).toBeLessThan(v.h * 0.78); // HUD живёт ниже
  });
});
