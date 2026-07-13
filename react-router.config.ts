import type { Config } from "@react-router/dev/config";

export default {
  // Чистая статика: без серверного рантайма (ssr:false), но главная пре-рендерится
  // в статический HTML на этапе сборки — весь контент в разметке (SEO, no-JS),
  // клиент гидратирует. Деплой = обычная статика (Vercel/любой хостинг), без функций.
  ssr: false,
  prerender: ["/"],
} satisfies Config;
