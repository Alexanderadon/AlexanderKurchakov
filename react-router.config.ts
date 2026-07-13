import type { Config } from "@react-router/dev/config";

export default {
  // SSR включён; главная (единственный маршрут) пре-рендерится в статический HTML
  // на этапе сборки — весь контент попадает в разметку (SEO, no-JS), клиент гидратирует.
  ssr: true,
  prerender: ["/"],
} satisfies Config;
