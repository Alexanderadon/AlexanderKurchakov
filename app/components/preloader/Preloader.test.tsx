// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { Preloader } from "./Preloader";
import { FADE_MS, HARD_BAIL_MS } from "~/lib/preloadTiming";

// Сцена подменяется заглушкой ТОЧЕЧНО. По умолчанию createScene возвращает null,
// как и в jsdom без WebGL, — на этом держится проверка деградации. Но тесты про
// таймеры обязаны пройти дальше этой ветки: без сцены компонент уходит мгновенно,
// и проверка «оверлей ушёл» проходит при любом значении предела. Ровно поэтому
// подъём предела с 6500 до 20000 мс когда-то никто и не заметил.
const gl = vi.hoisted(() => ({ works: false }));
vi.mock("./scene", () => ({
  createScene: () =>
    gl.works ? { layout: () => {}, paint: () => {}, render: () => {}, dispose: () => {} } : null,
}));

const html = () => document.documentElement;

beforeEach(() => {
  vi.useFakeTimers();
  gl.works = false;
  sessionStorage.clear();
  html().removeAttribute("data-preload");
  // В jsdom нет ни WebGL, ни 2D-контекста: подменяем явно, чтобы проверить
  // деградацию, а не ловить «Not implemented» из виртуальной консоли.
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
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

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Preloader", () => {
  it("не рендерится, если BOOT-скрипт не разрешил показ", () => {
    render(<Preloader />);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("показывается с корректной семантикой прогресса", () => {
    html().setAttribute("data-preload", "");
    render(<Preloader />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeTruthy();
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(bar.getAttribute("aria-label")).toBeTruthy();
  });

  it("холсты спрятаны от скринридера", () => {
    html().setAttribute("data-preload", "");
    const { container } = render(<Preloader />);
    const canvases = container.querySelectorAll("canvas");
    expect(canvases.length).toBe(2);
    for (const c of canvases) expect(c.getAttribute("aria-hidden")).toBe("true");
  });

  it("без WebGL сразу отдаёт страницу, а не висит чёрным экраном", () => {
    html().setAttribute("data-preload", "");
    render(<Preloader />);
    // createScene вернул null → finish() снимает гейт немедленно
    expect(html().hasAttribute("data-preload")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("помечает сессию, чтобы не показываться второй раз", () => {
    html().setAttribute("data-preload", "");
    render(<Preloader />);
    expect(sessionStorage.getItem("kur:preloaded")).toBe("1");
  });

  it("переживает недоступное sessionStorage (приватный режим)", () => {
    html().setAttribute("data-preload", "");
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => render(<Preloader />)).not.toThrow();
    expect(html().hasAttribute("data-preload")).toBe(false);
    spy.mockRestore();
  });

  it("снимается по жёсткому таймеру, даже если кадры не идут", () => {
    // Регресс из живой проверки: завершение висело только на requestAnimationFrame,
    // а во вкладке в фоне он не вызывается — оверлей оставался поверх сайта и
    // перехватывал клики. Здесь rAF не двигаем вовсе.
    //
    // Тест обязан дойти до самого таймера. Прежняя его версия этого НЕ делала:
    // getContext подменён на null, сцена не собиралась, и компонент уходил
    // немедленно по ветке «нет WebGL» — проверка проходила при любой величине
    // предела, поэтому подъём 6500 → 20000 никто и не заметил. Поэтому здесь
    // сцена подменяется рабочей заглушкой, а моменты проверяются с двух сторон
    // от предела.
    gl.works = true;
    html().setAttribute("data-preload", "");
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1 as never);
    render(<Preloader />);
    expect(screen.queryByRole("progressbar"), "оверлей обязан подняться").not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(HARD_BAIL_MS - 100);
    });
    expect(screen.queryByRole("progressbar"), "до предела оверлей ещё стоит").not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(100 + FADE_MS);
    });
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(html().hasAttribute("data-preload")).toBe(false);
    raf.mockRestore();
  });

  it("не поднимается во вкладке, открытой в фоне, и не жжёт показ за сессию", () => {
    // В скрытой вкладке requestAnimationFrame не вызывается вообще, а слушателя
    // visibilitychange не будет — событие уже прошло. Счётчик стоял на нуле до
    // жёсткого предела, и уход по нему помечал сессию: единственный за сессию
    // показ заставки сгорал там, где на него никто не смотрел.
    html().setAttribute("data-preload", "");
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    render(<Preloader />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(html().hasAttribute("data-preload")).toBe(false);
    expect(sessionStorage.getItem("kur:preloaded")).toBeNull();
    hidden.mockRestore();
  });

  it("отдаёт страницу, если вкладку увели в фон", () => {
    // Сцена обязана СОБРАТЬСЯ, иначе компонент уходит по ветке «нет WebGL» ещё
    // до подписки на visibilitychange, и тест проверяет не то, что написано.
    gl.works = true;
    html().setAttribute("data-preload", "");
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1 as never);
    render(<Preloader />);
    expect(screen.queryByRole("progressbar")).not.toBeNull();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(FADE_MS);
    });
    expect(html().hasAttribute("data-preload")).toBe(false);
    expect(screen.queryByRole("progressbar")).toBeNull();
    hidden.mockRestore();
    raf.mockRestore();
  });

  it("латынь в разметке без римского V", () => {
    html().setAttribute("data-preload", "");
    const { container } = render(<Preloader />);
    const top = container.querySelector(".preload-top");
    expect(top?.textContent).toContain("LUX IN TENEBRIS LUCET");
    expect(top?.textContent).not.toContain("LVX");
  });
});
