// Группы стека (секция «Обо мне» → плитка «/ инструменты»). Источник — прежний site-markup.ts.
export interface StackGroup {
  title: string;
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
    title: "frontend",
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
    title: "тестирование",
    items: ["Jest", "Vitest", "React Testing Library"],
  },
  {
    title: "вёрстка и стили",
    items: ["HTML5", "CSS3", "SCSS", "Sass", "Less", "BEM", "Bootstrap"],
  },
  {
    title: "backend & api",
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
    title: "платёжные системы",
    items: ["Stripe"],
  },
  {
    title: "базы данных и BaaS",
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
    title: "сборка и пакеты",
    items: ["Vite", "Webpack", "Gulp", "Turborepo", "pnpm", "NPM", "Yarn"],
  },
  {
    title: "инструменты",
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
    title: "AI-инструменты",
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
    title: "CMS",
    items: ["WordPress", "Carbon Fields", "OctoberCMS"],
  },
  {
    title: "дизайн",
    items: ["Figma", "FigJam", "Photoshop", "UI/UX", "UML"],
  },
  {
    title: "процессы",
    items: ["Scrumban", "Jira", "Notion", "Bitrix24"],
  },
];
