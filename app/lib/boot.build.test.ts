// Проверка того, что реально уехало в сборку. Юнит-тесты гоняют исходник, но
// между исходником и разметкой стоит бандлер: он минифицирует, переименовывает
// и может тихо оторвать инлайновый скрипт от контекста. Здесь читается готовый
// build/client/index.html.
//
// Тест пропускается, если сборки нет: `npm test` должен работать и без неё.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

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

  it("предохранитель на 8 секунд на месте", () => {
    // минификатор пишет 8000 как 8e3 — принимаем оба вида
    expect(inline).toMatch(/removeAttribute\(\s*["']data-preload["']\s*\)/);
    expect(inline).toMatch(/8000|8e3/);
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
