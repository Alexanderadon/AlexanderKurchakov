// Проверка того, что реально уехало в сборку. Юнит-тесты гоняют исходник, но
// между исходником и разметкой стоит бандлер: он минифицирует, переименовывает
// и может тихо оторвать инлайновый скрипт от контекста. Здесь читается готовый
// build/client/index.html.
//
// Тест пропускается, если сборки нет: `npm test` должен работать и без неё.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BOOT_GATE_MS, FADE_MS, HARD_BAIL_MS } from "./preloadTiming";

const HTML = resolve(process.cwd(), "build/client/index.html");
const built = existsSync(HTML);

describe.skipIf(!built)("собранная разметка", () => {
  const html = built ? readFileSync(HTML, "utf8") : "";
  const inline = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";

  it("контент пререндерен: сайт читается без JS и индексируется", () => {
    expect(html).toMatch(/разработчик/);
  });

  it("инлайновый скрипт пережил сборку и исполняется", () => {
    expect(inline.length).toBeGreaterThan(100);
    expect(() => new Function(inline)).not.toThrow();
  });

  it("скрипт не тянет наружу того, чего в нём нет", () => {
    for (const bad of ["import ", "require(", "__vite", "export "]) {
      expect(inline.includes(bad), `утечка: ${bad}`).toBe(false);
    }
  });

  it("решение о прелоадере принимается до отрисовки", () => {
    expect(inline).toMatch(/data-preload/);
    expect(inline).toMatch(/prefers-reduced-motion/);
    expect(inline).toMatch(/saveData/);
    expect(inline).toMatch(/kur:preloaded/);
  });

  it("предохранитель на месте и переживает полный цикл оверлея", () => {
    expect(inline).toMatch(/removeAttribute\(\s*["']data-preload["']\s*\)/);
    // Число приходит аргументом из preloadTiming, минификатор может записать его
    // и как 13100, и как 1.31e4 — сверяемся со значением, а не с написанием.
    const exp = String(BOOT_GATE_MS);
    const sci = BOOT_GATE_MS.toExponential().replace("+", "");
    expect(
      inline.includes(exp) || inline.includes(sci),
      `в разметке нет времени предохранителя (${exp})`,
    ).toBe(true);
    expect(BOOT_GATE_MS).toBeGreaterThan(HARD_BAIL_MS + FADE_MS);
  });

  it("оверлея нет в разметке — он появляется только после гидратации", () => {
    expect(html).not.toMatch(/class="preload"/);
  });

  it("шрифты и собор уходят в предзагрузку, Google Fonts не дёргается", () => {
    expect(html).toMatch(/rel="preload"[^>]*cinzel-normal-latin\.woff2/);
    expect(html).toMatch(/cathedral\.webp/);
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });
});
