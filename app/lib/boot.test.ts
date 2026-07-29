import { beforeEach, describe, expect, it, vi } from "vitest";
import { BOOT_SCRIPT } from "./boot";

/** Выполняет скрипт так же, как браузер: как отдельный источник, без модулей. */
function runBoot(el: HTMLElement): void {
  new Function("document", `return (${BOOT_SCRIPT.replace("document.documentElement", "arguments[0]")})`)(
    el,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }));
});

describe("BOOT_SCRIPT", () => {
  it("синтаксически корректен и исполняется как отдельный источник", () => {
    expect(() => new Function(BOOT_SCRIPT)).not.toThrow();
  });

  it("самодостаточен: не тянет внешних идентификаторов", () => {
    // После сборки любая ссылка наружу превратится в имя, которого в инлайновом
    // скрипте не существует, и всё молча упадёт ещё до отрисовки. Настоящая
    // проверка — исполнить в пустом контексте: обращение к модульной переменной
    // выбросит ReferenceError. Строковые признаки идут вдогонку, для читаемости
    // диагностики (имя самой функции в объявлении ссылкой наружу не является).
    const el = document.createElement("html");
    expect(() => runBoot(el)).not.toThrow();
    for (const bad of ["import", "require(", "export ", "__vite", "_a.", "$$"]) {
      expect(BOOT_SCRIPT.includes(bad), `утечка наружу: ${bad}`).toBe(false);
    }
    expect(BOOT_SCRIPT.startsWith("(function")).toBe(true);
    expect(BOOT_SCRIPT.endsWith("(document.documentElement)")).toBe(true);
  });

  it("ставит класс js и гейт прелоадера на чистой сессии", () => {
    const el = document.createElement("html");
    runBoot(el);
    expect(el.classList.contains("js")).toBe(true);
    expect(el.hasAttribute("data-preload")).toBe(true);
  });

  it("?preload показывает заставку принудительно, даже если сессия помечена", () => {
    // без этого пересмотреть её нельзя иначе как через инкогнито или консоль
    sessionStorage.setItem("kur:preloaded", "1");
    const url = new URL(location.href);
    url.search = "?preload";
    history.replaceState(null, "", url);
    const el = document.createElement("html");
    runBoot(el);
    expect(el.hasAttribute("data-preload")).toBe(true);
    history.replaceState(null, "", "/");
  });

  it("не показывает прелоадер второй раз за сессию", () => {
    sessionStorage.setItem("kur:preloaded", "1");
    const el = document.createElement("html");
    runBoot(el);
    expect(el.hasAttribute("data-preload")).toBe(false);
  });

  it("не показывает прелоадер при prefers-reduced-motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    const el = document.createElement("html");
    runBoot(el);
    expect(el.hasAttribute("data-preload")).toBe(false);
  });

  it("не показывает прелоадер при экономии трафика", () => {
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
      configurable: true,
    });
    const el = document.createElement("html");
    runBoot(el);
    expect(el.hasAttribute("data-preload")).toBe(false);
    Object.defineProperty(navigator, "connection", { value: undefined, configurable: true });
  });

  it("снимает гейт предохранителем, если React так и не поднялся", () => {
    vi.useFakeTimers();
    const el = document.createElement("html");
    runBoot(el);
    expect(el.hasAttribute("data-preload")).toBe(true);
    vi.advanceTimersByTime(8000);
    expect(el.hasAttribute("data-preload")).toBe(false);
    vi.useRealTimers();
  });

  it("восстанавливает палитру, шрифты и язык", () => {
    localStorage.setItem("bento2:palette", "midnight");
    localStorage.setItem("bento2:fonts", "strict");
    localStorage.setItem("bento2:lang", "kz");
    const el = document.createElement("html");
    runBoot(el);
    expect(el.getAttribute("data-palette")).toBe("midnight");
    expect(el.getAttribute("data-fonts")).toBe("strict");
    expect(el.lang).toBe("kk");
  });

  it("игнорирует мусор в localStorage", () => {
    localStorage.setItem("bento2:palette", "<script>");
    const el = document.createElement("html");
    runBoot(el);
    expect(el.hasAttribute("data-palette")).toBe(false);
  });
});
