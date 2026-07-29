import { describe, expect, it } from "vitest";
import { roman } from "./roman";

describe("roman", () => {
  it.each([
    [1, "I"],
    [4, "IV"],
    [5, "V"],
    [9, "IX"],
    [14, "XIV"],
    [40, "XL"],
    [47, "XLVII"],
    [50, "L"],
    [90, "XC"],
    [99, "XCIX"],
    [100, "C"],
  ])("%i → %s", (n, want) => {
    expect(roman(n)).toBe(want);
  });

  it("для нуля отдаёт точку: римского нуля не существует", () => {
    expect(roman(0)).toBe("·");
  });

  it("не ломается на мусоре", () => {
    expect(roman(-5)).toBe("·");
    expect(roman(Number.NaN)).toBe("·");
    expect(roman(Number.POSITIVE_INFINITY)).toBe("·");
  });

  it("округляет дробные вниз — счётчик показывает целые", () => {
    expect(roman(9.9)).toBe("IX");
  });

  it("покрывает весь диапазон счётчика без пропусков", () => {
    for (let i = 1; i <= 100; i++) {
      const r = roman(i);
      expect(r).toMatch(/^[IVXLC]+$/);
      expect(r.length).toBeLessThanOrEqual(8);
    }
  });
});
