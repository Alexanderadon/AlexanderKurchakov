import { defineConfig, devices } from "@playwright/test";

// Три движка не для галочки: баг с собором был именно в WebKit — там ctx.filter
// поддержан частично, и цепочка из шести функций молча отбрасывалась. Поймать
// это можно только запустив настоящий Safari-движок.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Каждый тест поднимает свои WebGL-контексты: туман, прелоадер, сцена книги.
  // На двух воркерах WebKit начал терять контексты — тесты книги проходили в
  // одиночку и падали в общем прогоне. Один воркер медленнее, но честнее:
  // альтернатива — красный набор, который никто не читает.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // Проверяем боевую сборку, а не dev-сервер: пререндер, минификация и
  // инлайновый boot-скрипт ведут себя иначе, а именно они и ломались.
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  // Звук глушим на уровне конфига, а не по памяти: на странице автостартует
  // hero.mp4, и каждый прогон орал в колонки на машине разработчика.
  projects: [
    {
      name: "chromium",
      // Настоящий GPU (ANGLE поверх D3D11) вместо софтверного SwiftShader:
      // прелоадер теперь ждёт сборку WebGL-сцен книги, и на софтверном рендере
      // это минуты вместо секунд — тесты меряли бы не сайт, а эмулятор.
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: ["--mute-audio", "--use-angle=d3d11"] },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: { firefoxUserPrefs: { "media.volume_scale": "0.0" } },
      },
    },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    {
      name: "iphone",
      use: { ...devices["iPhone 13"], launchOptions: { args: ["--mute-audio"] } },
    },
  ],
});
