// Проверка того, что реально уехало в сборку. Юнит-тесты гоняют исходник, но
// между исходником и разметкой стоит бандлер: он минифицирует, переименовывает
// и может тихо оторвать инлайновый скрипт от контекста. Здесь читается готовый
// build/client/index.html.
//
// Тест пропускается, если сборки нет: `npm test` должен работать и без неё.
//
// И ПРОСРОЧЕННОЙ сборки тоже. Раньше проверка шла по любому build/client,
// который случайно лежал в папке, — а это разметка вчерашних исходников: она и
// пропускает свежую поломку, и падает на изменении, которого в ней ещё не может
// быть (`npm run build` тут не гоняется — сборка и замеры делаются отдельно).
// В CI это ничего не меняет: `npm run test` идёт до сборки, и раздел
// пропускается целиком.
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BOOT_GATE_MS, FADE_MS, HARD_BAIL_MS } from "./preloadTiming";

const HTML = resolve(process.cwd(), "build/client/index.html");
const built = existsSync(HTML);
// Исходники, про содержимое которых этот раздел утверждает.
const SOURCES = [
  "app/root.tsx",
  "app/lib/boot.ts",
  "app/lib/preloadTiming.ts",
  "app/components/preloader/PreloadShell.tsx",
];
const stale =
  built &&
  SOURCES.some((p) => {
    const f = resolve(process.cwd(), p);
    return existsSync(f) && statSync(f).mtimeMs > statSync(HTML).mtimeMs;
  });

describe.skipIf(!built || stale)("собранная разметка", () => {
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
    // Гейта по сессии больше нет: заставка идёт на каждой загрузке документа,
    // потому что скомпилированные шейдерные программы браузер между загрузками
    // не хранит и линковку (550-771 мс) приходится прятать всякий раз.
    expect(inline).not.toMatch(/kur:preloaded/);
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

  it("первый кадр заставки лежит в разметке, а WebGL-оверлей — нет", () => {
    // Разделение намеренное. WebGL-оверлей приходит из React и появляется на
    // 545-780 мс — до гидратации показывать было нечего, экран стоял пустым.
    // Оболочка (PreloadShell) пре-рендерится и рисуется парсером сразу, поэтому
    // её присутствие в отдаваемом HTML — это и есть проверяемое свойство:
    // проглядеть её пропажу иначе нельзя, юнит-тесты гоняют исходник.
    expect(html).not.toMatch(/class="preload"/);
  });

  it("шрифты и собор уходят в предзагрузку, Google Fonts не дёргается", () => {
    expect(html).toMatch(/rel="preload"[^>]*cinzel-normal-latin\.woff2/);
    expect(html).toMatch(/cathedral\.webp/);
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });
});
