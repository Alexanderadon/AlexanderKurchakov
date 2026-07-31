// Проверка заголовков кеширования из vercel.json.
//
// Зачем вообще файл vercel.json появился. На живом проде при ПЕРЕЗАГРУЗКЕ из 91
// запрошенного ресурса из кэша браузер брал только 18 — остальные 73 (шрифты,
// картинки книги и карточек, чанки JS) уходили на сервер за перепроверкой и
// возвращались пустыми 304-ми. Своих заголовков у проекта не было, а Vercel по
// умолчанию отдаёт статику как `public, max-age=0, must-revalidate`: файл лежит
// в кэше, но использовать его без спроса нельзя. Отсюда и жалоба «заставка
// замирает»: настоящей работы на перезагрузке 0.4 с (7 длинных задач, 648 мс),
// а оверлей висел 7 с — он ждал не вычисления, а сеть.
//
// Почему правила именно такие:
//   * /assets/* — имена собраны Rollup'ом с хэшем содержимого (root-DcaVtXID.css).
//     Файл с таким именем не меняется никогда: поменялось содержимое — поменялось
//     имя. Значит `immutable` на год, браузер не спросит ни разу.
//   * /fonts, /img, /photo, /video — лежат в public/ под постоянными именами, хэша
//     в них нет. Год с `immutable` тут ставить нельзя: заменишь картинку под тем же
//     именем — вернувшийся посетитель год будет видеть старую. Поэтому месяц
//     обычного max-age (весь месяц — ноль запросов) плюс stale-while-revalidate:
//     по истечении месяца Chrome рисует из кэша сразу и обновляет фоном, а браузеры
//     без поддержки SWR просто сходят с ETag и получат дешёвый 304.
//   * HTML — max-age=0: разметка содержит имена хэшированных чанков, закешируй её —
//     и правки не доедут до пользователя вообще. Это единственный документ, который
//     обязан спрашивать сервер каждый раз.
//
// Тест держит vercel.json и содержимое public/ в согласии: добавили новую папку с
// медиа — правило под неё либо есть, либо тест падает и файл молча уедет на прод
// без кеша.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

const ROOT = process.cwd();
const config = JSON.parse(readFileSync(resolve(ROOT, "vercel.json"), "utf8")) as {
  headers?: HeaderRule[];
};
const rules = config.headers ?? [];

// Урезанный разбор синтаксиса `source` у Vercel: в конфиге используются только
// литералы и группа `(.*)`. Полный path-to-regexp здесь не нужен и врал бы больше,
// чем помогал, — при появлении в конфиге других конструкций тест это заметит.
function toRegExp(source: string): RegExp {
  const escaped = source
    .split("(.*)")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("(.*)");
  return new RegExp(`^${escaped}$`);
}

function matching(url: string): HeaderRule[] {
  return rules.filter((rule) => toRegExp(rule.source).test(url));
}

function cacheControl(url: string): string | undefined {
  const hit = matching(url).at(-1);
  return hit?.headers.find((h) => h.key.toLowerCase() === "cache-control")?.value;
}

function maxAge(value: string): number {
  return Number(/max-age=(\d+)/.exec(value)?.[1] ?? NaN);
}

// Пути так, как их запросит браузер: public/img/a.webp → /img/a.webp.
function urlsUnder(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? urlsUnder(join(dir, entry.name), `${prefix}/${entry.name}`)
      : [`${prefix}/${entry.name}`],
  );
}

const YEAR = 31_536_000;
const publicUrls = urlsUnder(resolve(ROOT, "public"));

describe("заголовки кеширования", () => {
  it("в конфиге только тот синтаксис source, который тест умеет читать", () => {
    for (const rule of rules) {
      expect(rule.source.split("(.*)").join(""), `непонятный source: ${rule.source}`).not.toMatch(
        /[(:*?+[\]]/,
      );
    }
  });

  it("каждый файл из public/ попадает ровно под одно правило", () => {
    // Без этой строчки тест был бы пустым обещанием: сломайся обход папки — цикл
    // ниже прошёл бы по нулю файлов и всё равно позеленел.
    expect(publicUrls.length).toBeGreaterThan(50);
    const orphans = publicUrls.filter((url) => matching(url).length !== 1);
    expect(orphans, "без правила или под двумя сразу").toEqual([]);
  });

  it("медиа и шрифты живут в кэше месяцами, но не вечно", () => {
    // Всё из public/, кроме HTML: это ровно те файлы, что ходили на сервер зря.
    for (const url of publicUrls.filter((u) => !u.endsWith(".html"))) {
      const value = cacheControl(url) ?? "";
      expect(maxAge(value), `${url}: ${value}`).toBeGreaterThanOrEqual(86_400);
      // immutable без хэша в имени — ловушка: замена файла под тем же именем
      // не дойдёт до тех, кто уже был на сайте.
      expect(value, `${url}: immutable без хэша в имени`).not.toMatch(/immutable/);
    }
  });

  it("HTML всегда перепроверяется — иначе правки не доедут", () => {
    for (const url of ["/", "/index.html", "/lab.html", "/__spa-fallback.html"]) {
      const value = cacheControl(url) ?? "";
      expect(maxAge(value), `${url}: ${value}`).toBe(0);
    }
  });
});

// Хэш в именах — не предположение, а условие для `immutable`. Проверяем по факту
// сборки; без build/ тест пропускается, как и boot.build.test.ts.
const ASSETS = resolve(ROOT, "build/client/assets");
describe.skipIf(!existsSync(ASSETS))("собранные чанки", () => {
  const assets = existsSync(ASSETS) ? urlsUnder(ASSETS, "/assets") : [];

  it("у всех имён есть хэш содержимого", () => {
    expect(assets.length).toBeGreaterThan(0);
    for (const url of assets) {
      expect(url, "имя без хэша нельзя отдавать как immutable").toMatch(
        /-[A-Za-z0-9_-]{8,}\.(js|css)$/,
      );
    }
  });

  it("отдаются на год и без единой перепроверки", () => {
    for (const url of assets) {
      const value = cacheControl(url) ?? "";
      expect(value, url).toMatch(/immutable/);
      expect(maxAge(value), `${url}: ${value}`).toBeGreaterThanOrEqual(YEAR);
    }
  });
});
