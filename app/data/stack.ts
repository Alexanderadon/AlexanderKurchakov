// Группы стека (секция «Обо мне» → плитка «/ инструменты»). Источник — прежний site-markup.ts.
// Названия групп — Localized ({ru,kz,en}); сами навыки-чипы не переводятся.
import type { Localized } from "~/lib/i18n";
import { L, same } from "~/lib/i18n";

export interface StackGroup {
  title: Localized;
  items: string[];
}

// Ключевой стек — акцентная строка над колонками.
export const KEY_STACK: string[] = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Feature-Sliced Design",
];

export const STACK: StackGroup[] = [
  {
    title: same("frontend"),
    items: [
      "React",
      "Next.js",
      "Vue.js",
      "Nuxt",
      "TypeScript",
      "JavaScript (ES6+)",
      "Redux Toolkit",
      "Zustand",
      "TanStack Query",
      "Zod",
      "React Native",
      "Expo",
      "Three.js",
      "Canvas",
      "Tailwind CSS",
      "Material UI",
      "Framer Motion",
      "i18next",
      "Feature-Sliced Design",
      "Responsive Design",
      "TON Connect SDK",
      "WalletConnect",
      "web3.js",
      "jQuery",
    ],
  },
  {
    title: L("тестирование", "тестілеу", "testing"),
    items: ["Jest", "Vitest", "React Testing Library"],
  },
  {
    title: L("вёрстка и стили", "беттеу және стильдер", "markup & styles"),
    items: ["HTML5", "CSS3", "SCSS", "Sass", "Less", "BEM", "Bootstrap"],
  },
  {
    title: same("backend & api"),
    items: [
      "Node.js",
      "Express.js",
      "REST API",
      "WebSocket",
      "Microservices",
      "Prisma",
      "Telegram Bot API",
      "iiko API",
      "PHP",
      "C#",
    ],
  },
  {
    title: L("платёжные системы", "төлем жүйелері", "payments"),
    items: ["Stripe"],
  },
  {
    title: L("базы данных и BaaS", "дерекқорлар және BaaS", "databases & BaaS"),
    items: [
      "Supabase",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "MySQL / MariaDB",
      "GraphQL",
    ],
  },
  {
    title: L("сборка и пакеты", "құрастыру және пакеттер", "build & packages"),
    items: ["Vite", "Webpack", "Gulp", "Turborepo", "pnpm", "NPM", "Yarn"],
  },
  {
    title: L("инструменты", "құралдар", "tools"),
    items: [
      "Docker",
      "GitHub Actions",
      "GitLab CI",
      "Vercel",
      "n8n",
      "Git",
      "GitHub",
      "GitLab",
      "ESLint",
      "Prettier",
      "Postman",
      "Ngrok",
      "Obsidian",
    ],
  },
  {
    title: L("AI-инструменты", "AI-құралдар", "AI tools"),
    items: [
      "Claude (Sonnet/Opus)",
      "ChatGPT",
      "GitHub Copilot",
      "Cursor",
      "Codex",
      "Gemini",
      "GLM",
      "Higgsfield",
    ],
  },
  {
    title: same("CMS"),
    items: ["WordPress", "Carbon Fields", "OctoberCMS"],
  },
  {
    title: L("дизайн", "дизайн", "design"),
    items: ["Figma", "FigJam", "Photoshop", "UI/UX", "UML"],
  },
  {
    title: L("процессы", "процестер", "process"),
    items: ["Scrumban", "Jira", "Notion", "Bitrix24"],
  },
];
