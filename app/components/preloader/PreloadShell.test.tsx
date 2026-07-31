// Тесты оболочки заставки. Проверяется не «нарисовалось ли что-то», а ровно те
// два свойства, ради которых она заведена и которые ломаются молча:
//   • она уезжает в ОТДАВАЕМУЮ разметку (иначе смысла в ней ноль — будет ждать
//     гидратацию наравне с WebGL-оверлеем, те самые 545-780 мс);
//   • её анимации живут на композиторе, то есть трогают только transform и
//     opacity. Достаточно кому-то дописать в кадры width или left — и слой
//     вернётся на главный поток и будет замерзать вместе с ним, при этом
//     визуально в браузере всё продолжит выглядеть прилично на быстрой машине.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PreloadShell } from "./PreloadShell";

const read = (p: string): string => readFileSync(resolve(process.cwd(), p), "utf8");
const css = read("app/app.css");
const root = read("app/root.tsx");
const markup = renderToStaticMarkup(<PreloadShell />);

// Комментарии выкусываются до разбора: иначе они прилипают к списку селекторов
// следующего правила (перед `{` стоит всё, что было после предыдущей `}`), и
// селектор перестаёт совпадать по равенству.
const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Тела всех правил, в списке селекторов которых есть ровно такой селектор. */
function rules(selector: string): string[] {
  const out: string[] = [];
  for (const m of bare.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    if (m[1].split(",").some((s) => s.trim() === selector)) out.push(m[2]);
  }
  return out;
}

function zIndex(selector: string): number {
  for (const body of rules(selector)) {
    const z = /z-index:\s*(\d+)/.exec(body);
    if (z) return Number(z[1]);
  }
  return NaN;
}

describe("PreloadShell", () => {
  it("рисуется на сервере: чистая разметка без скриптов и обработчиков", () => {
    expect(markup).toContain('class="preboot"');
    expect(markup).toContain('class="preboot-pulse"');
    expect(markup).toContain("LUX IN TENEBRIS LUCET");
    expect(markup).not.toMatch(/<script/i);
    // Инлайновых обработчиков нет: слой обязан работать и до гидратации, и при
    // мёртвом JS вообще.
    expect(markup).not.toMatch(/\son[a-z]+=/i);
  });

  it("не подменяет собой индикатор прогресса", () => {
    // role="progressbar" с живым aria-valuenow отдаёт WebGL-оверлей. Второй
    // такой же ролью на экране получилось бы два индикатора сразу, и
    // getByRole('progressbar') в тестах и у скринридера стал бы неоднозначным.
    expect(markup).not.toMatch(/role=/);
    expect(markup.match(/aria-hidden="true"/g)?.length).toBe(2);
  });

  it("вставлена в Layout первой в body — значит попадает в отдаваемый HTML", () => {
    // Отрендерить сам Layout здесь нельзя: Meta/Links/Scripts требуют контекста
    // роутера. Но без вставки в него компонент бесполезен, поэтому проверяем
    // факт вставки и её место — раньше содержимого страницы.
    expect(root).toMatch(/<PreloadShell\s*\/>/);
    const body = root.indexOf("<body>");
    const shell = root.indexOf("<PreloadShell");
    const children = root.indexOf("{children}");
    expect(body).toBeGreaterThan(-1);
    expect(shell).toBeGreaterThan(body);
    expect(shell).toBeLessThan(children);
  });

  it("видна только под гейтом data-preload", () => {
    // Показ и снятие целиком на CSS — компонент про них ничего не знает, и
    // существующая логика готовности (Readiness/HARD_BAIL_MS) не менялась.
    expect(rules(".preboot").length).toBeGreaterThan(0);
    // Нижний слой прячется через display, верхний — через opacity с переходом:
    // он лежит ПОВЕРХ оверлея и обязан гаснуть вместе с ним, а не пропадать
    // рывком в момент, когда оверлей ещё полностью непрозрачен.
    expect(css).toMatch(/\.preboot\{display:none\}/);
    expect(css).toMatch(/\.preboot-pulse\{[^}]*opacity:0[^}]*transition:opacity/);
    expect(css).toMatch(/html\[data-preload\] \.preboot-pulse\{opacity:1\}/);
    expect(css).toMatch(/html\[data-preload\] \.preboot\{display:block\}/);
  });

  it("живой слой лежит поверх WebGL-холста", () => {
    // Холст непрозрачен (alpha:false). Слой ниже него не было бы видно ровно
    // тогда, когда он нужен, — пока замёрзшая сцена держит последний кадр.
    expect(zIndex(".preboot-pulse")).toBeGreaterThan(zIndex(".preload"));
    expect(rules(".preboot-pulse").join(";")).toMatch(/pointer-events:none/);
    expect(zIndex(".preboot")).toBeLessThan(zIndex(".preload"));
  });

  it("анимируются только transform и opacity — иначе слой замёрзнет вместе с главным потоком", () => {
    const frames = [...bare.matchAll(/@keyframes\s+(preboot-[\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)];
    expect(frames.length, "кадров preboot-* в CSS нет вовсе").toBeGreaterThan(0);
    for (const [, name, body] of frames) {
      const props = [...body.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
      expect(props.length, `в @keyframes ${name} нет свойств`).toBeGreaterThan(0);
      for (const p of props) {
        expect(["transform", "opacity"], `@keyframes ${name}: свойство ${p} считается на главном потоке`).toContain(p);
      }
    }
  });

  it("каждая анимация слоя объявлена кадрами preboot-*", () => {
    // Страховка от опечатки в имени: анимация с несуществующим именем не падает
    // и не логируется — она просто молча не идёт, а слой при этом выглядит
    // «почти правильно», пока главный поток свободен.
    const declared = new Set(
      [...bare.matchAll(/@keyframes\s+(preboot-[\w-]+)/g)].map((m) => m[1]),
    );
    const used = [...bare.matchAll(/animation:\s*(preboot-[\w-]+)/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(0);
    for (const u of used) expect(declared, `нет @keyframes ${u}`).toContain(u);
  });
});
