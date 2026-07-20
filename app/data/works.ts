// Типизированные данные 10 работ + фильтры. Источник истины — прежний site-markup.ts.
// Переводимые строки — Localized ({ru,kz,en}); имена собственные и техтермины
// не переводятся (helper `same`). Категории карточек (без "all") и фильтра (с "all").
import type { Localized } from "~/lib/i18n";
import { L, same } from "~/lib/i18n";

export type Category = "sites" | "design" | "games" | "video" | "logo";
export type FilterCategory = "all" | Category;

// Ключ инлайн-SVG-превью карточки (резолвится в WorkCard → components/previews).
export type PreviewKey = "kido" | "logofolio" | "canvas" | "sneakers" | "muckliker";

export interface WorkItem {
  index: string; // "/01"
  cat: Category;
  wide: boolean; // класс .w2 (span 2)
  kind: "svg" | "video" | "img";
  title: Localized; // заголовок карточки (h3)
  tag: Localized; // текст .tag после точки
  dot: "b" | "f"; // цвет точки: b — синий, f — огонь
  preview?: PreviewKey; // для kind === "svg"
  // видео
  videoSrc?: string;
  poster?: string;
  dataSkip?: number;
  videoAria?: string;
  reelHref?: string;
  reelAria?: string;
  // изображение
  imgSrc?: string;
  imgAlt?: string;
  // ссылка-обёртка .wlink
  linkHref?: string;
  linkAria?: string;
  // список (.index)
  listTitle: Localized;
  listSub: Localized;
  listCat: Localized; // "сайты" и т.п.
}

export interface Pill {
  cat: FilterCategory;
  label: Localized;
}

export const PILLS: Pill[] = [
  { cat: "all", label: L("Все", "Барлығы", "All") },
  { cat: "sites", label: L("Сайты", "Сайттар", "Sites") },
  { cat: "design", label: L("Дизайн", "Дизайн", "Design") },
  { cat: "games", label: L("Игры", "Ойындар", "Games") },
  { cat: "video", label: L("Видео", "Бейне", "Video") },
  { cat: "logo", label: L("Лого", "Лого", "Logo") },
];

const CAT_SITES = L("сайты", "сайттар", "sites");
const CAT_DESIGN = L("дизайн", "дизайн", "design");
const CAT_GAMES = L("игры", "ойындар", "games");
const CAT_VIDEO = L("видео", "бейне", "video");
const CAT_LOGO = L("лого", "лого", "logo");

export const WORKS: WorkItem[] = [
  {
    index: "/01",
    cat: "sites",
    wide: true,
    kind: "svg",
    preview: "kido",
    title: L(
      "KIDO — SaaS-каталог детских курсов",
      "KIDO — балалар курстарының SaaS-каталогы",
      "KIDO — SaaS catalog of kids' courses",
    ),
    tag: L(
      "Сайты · React Router 7 · Supabase · Stripe · 2026",
      "Сайттар · React Router 7 · Supabase · Stripe · 2026",
      "Sites · React Router 7 · Supabase · Stripe · 2026",
    ),
    dot: "b",
    listTitle: same("KIDO"),
    listSub: L(
      "SaaS-каталог детских курсов · React Router 7 · Supabase · Stripe",
      "балалар курстарының SaaS-каталогы · React Router 7 · Supabase · Stripe",
      "SaaS catalog of kids' courses · React Router 7 · Supabase · Stripe",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/02",
    cat: "video",
    wide: false,
    kind: "video",
    title: L(
      "Нейрошлем из будущего — концепт",
      "Болашақтан келген нейрошлем — концепт",
      "Neuro-helmet from the future — concept",
    ),
    tag: L(
      "Видео · «Креативный взгляд» · Instagram · 2024",
      "Бейне · «Креативный взгляд» · Instagram · 2024",
      "Video · «Креативный взгляд» · Instagram · 2024",
    ),
    dot: "f",
    videoSrc: "/video/neuro.mp4",
    poster: "/img/works/neuro-poster.jpg",
    videoAria:
      "Обложка reel «Нейрошлем из будущего» — концепт нейрошлема и мобильного приложения",
    reelHref: "https://www.instagram.com/reel/C9edRfvOm2O/",
    reelAria: "Открыть reel «Нейрошлем из будущего» в Instagram",
    listTitle: L(
      "Нейрошлем из будущего",
      "Болашақтан келген нейрошлем",
      "Neuro-helmet from the future",
    ),
    listSub: L(
      "концепт-видео · «Креативный взгляд» · Instagram · 2024",
      "концепт-бейне · «Креативный взгляд» · Instagram · 2024",
      "concept video · «Креативный взгляд» · Instagram · 2024",
    ),
    listCat: CAT_VIDEO,
  },
  {
    index: "/03",
    cat: "design",
    wide: false,
    kind: "video",
    title: L(
      "Trendova — магазин одежды",
      "Trendova — киім дүкені",
      "Trendova — clothing store",
    ),
    tag: L(
      "Дизайн · UI/UX · e-commerce · 2024",
      "Дизайн · UI/UX · e-commerce · 2024",
      "Design · UI/UX · e-commerce · 2024",
    ),
    dot: "f",
    dataSkip: 1.2,
    videoSrc: "/video/trendova.mp4",
    poster: "/img/works/trendova-poster.jpg",
    videoAria: "Trendova — главная страница интернет-магазина одежды",
    reelHref: "https://www.instagram.com/reel/C9urgKFSMFV/",
    reelAria: "Открыть showcase Trendova в Instagram",
    listTitle: same("Trendova"),
    listSub: L(
      "магазин одежды · UI/UX · e-commerce · 2024",
      "киім дүкені · UI/UX · e-commerce · 2024",
      "clothing store · UI/UX · e-commerce · 2024",
    ),
    listCat: CAT_DESIGN,
  },
  {
    index: "/04",
    cat: "logo",
    wide: false,
    kind: "svg",
    preview: "logofolio",
    title: L(
      "Логотипы и фирстили — фриланс",
      "Логотиптер мен фирмалық стильдер — фриланс",
      "Logos & brand identities — freelance",
    ),
    tag: L(
      "Лого · 2019–2021 · подборка скоро",
      "Лого · 2019–2021 · топтама жақында",
      "Logo · 2019–2021 · collection soon",
    ),
    dot: "b",
    listTitle: L(
      "Логотипы и фирстили",
      "Логотиптер мен фирмалық стильдер",
      "Logos & brand identities",
    ),
    listSub: L(
      "фриланс 2019–2021 · подборка скоро",
      "фриланс 2019–2021 · топтама жақында",
      "freelance 2019–2021 · collection soon",
    ),
    listCat: CAT_LOGO,
  },
  {
    index: "/05",
    cat: "sites",
    wide: true,
    kind: "img",
    title: L(
      "Апорт — Telegram Mini App для ресторанов",
      "Апорт — мейрамханаларға арналған Telegram Mini App",
      "Aport — Telegram Mini App for restaurants",
    ),
    tag: L(
      "Сайты · Next.js 16 · Stripe · 143 теста · 2026",
      "Сайттар · Next.js 16 · Stripe · 143 тест · 2026",
      "Sites · Next.js 16 · Stripe · 143 tests · 2026",
    ),
    dot: "b",
    imgSrc: "/img/works/aport.jpg",
    imgAlt:
      "Апорт — интерфейс приложения: шапка, категории и карточки блюд с ценами",
    linkHref: "https://resto-miniapp.vercel.app",
    linkAria: "Открыть живое демо «Апорт»",
    listTitle: L("Апорт", "Апорт", "Aport"),
    listSub: L(
      "Telegram Mini App для ресторанов · Next.js 16 · Stripe · 2026",
      "мейрамханаларға арналған Telegram Mini App · Next.js 16 · Stripe · 2026",
      "Telegram Mini App for restaurants · Next.js 16 · Stripe · 2026",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/06",
    cat: "design",
    wide: false,
    kind: "img",
    title: L(
      "POLOGO — сайт стримингового сервиса",
      "POLOGO — стриминг қызметінің сайты",
      "POLOGO — streaming service website",
    ),
    tag: L(
      "Дизайн · Figma · Photoshop · Behance · 2023",
      "Дизайн · Figma · Photoshop · Behance · 2023",
      "Design · Figma · Photoshop · Behance · 2023",
    ),
    dot: "f",
    imgSrc: "/img/works/pologo.jpg",
    imgAlt:
      "POLOGO — дизайн сайта стримингового сервиса, обложка проекта на Behance",
    linkHref:
      "https://www.behance.net/gallery/172883541/POLOGO-Streaming-Service-Website",
    linkAria: "Открыть проект POLOGO на Behance",
    listTitle: same("POLOGO"),
    listSub: L(
      "сайт стримингового сервиса · Figma · Behance · 2023",
      "стриминг қызметінің сайты · Figma · Behance · 2023",
      "streaming service website · Figma · Behance · 2023",
    ),
    listCat: CAT_DESIGN,
  },
  {
    index: "/07",
    cat: "games",
    wide: false,
    kind: "svg",
    preview: "canvas",
    title: L(
      "Мини-игры на Canvas — Snake, RedKiller, aim",
      "Canvas мини-ойындары — Snake, RedKiller, aim",
      "Canvas mini-games — Snake, RedKiller, aim",
    ),
    tag: L(
      "Игры · JavaScript · Canvas · 2021–2023",
      "Ойындар · JavaScript · Canvas · 2021–2023",
      "Games · JavaScript · Canvas · 2021–2023",
    ),
    dot: "f",
    linkHref: "https://github.com/Alexanderadon/Alexanderadon.github.io",
    linkAria: "Открыть репозиторий мини-игр на Canvas на GitHub",
    listTitle: L("Мини-игры на Canvas", "Canvas мини-ойындары", "Canvas mini-games"),
    listSub: L(
      "Snake · RedKiller · aim-тренажёр · JavaScript",
      "Snake · RedKiller · aim-жаттықтырғыш · JavaScript",
      "Snake · RedKiller · aim trainer · JavaScript",
    ),
    listCat: CAT_GAMES,
  },
  {
    index: "/08",
    cat: "sites",
    wide: false,
    kind: "svg",
    preview: "sneakers",
    title: L(
      "Sneakers — SPA-магазин на React",
      "Sneakers — React-тегі SPA-дүкен",
      "Sneakers — SPA store in React",
    ),
    tag: L(
      "Сайты · React 18 · Router 6 · MockAPI · 2024",
      "Сайттар · React 18 · Router 6 · MockAPI · 2024",
      "Sites · React 18 · Router 6 · MockAPI · 2024",
    ),
    dot: "b",
    linkHref: "https://github.com/Alexanderadon/react-shop",
    linkAria: "Открыть репозиторий Sneakers на GitHub",
    listTitle: same("Sneakers"),
    listSub: L(
      "SPA-магазин · React 18 · Router 6 · MockAPI · 2024",
      "SPA-дүкен · React 18 · Router 6 · MockAPI · 2024",
      "SPA store · React 18 · Router 6 · MockAPI · 2024",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/09",
    cat: "games",
    wide: false,
    kind: "svg",
    preview: "muckliker",
    title: L(
      "Muckliker — прототип игры на Godot",
      "Muckliker — Godot-тағы ойын прототипі",
      "Muckliker — game prototype in Godot",
    ),
    tag: L(
      "Игры · Godot · GDScript · в разработке · 2026",
      "Ойындар · Godot · GDScript · әзірленуде · 2026",
      "Games · Godot · GDScript · in development · 2026",
    ),
    dot: "f",
    listTitle: same("Muckliker"),
    listSub: L(
      "прототип игры · Godot · GDScript · 2026",
      "ойын прототипі · Godot · GDScript · 2026",
      "game prototype · Godot · GDScript · 2026",
    ),
    listCat: CAT_GAMES,
  },
  {
    index: "/10",
    cat: "video",
    wide: false,
    kind: "video",
    title: L(
      "«Кто такие QazSoft?» — промо-ролик",
      "«QazSoft деген кімдер?» — промо-ролик",
      "“Who are QazSoft?” — promo video",
    ),
    tag: L(
      "Видео · моушн · Instagram · 2024",
      "Бейне · моушн · Instagram · 2024",
      "Video · motion · Instagram · 2024",
    ),
    dot: "f",
    videoSrc: "/video/qazsoft.mp4",
    poster: "/img/works/qazsoft-poster.jpg",
    videoAria: "Промо-ролик «Кто такие QazSoft?»",
    reelHref: "https://www.instagram.com/reel/C9J0kqQOM6I/",
    reelAria: "Открыть reel «Кто такие QazSoft?» в Instagram",
    listTitle: L("Кто такие QazSoft?", "QazSoft деген кімдер?", "Who are QazSoft?"),
    listSub: L(
      "промо-ролик · моушн · Instagram · 2024",
      "промо-ролик · моушн · Instagram · 2024",
      "promo video · motion · Instagram · 2024",
    ),
    listCat: CAT_VIDEO,
  },
];
