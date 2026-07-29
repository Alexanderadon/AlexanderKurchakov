import { expect, test, type Page } from "@playwright/test";

/**
 * Средняя яркость участка страницы по НАСТОЯЩЕМУ скриншоту.
 *
 * Через скриншот, а не через drawImage с WebGL-холста: буфер очищается после
 * композитинга, и чтение из него даёт нули во всех движках — на этом я уже
 * обжёгся. Скриншот возвращает то, что реально видит глаз.
 */
async function bandLuma(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  const png = (await page.screenshot({ clip })).toString("base64");
  const res = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((ok, err) => {
      img.onload = ok;
      img.onerror = err;
      img.src = `data:image/png;base64,${b64}`;
    });
    const cv = document.createElement("canvas");
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    const g = cv.getContext("2d");
    if (!g) return null;
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let sum = 0;
    let max = 0;
    for (let i = 0; i < d.length; i += 4) {
      const l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
      sum += l;
      if (l > max) max = l;
    }
    return { avg: sum / (d.length / 4), max };
  }, png);
  if (!res) throw new Error("не удалось прочитать пиксели");
  return res;
}

/**
 * Плотность тумана зависела от движка: контекст объявлял буфер НЕумноженным на
 * альфу, а смешивание складывало в него уже умноженные значения. Содержимое не
 * совпадало с объявленным форматом, и в Chromium дым выходил заметно гуще, чем
 * в Firefox.
 *
 * Меряем ВКЛАД тумана — разницу «с ним» и «без него» на одном и том же кадре.
 * Абсолютная яркость полосы бесполезна: в неё попадает контент страницы, и
 * порог пришлось бы подгонять под каждый макет. Разница же зависит только от
 * тумана, поэтому одинаково работает во всех движках и на любом экране.
 */
test("вклад тумана в пределах и одинаков между движками", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".fogshader");
  await page.waitForTimeout(1600); // дать шуму развернуться

  const vp = page.viewportSize();
  if (!vp) throw new Error("нет размера окна");
  const band = {
    x: 0,
    y: Math.round(vp.height * 0.8),
    width: vp.width,
    height: Math.round(vp.height * 0.18),
  };

  const withFog = await bandLuma(page, band);
  await page.evaluate(() => document.querySelector(".fogshader")?.remove());
  await page.waitForTimeout(120);
  const withoutFog = await bandLuma(page, band);

  const contribution = withFog.avg - withoutFog.avg;
  // Пелена должна угадываться, а не заволакивать: замер по трём движкам даёт
  // 0.0055-0.0067 (на телефоне ~0.002, там полоса меньше). Верхняя граница держит плотность от сползания обратно —
  // при 0.40 в шейдере было 0.037-0.044, и дым лез поверх карточек.
  expect(contribution, `тумана не видно вовсе: ${contribution.toFixed(4)}`).toBeGreaterThan(0.001);
  expect(contribution, `туман слишком густой: ${contribution.toFixed(4)}`).toBeLessThan(0.012);
  // Проверять максимум по кадру бессмысленно: в полосу попадает светлая
  // карточка сайта, и максимум равен единице независимо от тумана.
  console.log(`вклад тумана: ${contribution.toFixed(4)}`);
});
