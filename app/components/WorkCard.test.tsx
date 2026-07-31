// @vitest-environment jsdom
// Тесты про ОДНО: когда карточка получает свою картинку. Отложенная загрузка
// экономит 1.6 МБ трафика и обязана работать для дальних карточек, но карточка,
// которую видно прямо сейчас, ждать не должна ни колбэка наблюдателя, ни
// движения колеса. Именно ожидание колеса давало «пустые прямоугольники вместо
// карточек» после закрытия книги: под открытой модалкой страница не
// прокручивается, и IntersectionObserver молчит.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { LangProvider } from "~/lib/i18n";
import { WORKS } from "~/data/works";
import { WorkCard } from "./WorkCard";

const VIDEO = WORKS.find((w) => w.kind === "video" && w.poster)!;
const IMG = WORKS.find((w) => w.kind === "img")!;

// Положение карточки задаём тестом: в jsdom раскладки нет и rect всегда нулевой.
let top = 0;
const HEIGHT = 300;
const place = (y: number): void => {
  top = y;
};

// Наблюдатель в jsdom отсутствует. Заглушка НИЧЕГО не сообщает сама — так и
// проверяем, что карточка обходится без него.
class IOStub implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  constructor(_cb: IntersectionObserverCallback) {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const draw = (item: typeof VIDEO) =>
  render(
    <LangProvider>
      <WorkCard item={item} visible rm={false} />
    </LangProvider>,
  );

// Замок прокрутки книга снимает так же, как ставит — через style у <body>.
// Ждём микрозадачу MutationObserver плюс кадр, в который сведены проверки.
const settle = async (): Promise<void> => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
};

beforeEach(() => {
  place(0);
  window.innerHeight = 800;
  // В jsdom нет matchMedia, а видео-карточка спрашивает reduced-motion.
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
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    () =>
      ({
        top,
        bottom: top + HEIGHT,
        height: HEIGHT,
        width: 400,
        left: 0,
        right: 400,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect,
  );
  vi.stubGlobal("IntersectionObserver", IOStub);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

describe("WorkCard — загрузка картинки", () => {
  it("карточка первого экрана получает постер сразу, без наблюдателя", () => {
    place(120);
    const { container } = draw(VIDEO);
    expect(container.querySelector("video")?.getAttribute("poster")).toBe(
      VIDEO.poster,
    );
  });

  it("дальняя карточка постер не тянет — экономия трафика на месте", () => {
    place(4000);
    const { container } = draw(VIDEO);
    expect(container.querySelector("video")?.hasAttribute("poster")).toBe(false);
  });

  it("карточка в кадре после закрытия модалки получает постер без прокрутки", async () => {
    place(4000);
    const { container } = draw(VIDEO);
    const video = container.querySelector("video")!;
    expect(video.hasAttribute("poster")).toBe(false);

    // Книга открылась: страница под ней замерла.
    await act(async () => {
      document.body.style.overflow = "hidden";
    });
    // За время чтения книги карточка оказалась в кадре, а событий прокрутки
    // не было — раньше на этом месте и получался пустой прямоугольник.
    place(150);
    await act(async () => {
      document.body.style.overflow = "";
    });
    await settle();

    expect(video.getAttribute("poster")).toBe(VIDEO.poster);
  });

  it("картинка дальней карточки остаётся ленивой, ближней — грузится сразу", () => {
    place(4000);
    const far = draw(IMG);
    expect(far.container.querySelector("img")?.getAttribute("loading")).toBe(
      "lazy",
    );
    cleanup();

    place(120);
    const near = draw(IMG);
    expect(near.container.querySelector("img")?.getAttribute("loading")).toBe(
      "eager",
    );
  });
});
