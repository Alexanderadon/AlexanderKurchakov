// Таймлайн опыта (секция «Обо мне»). Источник — прежний site-markup.ts.
export interface XpItem {
  years: string;
  role: string;
  desc: string;
}

export const EXPERIENCE: XpItem[] = [
  {
    years: "2024 — н.в.",
    role: "Frontend Developer",
    desc: "iiko API для HoReCa, Stripe-платежи, Web3 — TON Connect и WalletConnect, n8n-автоматизации",
  },
  {
    years: "2022 — 2024",
    role: "Middle React Developer · QazSoft",
    desc: "SPA на React/Next/TS (FSD), Node.js-микросервисы, Three.js/WebGL, AI-интеграции (−40% времени на рутину), менторство джунов",
  },
  {
    years: "2021 — 2022",
    role: "Web Developer · QAZAQSTAN RUGBY",
    desc: "сайты федерации, ~10 000 пользователей, Figma → WordPress, SEO",
  },
  {
    years: "2019 — 2021",
    role: "Фриланс — дизайн и разработка",
    desc: "10+ проектов: сайты, лендинги, лого, фирстили",
  },
];
