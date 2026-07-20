// Таймлайн опыта (секция «Обо мне»). Источник — прежний site-markup.ts.
// Переводимые строки — Localized ({ru,kz,en}); названия компаний и должности
// на английском не переводятся.
import type { Localized } from "~/lib/i18n";
import { L, same } from "~/lib/i18n";

export interface XpItem {
  years: Localized;
  role: Localized;
  desc: Localized;
}

export const EXPERIENCE: XpItem[] = [
  {
    years: L("2024 — н.в.", "2024 — қазір", "2024 — present"),
    role: same("Frontend Developer"),
    desc: L(
      "iiko API для HoReCa, Stripe-платежи, Web3 — TON Connect и WalletConnect, n8n-автоматизации",
      "HoReCa үшін iiko API, Stripe төлемдері, Web3 — TON Connect және WalletConnect, n8n-автоматтандыру",
      "iiko API for HoReCa, Stripe payments, Web3 — TON Connect and WalletConnect, n8n automations",
    ),
  },
  {
    years: same("2022 — 2024"),
    role: same("Middle React Developer · QazSoft"),
    desc: L(
      "SPA на React/Next/TS (FSD), Node.js-микросервисы, Three.js/WebGL, AI-интеграции (−40% времени на рутину), менторство джунов",
      "React/Next/TS-тегі SPA (FSD), Node.js-микросервистер, Three.js/WebGL, AI-интеграциялар (рутинаға уақыт −40%), джундарға менторлық",
      "React/Next/TS SPAs (FSD), Node.js microservices, Three.js/WebGL, AI integrations (−40% time on routine), mentoring juniors",
    ),
  },
  {
    years: same("2021 — 2022"),
    role: same("Web Developer · QAZAQSTAN RUGBY"),
    desc: L(
      "сайты федерации, ~10 000 пользователей, Figma → WordPress, SEO",
      "федерация сайттары, ~10 000 пайдаланушы, Figma → WordPress, SEO",
      "federation websites, ~10,000 users, Figma → WordPress, SEO",
    ),
  },
  {
    years: same("2019 — 2021"),
    role: L(
      "Фриланс — дизайн и разработка",
      "Фриланс — дизайн және әзірлеу",
      "Freelance — design & development",
    ),
    desc: L(
      "10+ проектов: сайты, лендинги, лого, фирстили",
      "10+ жоба: сайттар, лендингтер, лого, фирмалық стильдер",
      "10+ projects: websites, landing pages, logos, brand identities",
    ),
  },
];
