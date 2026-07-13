// Типизированные данные 10 работ + фильтры. Источник истины — прежний site-markup.ts.
// Категории карточек (без "all") и категории фильтра (с "all").
export type Category = "sites" | "design" | "games" | "video" | "logo";
export type FilterCategory = "all" | Category;

// Ключ инлайн-SVG-превью карточки (резолвится в WorkCard → components/previews).
export type PreviewKey = "kido" | "logofolio" | "canvas" | "sneakers" | "muckliker";

export interface WorkItem {
  index: string; // "/01"
  cat: Category;
  wide: boolean; // класс .w2 (span 2)
  kind: "svg" | "video" | "img";
  title: string; // заголовок карточки (h3)
  tag: string; // текст .tag после точки
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
  listTitle: string;
  listSub: string;
  listCat: string; // "сайты" и т.п.
}

export interface Pill {
  cat: FilterCategory;
  label: string;
}

export const PILLS: Pill[] = [
  { cat: "all", label: "Все" },
  { cat: "sites", label: "Сайты" },
  { cat: "design", label: "Дизайн" },
  { cat: "games", label: "Игры" },
  { cat: "video", label: "Видео" },
  { cat: "logo", label: "Лого" },
];

export const WORKS: WorkItem[] = [
  {
    index: "/01",
    cat: "sites",
    wide: true,
    kind: "svg",
    preview: "kido",
    title: "KIDO — SaaS-каталог детских курсов",
    tag: "Сайты · React Router 7 · Supabase · Stripe · 2026",
    dot: "b",
    listTitle: "KIDO",
    listSub: "SaaS-каталог детских курсов · React Router 7 · Supabase · Stripe",
    listCat: "сайты",
  },
  {
    index: "/02",
    cat: "video",
    wide: false,
    kind: "video",
    title: "Нейрошлем из будущего — концепт",
    tag: "Видео · «Креативный взгляд» · Instagram · 2024",
    dot: "f",
    videoSrc: "/video/neuro.mp4",
    poster: "/img/works/neuro-poster.jpg",
    videoAria:
      "Обложка reel «Нейрошлем из будущего» — концепт нейрошлема и мобильного приложения",
    reelHref: "https://www.instagram.com/reel/C9edRfvOm2O/",
    reelAria: "Открыть reel «Нейрошлем из будущего» в Instagram",
    listTitle: "Нейрошлем из будущего",
    listSub: "концепт-видео · «Креативный взгляд» · Instagram · 2024",
    listCat: "видео",
  },
  {
    index: "/03",
    cat: "design",
    wide: false,
    kind: "video",
    title: "Trendova — магазин одежды",
    tag: "Дизайн · UI/UX · e-commerce · 2024",
    dot: "f",
    dataSkip: 1.2,
    videoSrc: "/video/trendova.mp4",
    poster: "/img/works/trendova-poster.jpg",
    videoAria: "Trendova — главная страница интернет-магазина одежды",
    reelHref: "https://www.instagram.com/reel/C9urgKFSMFV/",
    reelAria: "Открыть showcase Trendova в Instagram",
    listTitle: "Trendova",
    listSub: "магазин одежды · UI/UX · e-commerce · 2024",
    listCat: "дизайн",
  },
  {
    index: "/04",
    cat: "logo",
    wide: false,
    kind: "svg",
    preview: "logofolio",
    title: "Логотипы и фирстили — фриланс",
    tag: "Лого · 2019–2021 · подборка скоро",
    dot: "b",
    listTitle: "Логотипы и фирстили",
    listSub: "фриланс 2019–2021 · подборка скоро",
    listCat: "лого",
  },
  {
    index: "/05",
    cat: "sites",
    wide: true,
    kind: "img",
    title: "Апорт — Telegram Mini App для ресторанов",
    tag: "Сайты · Next.js 16 · Stripe · 143 теста · 2026",
    dot: "b",
    imgSrc: "/img/works/aport.jpg",
    imgAlt:
      "Апорт — интерфейс приложения: шапка, категории и карточки блюд с ценами",
    linkHref: "https://resto-miniapp.vercel.app",
    linkAria: "Открыть живое демо «Апорт»",
    listTitle: "Апорт",
    listSub: "Telegram Mini App для ресторанов · Next.js 16 · Stripe · 2026",
    listCat: "сайты",
  },
  {
    index: "/06",
    cat: "design",
    wide: false,
    kind: "img",
    title: "POLOGO — сайт стримингового сервиса",
    tag: "Дизайн · Figma · Photoshop · Behance · 2023",
    dot: "f",
    imgSrc: "/img/works/pologo.jpg",
    imgAlt:
      "POLOGO — дизайн сайта стримингового сервиса, обложка проекта на Behance",
    linkHref:
      "https://www.behance.net/gallery/172883541/POLOGO-Streaming-Service-Website",
    linkAria: "Открыть проект POLOGO на Behance",
    listTitle: "POLOGO",
    listSub: "сайт стримингового сервиса · Figma · Behance · 2023",
    listCat: "дизайн",
  },
  {
    index: "/07",
    cat: "games",
    wide: false,
    kind: "svg",
    preview: "canvas",
    title: "Мини-игры на Canvas — Snake, RedKiller, aim",
    tag: "Игры · JavaScript · Canvas · 2021–2023",
    dot: "f",
    linkHref: "https://github.com/Alexanderadon/Alexanderadon.github.io",
    linkAria: "Открыть репозиторий мини-игр на Canvas на GitHub",
    listTitle: "Мини-игры на Canvas",
    listSub: "Snake · RedKiller · aim-тренажёр · JavaScript",
    listCat: "игры",
  },
  {
    index: "/08",
    cat: "sites",
    wide: false,
    kind: "svg",
    preview: "sneakers",
    title: "Sneakers — SPA-магазин на React",
    tag: "Сайты · React 18 · Router 6 · MockAPI · 2024",
    dot: "b",
    linkHref: "https://github.com/Alexanderadon/react-shop",
    linkAria: "Открыть репозиторий Sneakers на GitHub",
    listTitle: "Sneakers",
    listSub: "SPA-магазин · React 18 · Router 6 · MockAPI · 2024",
    listCat: "сайты",
  },
  {
    index: "/09",
    cat: "games",
    wide: false,
    kind: "svg",
    preview: "muckliker",
    title: "Muckliker — прототип игры на Godot",
    tag: "Игры · Godot · GDScript · в разработке · 2026",
    dot: "f",
    listTitle: "Muckliker",
    listSub: "прототип игры · Godot · GDScript · 2026",
    listCat: "игры",
  },
  {
    index: "/10",
    cat: "video",
    wide: false,
    kind: "video",
    title: "«Кто такие QazSoft?» — промо-ролик",
    tag: "Видео · моушн · Instagram · 2024",
    dot: "f",
    videoSrc: "/video/qazsoft.mp4",
    poster: "/img/works/qazsoft-poster.jpg",
    videoAria: "Промо-ролик «Кто такие QazSoft?»",
    reelHref: "https://www.instagram.com/reel/C9J0kqQOM6I/",
    reelAria: "Открыть reel «Кто такие QazSoft?» в Instagram",
    listTitle: "Кто такие QazSoft?",
    listSub: "промо-ролик · моушн · Instagram · 2024",
    listCat: "видео",
  },
];
