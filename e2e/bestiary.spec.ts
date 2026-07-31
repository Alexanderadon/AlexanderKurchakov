import { expect, test, type Page } from "./base";

// Плитка въезжает анимацией появления и лежит ниже сгиба: клик по ней до конца
// въезда Playwright отвергает как нестабильный.
async function ready(page: Page): Promise<void> {
  // Прелоадер теперь честно ждёт сборку сцен книги — в headless на софтверном
  // GL это долго, потолки ожиданий соответствующие.
  await page.locator(".t-best").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const img = document.querySelector<HTMLImageElement>(".bcover");
    return !!img && img.complete && img.naturalWidth > 0;
  }, null, { timeout: 40_000 });
  await page.waitForFunction(() => {
    const el = document.querySelector(".t-best");
    return !!el && (el.classList.contains("in") || !document.documentElement.classList.contains("js"));
  }, null, { timeout: 40_000 });
}

/** На тач-устройстве пользователь не наводит курсор, а касается: click() шлёт
 *  перед нажатием hover, и элемент уезжает под ним. tap() ближе к правде. */
async function press(page: Page, sel: string): Promise<void> {
  const l = page.locator(sel);
  const touch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  if (touch) await l.tap();
  else await l.click();
}

test.describe("бестиарий", () => {
  test("открывается и закрывается", async ({ page }) => {
    test.slow();
    await page.goto("/");
    await ready(page);
    const shut = page.locator(".bshut");
    await expect(shut).toHaveAttribute("aria-expanded", "false");

    await press(page, ".bshut");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(shut).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    // Закрытие ждёт анимацию захлопывания; на софтверном GL кадры длинные и
    // таймер размонтирования съезжает — потолок с запасом.
    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 20_000 });
    await expect(shut).toHaveAttribute("aria-expanded", "false", { timeout: 10_000 });
  });

  test("сцена книги собирается во всех движках", async ({ page }) => {
    test.slow();
    // Регресс, стоивший вечера: шейдеры не линковались из-за несовпадения
    // точности общего uniform, а createBook молча возвращал null — книга просто
    // не появлялась, и отличить это от «анимация не идёт» было нельзя. Теперь
    // причина отказа пишется в data-book-error, и её проверяет тест.
    await page.goto("/");
    await ready(page);
    await press(page, ".bshut");
    const canvas = page.locator(".bbook");
    // Канвас вставляется по готовности модальной сцены: на софтверном GL её
    // компиляция после открытия может занять десятки секунд.
    await expect(canvas).toBeAttached({ timeout: 60_000 });
    await page.waitForTimeout(1200);
    const err = await canvas.evaluate((c: HTMLCanvasElement) => c.dataset.bookError ?? "");
    expect(err, "сцена книги не собралась").toBe("");
    const size = await canvas.evaluate((c: HTMLCanvasElement) => [c.width, c.height]);
    expect(size[0], "холст книги нулевой ширины").toBeGreaterThan(10);
  });

  test("без анимации книга открыта сразу", async ({ page }) => {
    test.slow();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await ready(page);
    await press(page, ".bshut");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".bbook")).toBeAttached({ timeout: 60_000 });
  });
});
