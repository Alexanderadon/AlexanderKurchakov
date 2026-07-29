// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { Preloader } from "./Preloader";

const html = () => document.documentElement;

beforeEach(() => {
  vi.useFakeTimers();
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
    html().setAttribute("data-preload", "");
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1 as never);
    render(<Preloader />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(html().hasAttribute("data-preload")).toBe(false);
    raf.mockRestore();
  });

  it("отдаёт страницу, если вкладку увели в фон", () => {
    html().setAttribute("data-preload", "");
    const raf = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1 as never);
    // WebGL «есть», чтобы дойти до подписки на visibilitychange
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
    render(<Preloader />);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(1000);
    });
    expect(html().hasAttribute("data-preload")).toBe(false);
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
