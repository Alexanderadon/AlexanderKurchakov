// Скрипт, который обязан отработать ДО первой отрисовки: восстановить палитру,
// шрифты и язык из localStorage и решить, показывать ли прелоадер. Сделать это
// в React нельзя — он отработает уже после гидратации, и страница успеет мигнуть
// и контентом, и не той палитрой.
//
// Но писать его строкой тоже незачем: функция ниже — обычный TypeScript, её
// проверяет tsc и видит IDE, а в разметку она попадает через toString().
//
// Единственное требование: функция должна быть САМОДОСТАТОЧНОЙ. Любая ссылка на
// внешний идентификатор после сборки превратится в имя, которого в инлайновом
// скрипте не существует. За этим следит тест.

type Conn = { saveData?: boolean };

function boot(d: HTMLElement): void {
  d.classList.add("js");
  try {
    const p = localStorage.getItem("bento2:palette");
    if (p === "graphite" || p === "midnight") d.setAttribute("data-palette", p);
    const f = localStorage.getItem("bento2:fonts");
    if (f === "strict") d.setAttribute("data-fonts", f);
    const l = localStorage.getItem("bento2:lang");
    if (l === "kz") d.lang = "kk";
    else if (l === "en") d.lang = "en";
  } catch {
    /* приватный режим */
  }
  try {
    // Прелоадер: не повторяем в той же сессии, уважаем reduced-motion и режим
    // экономии трафика. Предохранитель снимает гейт сам — упавший JS не должен
    // оставить сайт невидимым навсегда.
    const c = (navigator as Navigator & { connection?: Conn }).connection;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("kur:preloaded") === "1";
    // ?preload в адресе показывает заставку принудительно. Без этого пересмотреть
    // её нельзя иначе как через инкогнито или консоль: она идёт раз за сессию.
    const forced = location.search.indexOf("preload") >= 0;
    if (forced || (!seen && !reduced && !(c && c.saveData))) {
      d.setAttribute("data-preload", "");
      setTimeout(function () {
        d.removeAttribute("data-preload");
      }, 8000);
    }
  } catch {
    /* приватный режим */
  }
}

/** Готовая к вставке в <script> строка. */
export const BOOT_SCRIPT = `(${boot.toString()})(document.documentElement)`;
