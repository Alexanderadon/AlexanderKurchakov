import { expect, test } from "@playwright/test";

// Регресс: прелоадер уходил, а руки проявлялись на уже открытой странице —
// 3.4 с на канале 3 Мбит. Запросы к кадрам уходили рано, но 1.1 МБ в 32 файлах
// не успевали раскодироваться, а в списке сигналов готовности их не было вовсе.
// Прелоадер и нужен ровно для того, чтобы такого не случалось.
// Оговорка: на localhost ассеты приезжают мгновенно, и этот тест зелёный даже
// со сломанным прелоадером — окна, в котором он различал бы состояния, тут нет.
// Настоящий сторож пропажи сигнала — модульный тест весов в readiness.test.ts.
// Здесь мы ловим грубые поломки: руки не рисуются вовсе, слой пропал, селектор
// разъехался с разметкой.
test("руки нарисованы к моменту, когда прелоадер уступает место сайту", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __m: { gone?: number; hands?: number } };
    w.__m = {};
    let seen = false;
    const hasInk = (cv: HTMLCanvasElement): boolean => {
      const g = cv.getContext("2d");
      if (!g || cv.width < 2) return false;
      try {
        const d = g.getImageData(0, 0, cv.width, cv.height).data;
        // Разрежённая выборка: полный проход по 720×739 в каждом кадре сам стал
        // бы тормозом и сдвинул бы то, что измеряем.
        for (let i = 3; i < d.length; i += 4 * 97) if (d[i] > 8) return true;
      } catch {
        return false;
      }
      return false;
    };
    const tick = (): void => {
      if (document.querySelector(".preload")) seen = true;
      else if (seen && w.__m.gone === undefined) w.__m.gone = performance.now();
      if (w.__m.gone !== undefined && w.__m.hands === undefined) {
        const cv = document.querySelector<HTMLCanvasElement>(".hgrip canvas");
        if (cv && hasInk(cv)) w.__m.hands = performance.now();
      }
      if (w.__m.hands === undefined) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.goto("/?preload");
  await page.waitForSelector(".preload");
  await page.waitForFunction(
    () => (window as unknown as { __m: { hands?: number } }).__m.hands !== undefined,
    null,
    { timeout: 25_000 },
  );

  const m = await page.evaluate(() => (window as unknown as { __m: { gone: number; hands: number } }).__m);
  const gap = Math.round(m.hands - m.gone);
  console.log(`  разрыв между уходом оверлея и первыми пикселями рук: ${gap} мс`);
  // Допуск в два кадра: канвас всё же рисуется в rAF, мгновенным он не бывает.
  expect(gap, "руки дорисовались уже после того, как сайт открылся").toBeLessThan(34);
});
