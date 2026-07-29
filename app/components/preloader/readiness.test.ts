import { afterEach, describe, expect, it, vi } from "vitest";
import { Readiness, SIGNAL_WEIGHTS, decodeImage, whenFontsReady } from "./readiness";

/** Подменяет Image: в jsdom картинки не грузятся, поэтому имитируем исход. */
function stubImage(outcome: "load" | "error", decodeImpl?: () => Promise<void>): void {
  class Fake {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    decoding = "";
    decode = decodeImpl ?? (() => Promise.resolve());
    set src(_v: string) {
      queueMicrotask(() => (outcome === "load" ? this.onload?.() : this.onerror?.()));
    }
  }
  vi.stubGlobal("Image", Fake);
}

afterEach(() => vi.unstubAllGlobals());

describe("Readiness", () => {
  it("копит доли и не превышает единицу", () => {
    const r = new Readiness();
    expect(r.ratio).toBe(0);
    for (const k of Object.keys(SIGNAL_WEIGHTS) as (keyof typeof SIGNAL_WEIGHTS)[]) r.mark(k);
    expect(r.ratio).toBe(1);
  });

  it("повторная отметка не считается дважды", () => {
    const r = new Readiness();
    r.mark("fonts");
    const once = r.ratio;
    r.mark("fonts");
    r.mark("fonts");
    expect(r.ratio).toBe(once);
  });

  it("сумма весов не меньше единицы, иначе полоса не дойдёт до конца сама", () => {
    const total = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(1);
  });

  it("любой один сигнал не тянет больше половины", () => {
    for (const w of Object.values(SIGNAL_WEIGHTS)) expect(w).toBeLessThanOrEqual(0.5);
  });
});

describe("whenFontsReady", () => {
  it("запрашивает срезы с образцом текста, иначе кириллица не приедет", async () => {
    const load = vi.fn().mockResolvedValue([]);
    const doc = { fonts: { load, ready: Promise.resolve() } } as unknown as Document;
    await whenFontsReady(doc, [{ font: '16px "X"', text: "тьма" }]);
    expect(load).toHaveBeenCalledWith('16px "X"', "тьма");
  });

  it("не падает, если шрифт не загрузился", async () => {
    const doc = {
      fonts: { load: () => Promise.reject(new Error("boom")), ready: Promise.resolve() },
    } as unknown as Document;
    await expect(whenFontsReady(doc, [{ font: "a", text: "b" }])).resolves.toBeUndefined();
  });

  it("переживает окружение без FontFaceSet", async () => {
    await expect(whenFontsReady({} as Document, [{ font: "a", text: "b" }])).resolves.toBeUndefined();
  });
});

describe("decodeImage", () => {
  it("отдаёт картинку после декодирования, а не после onload", async () => {
    const order: string[] = [];
    stubImage("load", () => {
      order.push("decode");
      return Promise.resolve();
    });
    await decodeImage("/x.webp");
    expect(order).toEqual(["decode"]);
  });

  it("не застревает, если decode отклонился", async () => {
    stubImage("load", () => Promise.reject(new Error("no codec")));
    await expect(decodeImage("/x.webp")).resolves.toBeTruthy();
  });

  it("сообщает об ошибке загрузки", async () => {
    stubImage("error");
    await expect(decodeImage("/missing.webp")).rejects.toThrow(/missing\.webp/);
  });
});

describe("состав сигналов", () => {
  it("руки входят в готовность", () => {
    // Настоящий сторож регресса: прелоадер уходил, а руки (32 файла, ≈1.1 МБ,
    // самое тяжёлое на первом экране) проявлялись через 3.4 с на канале 3 Мбит —
    // ровно потому, что этого ключа в таблице не было. Сквозным тестом такое не
    // ловится: на localhost всё приезжает мгновенно и разрыв не воспроизводится.
    expect(Object.keys(SIGNAL_WEIGHTS)).toContain("hands");
    expect(SIGNAL_WEIGHTS.hands).toBeGreaterThan(0.1);
  });

  it("ни один ассет первого экрана не забыт", () => {
    for (const k of ["fonts", "hands", "cathedral", "paper", "hero", "frame"]) {
      expect(Object.keys(SIGNAL_WEIGHTS)).toContain(k);
    }
  });
});
