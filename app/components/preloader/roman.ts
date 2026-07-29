// Римская запись процента: под арабскими цифрами идёт та же величина резаными
// капителями. Диапазон 0..100, поэтому хватает таблицы до C.
const TABLE: readonly [number, string][] = [
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** 0 отдаёт точку: римской цифры для нуля не существует. */
export function roman(n: number): string {
  let v = Math.floor(n);
  if (!Number.isFinite(v) || v <= 0) return "·";
  let out = "";
  for (const [num, sym] of TABLE) {
    while (v >= num) {
      out += sym;
      v -= num;
    }
  }
  return out;
}
