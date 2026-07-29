import { expect, test } from "./base";

// Плитка въезжает анимацией появления (.rv -> .in), и клик по ней до конца
// въезда Playwright отвергает как нестабильный. Ждём именно посадку, а не
// таймаут наугад.
async function ready(page: import("./base").Page) {
  // Плитка лежит ниже сгиба: до прокрутки она не раскрыта анимацией появления
  // и в WebKit вовсе не имеет размеров.
  await page.locator(".t-best").scrollIntoViewIfNeeded();
  await expect(page.locator(".t-best")).toBeVisible();
  await page.waitForFunction(() => {
    const el = document.querySelector(".t-best");
    return !!el && (el.classList.contains("in") || !document.documentElement.classList.contains("js"));
  });
}

test.describe("бестиарий", () => {
  test("открывается, листается, закрывается", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const shut = page.locator(".bshut");
    await expect(shut).toHaveAttribute("aria-expanded", "false");

    await shut.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(shut).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".bspread")).toBeVisible();

    // Лист рисуется в WebGL, DOM-элемента у него нет — проверяем по холсту и
    // по блокировке кнопки на время хода.
    const canvas = page.locator(".bturn");
    await expect(canvas).toBeAttached();
    expect(await canvas.evaluate((c: HTMLCanvasElement) => c.dataset.turnError ?? ""), "сцена переворота не собралась").toBe("");
    // Дожидаемся конца раскрытия: до него переворот намеренно не принимается,
    // иначе лист поехал бы, пока крышка ещё в воздухе.
    await expect(page.locator(".bmodal--open")).toBeAttached();
    const next = page.locator(".bnext");
    await expect(next).toBeEnabled();
    await next.click();
    await expect(next).toBeDisabled();
    await expect(next).toBeEnabled({ timeout: 5000 });

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(shut).toHaveAttribute("aria-expanded", "false");
  });

  test("подмена происходит, когда крышка стоит ребром", async ({ page }) => {
    // Регресс: обе фазы были процентами внутри одной анимации, easing растягивал
    // их по-разному, и на середине такта крышка была повёрнута градусов на
    // пятнадцать — разворот проступал прямо под ней. Проверяем угол в кадре
    // передачи хода, растянув такт, чтобы не зависеть от скорости машины.
    await page.goto("/");
    await ready(page);
    await page.locator(".bshut").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.addStyleTag({ content: ".bstage{--o:20000ms}" });
    await page.evaluate(() => {
      const m = document.querySelector(".bmodal");
      if (m) m.className = "bmodal bmodal--opening";
    });

    const at = async (frac: number) =>
      page.evaluate((f) => {
        const as = document
          .getAnimations()
          .filter((a) => ["bcov", "bspr", "bshow"].includes((a as CSSAnimation).animationName));
        as.forEach((a) => {
          a.pause();
          a.currentTime = f * 20000;
        });
        const deg = (sel: string) => {
          const el = document.querySelector(sel);
          if (!el) return NaN;
          const m = new DOMMatrix(getComputedStyle(el).transform);
          return (Math.atan2(-m.m13, m.m11) * 180) / Math.PI;
        };
        const sp = document.querySelector(".bface--spread");
        return {
          cover: deg(".bface--cover"),
          spread: deg(".bface--spread"),
          spreadVisible: sp ? getComputedStyle(sp).visibility === "visible" : false,
        };
      }, frac);

    const mid = await at(0.5);
    expect(Math.abs(mid.cover), "крышка не стоит ребром в момент подмены").toBeGreaterThan(89);
    expect(mid.spreadVisible, "разворот проступает раньше времени").toBe(false);

    const after = await at(0.55);
    expect(after.spreadVisible, "разворот не появился после передачи хода").toBe(true);
    expect(Math.abs(after.cover), "крышка вернулась из-за ребра").toBeGreaterThan(89);

    const end = await at(1);
    expect(Math.abs(end.spread), "разворот не довернулся до нуля").toBeLessThan(1);
  });

  test("без анимации сразу открытый разворот", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await ready(page);
    await page.locator(".bshut").click();
    await expect(page.locator(".bspread")).toBeVisible();
    await expect(page.locator(".bface--cover")).toBeHidden();
  });
});
