import { defineConfig, devices } from "@playwright/test";

// Три движка не для галочки: баг с собором был именно в WebKit — там ctx.filter
// поддержан частично, и цепочка из шести функций молча отбрасывалась. Поймать
// это можно только запустив настоящий Safari-движок.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Каждый тест поднимает свой WebGL-контекст: на многих воркерах они дерутся
  // за GPU, кадры проседают и падают проверки, завязанные на время.
  workers: 2,
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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "iphone", use: { ...devices["iPhone 13"] } },
  ],
});
