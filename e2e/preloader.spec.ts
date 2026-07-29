import { expect, test, type Page } from "@playwright/test";

/**
 * Снимает пиксели с экрана и считает долю «светлых» — тех, что ярче порога.
 * Через canvas страницы, а не через скриншот: так проверка работает одинаково
 * во всех движках и не зависит от кодирования PNG.
 */
async function brightPixels(page: Page, box: { x: number; y: number; w: number; h: number }) {
  return page.evaluate(({ x, y, w, h }) => {
    const gl = document.querySelector<HTMLCanvasElement>(".preload-gl");
    if (!gl) return null;
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w));
    cv.height = Math.max(1, Math.round(h));
    const g = cv.getContext("2d");
    if (!g) return null;
    const sx = gl.width / gl.clientWidth;
    g.drawImage(gl, x * sx, y * sx, w * sx, h * sx, 0, 0, cv.width, cv.height);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let bright = 0;
    let sum = 0;
    const n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) {
      const l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
      sum += l;
      if (l > 0.5) bright++;
    }
    return { brightRatio: bright / n, avgLum: sum / n };
  }, box);
}

test.describe("прелоадер", () => {
  test("собор не превращается в светлый прямоугольник", async ({ page }) => {
    // Регресс из живого Safari: ctx.filter там поддержан частично, цепочка из
    // шести функций молча отбрасывалась, и чертёж (тёмные линии по БЕЛОМУ) лёг
    // аддитивно светлым блоком в пол-экрана. Проверяем нижнюю треть экрана.
    await page.goto("/?preload");
    await page.waitForSelector(".preload-gl");
    await page.waitForTimeout(1200); // дать текстурам приехать и запечься

    const vp = page.viewportSize();
    if (!vp) throw new Error("нет размера окна");
    const res = await brightPixels(page, { x: 0, y: vp.height * 0.62, w: vp.width, h: vp.height * 0.3 });
    expect(res, "холст прелоадера не найден").not.toBeNull();
    // Сцена тёмная: светлее половины может быть только тонкая графика собора.
    expect(res!.brightRatio, "нижняя часть экрана засветилась").toBeLessThan(0.06);
    expect(res!.avgLum, "фон под собором слишком светлый").toBeLessThan(0.25);
  });

  test("показывается и уступает место сайту", async ({ page }) => {
    await page.goto("/?preload");
    await expect(page.getByRole("progressbar")).toBeVisible();
    // и уходит сам, без перезагрузки
    await expect(page.locator(".preload")).toHaveCount(0, { timeout: 12_000 });
    await expect(page.locator(".rootwrap")).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("kur:preloaded"))).toBe("1");
  });

  test("второй раз за сессию не показывается", async ({ page }) => {
    await page.goto("/?preload");
    // Сначала дожидаемся появления: без этого toHaveCount(0) проходит ещё до
    // того, как React смонтировал оверлей, и сессия не помечается — тест тогда
    // проверяет не то, что задумано.
    await expect(page.getByRole("progressbar")).toBeVisible();
    await expect(page.locator(".preload")).toHaveCount(0, { timeout: 12_000 });
    await page.goto("/");
    await expect(page.locator(".rootwrap")).toBeVisible();
    await expect(page.locator(".preload")).toHaveCount(0);
  });

  test("не появляется при prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".rootwrap")).toBeVisible();
    await expect(page.locator(".preload")).toHaveCount(0);
  });

  test("контент доступен без JS", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByText("разработчик").first()).toBeVisible();
    await ctx.close();
  });

  test("семантика прогресса корректна", async ({ page }) => {
    await page.goto("/?preload");
    const bar = page.getByRole("progressbar");
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
    await expect(bar).toHaveAttribute("aria-label", /загрузк/i);
    // значение реально растёт, а не стоит на нуле
    const first = Number(await bar.getAttribute("aria-valuenow"));
    await page.waitForTimeout(700);
    const second = Number(await bar.getAttribute("aria-valuenow"));
    expect(second).toBeGreaterThan(first);
  });

  test("в консоли нет ошибок", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/?preload");
    await expect(page.locator(".preload")).toHaveCount(0, { timeout: 12_000 });
    expect(errors).toEqual([]);
  });
});
