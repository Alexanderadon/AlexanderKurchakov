import { describe, expect, it } from "vitest";
import {
  COVER_RATIO,
  OPEN_MS,
  PAGE,
  SPREAD_RATIO,
  LEAVES,
  TURN_MS,
  coverOverhang,
  pageAspectInSpread,
  pageHeight,
  pageWidth,
} from "./bestiary";

describe("геометрия бестиария", () => {
  it("жёлоб делит разворот пополам", () => {
    // Сняли замером, а не поставили 0.5: при перегенерации разворота ось
    // переворота уедет, и лист начнёт вращаться мимо корешка. Пусть об этом
    // скажет тест, а не глаз на проде.
    expect(PAGE.gutter).toBeCloseTo(0.5, 2);
  });

  it("правая страница лежит правее жёлоба и внутри разворота", () => {
    expect(PAGE.right).toBeGreaterThan(PAGE.gutter);
    expect(PAGE.right).toBeLessThan(1);
    expect(pageWidth()).toBeGreaterThan(0.3);
  });

  it("страница занимает почти всю высоту разворота", () => {
    expect(PAGE.top).toBeGreaterThan(0);
    expect(PAGE.bottom).toBeLessThan(1);
    expect(pageHeight()).toBeGreaterThan(0.9);
  });

  it("лист по пропорции сходится с разворотом", () => {
    // Считаем ОТ ЖЁЛОБА: лист вращается вокруг корешка, а не вокруг края
    // видимого пергамента. Разворот и лист сгенерированы порознь, 0.677 против
    // 0.667 — полтора процента. Если расхождение вырастет, при перевороте
    // станет видна подмена, и это должен поймать тест, а не глаз на проде.
    const loose = 1024 / 1536;
    expect(pageAspectInSpread()).toBeCloseTo(0.677, 2);
    expect(Math.abs(loose / pageAspectInSpread() - 1)).toBeLessThan(0.04);
  });

  it("обложка шире половины разворота — отсюда подмена через ребро", () => {
    // Это не дефект ассетов, а причина всей механики: честно раскрыть альбомную
    // крышку в книжный разворот нельзя, крышка вылезет за край книги.
    expect(coverOverhang()).toBeGreaterThan(1.5);
    expect(COVER_RATIO).toBeLessThan(SPREAD_RATIO);
  });

  it("такты заданы и вменяемы", () => {
    // Верхняя граница поднята осознанно: 620 мс читались как хлопок, а книга —
    // предмет тяжёлый, и спешка выдаёт подделку вернее любой геометрии.
    expect(OPEN_MS).toBeGreaterThan(900);
    expect(OPEN_MS).toBeLessThan(2400);
    expect(OPEN_MS % 2).toBe(0); // делится пополам без остатка: две равные фазы
    expect(TURN_MS).toBeGreaterThan(300);
    expect(LEAVES).toBeGreaterThan(1);
  });
});
