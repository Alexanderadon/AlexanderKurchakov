import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      output: {
        // three — В СВОЙ ЧАНК, отдельно от кода книги.
        //
        // Выполнение этого чанка — самое дорогое одиночное замирание заставки:
        // ~970 мс на первом заходе. На повторном оно стоит ~170 мс, потому что
        // V8 хранит кеш скомпилированного кода, — но кеш привязан к адресу
        // файла. Пока three был вклеен в чанк книги, ЛЮБОЙ наш деплой менял хэш
        // в имени, и все, кто уже был на сайте, платили секунду заново.
        // Отдельный чанк меняет имя только со сменой версии three: правки книги
        // больше не сжигают кеш кода у вернувшихся.
        manualChunks(id) {
          if (id.includes("node_modules/three/")) return "three";
        },
      },
    },
  },
});
