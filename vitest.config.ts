import { defineConfig } from "vitest/config";

// Отдельный конфиг: плагин reactRouter из vite.config тянет генерацию типов
// маршрутов и в тестовом прогоне только мешает.
export default defineConfig({
  resolve: {
    alias: { "~": new URL("./app", import.meta.url).pathname },
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["app/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      // eye.ts, scene.ts и рисующая половина Preloader.tsx — canvas и WebGL.
      // В jsdom нет ни того, ни другого: «покрытие» этих строк было бы фикцией,
      // они исполнились бы на заглушках, ничего не проверив. Их верифицируют
      // снимками в настоящем браузере на семи разрешениях.
      exclude: ["app/components/preloader/eye.ts", "app/components/preloader/scene.ts"],
      // Порог стоит только на чистой логике — там, где тест реально что-то
      // доказывает. Общий порог по проекту был бы враньём: его вытянули бы
      // строки, исполненные вхолостую.
      thresholds: {
        "app/components/preloader/{progress,words,geometry,roman,readiness}.ts": {
          statements: 95,
          branches: 85,
          functions: 95,
          lines: 95,
        },
      },
    },
  },
});
