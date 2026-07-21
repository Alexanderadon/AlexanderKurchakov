// Типизированные данные 24 работ + фильтры. Источник истины — прежний site-markup.ts.
// Переводимые строки — Localized ({ru,kz,en}); имена собственные и техтермины
// не переводятся (helper `same`). Категории карточек (без "all") и фильтра (с "all").
import type { Localized } from "~/lib/i18n";
import { L, same } from "~/lib/i18n";

export type Category = "sites" | "design" | "games" | "video" | "logo";
export type FilterCategory = "all" | Category;

// Ключ инлайн-SVG-превью карточки (резолвится в WorkCard → components/previews).
export type PreviewKey = "canvas" | "sneakers" | "muckliker";

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
  imgPos?: string; // object-position, если центр-кроп режет важное (напр. "left center")
  // ссылка-обёртка .wlink
  linkHref?: string;
  linkAria?: Localized;
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
    kind: "img",
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
    imgSrc: "/img/works/kido-card.jpg",
    imgAlt: "KIDO — живой сайт: каталог детских курсов",
    imgPos: "left center",
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
    kind: "img",
    title: L(
      "Логотипы и фирстили — фриланс",
      "Логотиптер мен фирмалық стильдер — фриланс",
      "Logos & brand identities — freelance",
    ),
    tag: L(
      "Лого · монограмма A/T · 3 версии · 2021",
      "Лого · A/T монограммасы · 3 нұсқа · 2021",
      "Logo · A/T monogram · 3 versions · 2021",
    ),
    dot: "b",
    imgSrc: "/img/works/logofolio-card.jpg",
    imgAlt: "Монограмма A/T — три цветовые версии логотипа",
    imgPos: "left center",
    listTitle: L(
      "Логотипы и фирстили",
      "Логотиптер мен фирмалық стильдер",
      "Logos & brand identities",
    ),
    listSub: L(
      "монограмма A/T: белая, чёрная, красная версии · 2021",
      "A/T монограммасы: ақ, қара, қызыл нұсқалар · 2021",
      "A/T monogram: white, black, red versions · 2021",
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
    linkAria: L(
      "Открыть живое демо «Апорт»",
      "«Апорт» тірі демосын ашу",
      "Open the live Aport demo",
    ),
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
    linkAria: L(
      "Открыть проект POLOGO на Behance",
      "POLOGO жобасын Behance-те ашу",
      "Open the POLOGO project on Behance",
    ),
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
    linkAria: L(
      "Открыть репозиторий мини-игр на Canvas на GitHub",
      "Canvas мини-ойындар репозиторийін GitHub-та ашу",
      "Open the Canvas mini-games repository on GitHub",
    ),
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
    linkAria: L(
      "Открыть репозиторий Sneakers на GitHub",
      "Sneakers репозиторийін GitHub-та ашу",
      "Open the Sneakers repository on GitHub",
    ),
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
  {
    index: "/11",
    cat: "sites",
    wide: true,
    kind: "img",
    title: L(
      "sitereel — ссылка → видео сайта",
      "sitereel — сілтеме → сайт бейнесі",
      "sitereel — link → website video",
    ),
    tag: L(
      "Сайты · Next.js 16 · Puppeteer · FFmpeg · 2026",
      "Сайттар · Next.js 16 · Puppeteer · FFmpeg · 2026",
      "Sites · Next.js 16 · Puppeteer · FFmpeg · 2026",
    ),
    dot: "b",
    imgSrc: "/img/works/sitereel-card.jpg",
    imgAlt:
      "sitereel — интерфейс генератора: поле для ссылки на сайт, форматы 9:16 / 1:1 / 16:9 и кнопка «Сделать видео»",
    listTitle: same("sitereel"),
    listSub: L(
      "генератор скролл-видео сайтов · Next.js · 2026",
      "сайттардың скролл-бейне генераторы · Next.js · 2026",
      "website scroll-video generator · Next.js · 2026",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/12",
    cat: "design",
    wide: false,
    kind: "img",
    title: L(
      "Мастера — платформа специалистов",
      "Мастера — мамандар платформасы",
      "Mastera — specialists platform",
    ),
    tag: L(
      "Дизайн · UI/UX · 16 страниц · Behance · 2023",
      "Дизайн · UI/UX · 16 бет · Behance · 2023",
      "Design · UI/UX · 16 pages · Behance · 2023",
    ),
    dot: "f",
    imgSrc: "/img/works/profi-card.jpg",
    imgPos: "left center",
    imgAlt:
      "Мастера — обложка проекта на Behance: макет платформы поиска специалистов, 16 страниц за 2 дня",
    linkHref:
      "https://www.behance.net/gallery/177150195/sajt-veb-sajt-sajt-dlja-profi-UIUX",
    linkAria: L(
      "Открыть проект Мастера на Behance",
      "Мастера жобасын Behance-те ашу",
      "Open the Mastera project on Behance",
    ),
    listTitle: L("Мастера", "Мастера", "Mastera"),
    listSub: L(
      "платформа специалистов · UI/UX · 16 страниц · Behance · 2023",
      "мамандар платформасы · UI/UX · 16 бет · Behance · 2023",
      "specialists platform · UI/UX · 16 pages · Behance · 2023",
    ),
    listCat: CAT_DESIGN,
  },
  {
    index: "/13",
    cat: "sites",
    wide: false,
    kind: "img",
    title: L(
      "Это портфолио — сайт, который ты смотришь",
      "Осы портфолио — қарап отырған сайтың",
      "This portfolio — the site you're viewing",
    ),
    tag: L(
      "Сайты · React Router · i18n RU/KZ/EN · маскоты · 2026",
      "Сайттар · React Router · i18n RU/KZ/EN · маскоттар · 2026",
      "Sites · React Router · i18n RU/KZ/EN · mascots · 2026",
    ),
    dot: "b",
    imgSrc: "/img/works/portfolio-card.jpg",
    imgAlt:
      "Скриншот этого портфолио: тёмная главная с заголовком «Александр», карточкой роли и виджетом «сейчас в работе»",
    listTitle: L("Это портфолио", "Осы портфолио", "This portfolio"),
    listSub: L(
      "сайт, который ты смотришь · React Router · i18n RU/KZ/EN · 2026",
      "қарап отырған сайтың · React Router · i18n RU/KZ/EN · 2026",
      "the site you're viewing · React Router · i18n RU/KZ/EN · 2026",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/14",
    cat: "sites",
    wide: false,
    kind: "img",
    title: L(
      "Воздух Алматы — мониторинг качества воздуха",
      "Алматы ауасы — ауа сапасының мониторингі",
      "Almaty Air — air quality monitoring",
    ),
    tag: L(
      "Сайты · Next.js · Supabase · Leaflet · PWA · 2026",
      "Сайттар · Next.js · Supabase · Leaflet · PWA · 2026",
      "Sites · Next.js · Supabase · Leaflet · PWA · 2026",
    ),
    dot: "b",
    imgSrc: "/img/works/almaty-air-card.jpg",
    imgAlt:
      "Воздух Алматы — дашборд качества воздуха: карта районов города с индексами загрязнения и показателями PM2.5",
    imgPos: "center top",
    linkHref: "https://almaty-air-two.vercel.app",
    linkAria: L(
      "Открыть живой сайт «Воздух Алматы»",
      "«Алматы ауасы» тірі сайтын ашу",
      "Open the live Almaty Air website",
    ),
    listTitle: L("Воздух Алматы", "Алматы ауасы", "Almaty Air"),
    listSub: L(
      "PWA-дашборд качества воздуха · карта районов · 2026",
      "ауа сапасының PWA-дашборды · аудандар картасы · 2026",
      "air quality PWA dashboard · district map · 2026",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/15",
    cat: "sites",
    wide: false,
    kind: "img",
    title: L(
      "Qazaqstan Rugby — сайт федерации регби",
      "Qazaqstan Rugby — регби федерациясының сайты",
      "Qazaqstan Rugby — rugby federation website",
    ),
    tag: L(
      "Сайты · WordPress-тема · TypeScript · 2021–2022",
      "Сайттар · WordPress тақырыбы · TypeScript · 2021–2022",
      "Sites · WordPress theme · TypeScript · 2021–2022",
    ),
    dot: "b",
    imgSrc: "/img/works/rugby-card.jpg",
    imgAlt:
      "Qazaqstan Rugby — главная страница сайта федерации регби: клубы, матчи и новости",
    imgPos: "center top",
    linkHref: "https://alexanderadon.github.io/dist/",
    linkAria: L(
      "Открыть демо сайта Qazaqstan Rugby",
      "Qazaqstan Rugby сайтының демосын ашу",
      "Open the Qazaqstan Rugby website demo",
    ),
    listTitle: same("Qazaqstan Rugby"),
    listSub: L(
      "сайт федерации: клубы, матчи, новости · 2022",
      "федерация сайты: клубтар, матчтар, жаңалықтар · 2022",
      "federation website: clubs, matches, news · 2022",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/16",
    cat: "sites",
    wide: false,
    kind: "img",
    title: L(
      "PO|ANIME — аниме-портал на October CMS",
      "PO|ANIME — October CMS-тегі аниме-порталы",
      "PO|ANIME — anime portal on October CMS",
    ),
    tag: L(
      "Сайты · October CMS · PHP · 2021",
      "Сайттар · October CMS · PHP · 2021",
      "Sites · October CMS · PHP · 2021",
    ),
    dot: "b",
    imgSrc: "/img/works/poanime-card.jpg",
    imgAlt:
      "PO|ANIME — главная страница аниме-портала на October CMS: витрина тайтлов, блог и магазин",
    imgPos: "center top",
    linkHref: "https://alexanderadon.github.io/site-12/assets/",
    linkAria: L(
      "Открыть демо PO|ANIME",
      "PO|ANIME демосын ашу",
      "Open the PO|ANIME demo",
    ),
    listTitle: same("PO|ANIME"),
    listSub: L(
      "аниме-портал: витрина, блог, магазин · 2021",
      "аниме-портал: витрина, блог, дүкен · 2021",
      "anime portal: showcase, blog, store · 2021",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/17",
    cat: "design",
    wide: false,
    kind: "img",
    title: L(
      "Wooder — лендинг мебельного бренда",
      "Wooder — жиһаз брендінің лендингі",
      "Wooder — furniture brand landing",
    ),
    tag: L(
      "Дизайн · вёрстка · HTML/Less · 2021",
      "Дизайн · вёрстка · HTML/Less · 2021",
      "Design · markup · HTML/Less · 2021",
    ),
    dot: "f",
    imgSrc: "/img/works/wooder-card.jpg",
    imgAlt:
      "Wooder — первый экран лендинга мебельного бренда: деревянная мебель и навигация",
    imgPos: "center top",
    linkHref: "https://alexanderadon.github.io/Wooder__site/",
    linkAria: L(
      "Открыть демо Wooder",
      "Wooder демосын ашу",
      "Open the Wooder demo",
    ),
    listTitle: same("Wooder"),
    listSub: L(
      "адаптивная вёрстка лендинга · HTML/Less · 2021",
      "лендингтің адаптивті вёрсткасы · HTML/Less · 2021",
      "responsive landing page markup · HTML/Less · 2021",
    ),
    listCat: CAT_DESIGN,
  },
  {
    index: "/18",
    cat: "sites",
    wide: false,
    kind: "img",
    title: L(
      "Fatalia — арт-бук тёмного фэнтези",
      "Fatalia — қараңғы фэнтези арт-кітабы",
      "Fatalia — dark fantasy art book",
    ),
    tag: L(
      "Сайты · Next.js 15 · 25 персонажей · 2026",
      "Сайттар · Next.js 15 · 25 кейіпкер · 2026",
      "Sites · Next.js 15 · 25 characters · 2026",
    ),
    dot: "b",
    imgSrc: "/img/works/fatalia-card.jpg",
    imgAlt:
      "Fatalia — цифровой арт-бук тёмного фэнтези: персонажи, лор и мир проекта",
    imgPos: "center top",
    linkHref: "https://fatalia.vercel.app",
    linkAria: L(
      "Открыть живой сайт Fatalia",
      "Fatalia тірі сайтын ашу",
      "Open the live Fatalia website",
    ),
    listTitle: same("Fatalia"),
    listSub: L(
      "цифровой арт-бук: персонажи, лор, мир · Next.js 15 · 2026",
      "цифрлық арт-кітап: кейіпкерлер, лор, әлем · Next.js 15 · 2026",
      "digital art book: characters, lore, world · Next.js 15 · 2026",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/19",
    cat: "sites",
    wide: false,
    kind: "img",
    title: L(
      "МАСТЕРА — маркетплейс услуг на React",
      "МАСТЕРА — React-тегі қызметтер маркетплейсі",
      "MASTERA — services marketplace in React",
    ),
    tag: L(
      "Сайты · React 18 · Redux Toolkit · Firebase · 16 страниц · 2023",
      "Сайттар · React 18 · Redux Toolkit · Firebase · 16 бет · 2023",
      "Sites · React 18 · Redux Toolkit · Firebase · 16 pages · 2023",
    ),
    dot: "b",
    imgSrc: "/img/works/mastera-card.jpg",
    imgAlt:
      "МАСТЕРА — маркетплейс услуг на React, реализация дизайна «Мастера» (/12): заказы, специалисты, профили",
    imgPos: "center top",
    listTitle: L("МАСТЕРА", "МАСТЕРА", "MASTERA"),
    listSub: L(
      "маркетплейс услуг: заказы, специалисты, профили · React · 2023",
      "қызметтер маркетплейсі: тапсырыстар, мамандар, профильдер · React · 2023",
      "services marketplace: orders, specialists, profiles · React · 2023",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/20",
    cat: "sites",
    wide: false,
    kind: "img",
    title: L(
      "Личный блог — WordPress со своей темой",
      "Жеке блог — өз тақырыбымен WordPress",
      "Personal blog — WordPress with a custom theme",
    ),
    tag: L(
      "Сайты · WordPress · Carbon Fields · своя тема · 2020–2022",
      "Сайттар · WordPress · Carbon Fields · өз тақырыбым · 2020–2022",
      "Sites · WordPress · Carbon Fields · custom theme · 2020–2022",
    ),
    dot: "b",
    imgSrc: "/img/works/blog-card.jpg",
    imgAlt:
      "Личный блог — живой WordPress: лента микропостов и карточка работы KzRugby",
    imgPos: "center top",
    listTitle: L("Личный блог", "Жеке блог", "Personal blog"),
    listSub: L(
      "живой WordPress-блог: своя тема, посты, микроблог · 2020–2022",
      "тірі WordPress-блог: өз тақырыбым, посттар, микроблог · 2020–2022",
      "live WordPress blog: custom theme, posts, microblog · 2020–2022",
    ),
    listCat: CAT_SITES,
  },
  {
    index: "/21",
    cat: "design",
    wide: false,
    kind: "img",
    title: L(
      "Инфографика для маркетплейсов",
      "Маркетплейстерге арналған инфографика",
      "Marketplace product infographics",
    ),
    tag: L(
      "Дизайн · Kaspi · Ozon · WB · серия из 10 · 2025",
      "Дизайн · Kaspi · Ozon · WB · 10 карточкадан тұратын серия · 2025",
      "Design · Kaspi · Ozon · WB · series of 10 · 2025",
    ),
    dot: "f",
    imgSrc: "/img/works/infografica-card.jpg",
    imgAlt:
      "Инфографика для маркетплейсов: продающие карточки товаров — аэрогриль, стайлер, пылесос",
    imgPos: "center top",
    listTitle: L("Инфографика", "Инфографика", "Infographics"),
    listSub: L(
      "продающие карточки товаров: аэрогрили, стайлер, пылесос · 2025",
      "сатушы тауар карточкалары: аэрогрильдер, стайлер, шаңсорғыш · 2025",
      "selling product cards: air fryers, styler, vacuum cleaner · 2025",
    ),
    listCat: CAT_DESIGN,
  },
  {
    index: "/22",
    cat: "design",
    wide: true,
    kind: "img",
    title: L(
      "Магазин продуктов — дизайн в Figma",
      "Азық-түлік дүкені — Figma-дағы дизайн",
      "Grocery store — Figma design",
    ),
    tag: L(
      "Дизайн · Figma · e-commerce · 12 макетов · доставка по Алматы · 2021",
      "Дизайн · Figma · e-commerce · 12 макет · Алматы бойынша жеткізу · 2021",
      "Design · Figma · e-commerce · 12 mockups · delivery in Almaty · 2021",
    ),
    dot: "f",
    imgSrc: "/img/works/figma-shop-card.jpg",
    imgAlt:
      "Магазин продуктов — Figma-макеты интернет-магазина с доставкой по Алматы: главная и каталог",
    imgPos: "center top",
    linkHref: "https://www.figma.com/file/sgvVY4bqYlDKaKsvTLjVzv",
    linkAria: L(
      "Открыть макеты магазина в Figma",
      "Дүкен макеттерін Figma-да ашу",
      "Open the store mockups in Figma",
    ),
    listTitle: L("Магазин продуктов", "Азық-түлік дүкені", "Grocery store"),
    listSub: L(
      "UI интернет-магазина с доставкой: каталог, карточка, блог · Figma · 2021",
      "жеткізуі бар интернет-дүкеннің UI-ы: каталог, карточка, блог · Figma · 2021",
      "online store UI with delivery: catalog, product page, blog · Figma · 2021",
    ),
    listCat: CAT_DESIGN,
  },
  {
    index: "/23",
    cat: "design",
    wide: false,
    kind: "img",
    title: L(
      "Дизайн блога — Figma-макеты",
      "Блог дизайны — Figma-макеттер",
      "Blog design — Figma mockups",
    ),
    tag: L(
      "Дизайн · Figma · 7 макетов · адаптив · 2021",
      "Дизайн · Figma · 7 макет · адаптив · 2021",
      "Design · Figma · 7 mockups · responsive · 2021",
    ),
    dot: "f",
    imgSrc: "/img/works/figma-blog-card.jpg",
    imgAlt:
      "Дизайн блога — Figma-макеты личного блога (/20): тёмная главная с постами",
    imgPos: "center top",
    linkHref: "https://www.figma.com/file/nWDCgisHHJmbJ7ujLkFExV",
    linkAria: L(
      "Открыть макеты блога в Figma",
      "Блог макеттерін Figma-да ашу",
      "Open the blog mockups in Figma",
    ),
    listTitle: L("Дизайн блога", "Блог дизайны", "Blog design"),
    listSub: L(
      "дизайн личного блога: desktop, tablet, mobile, 404 · Figma · 2021",
      "жеке блог дизайны: desktop, tablet, mobile, 404 · Figma · 2021",
      "personal blog design: desktop, tablet, mobile, 404 · Figma · 2021",
    ),
    listCat: CAT_DESIGN,
  },
  {
    index: "/24",
    cat: "design",
    wide: false,
    kind: "img",
    title: L(
      "QazSoft — SMM-постеры с маскотами",
      "QazSoft — маскоттары бар SMM-постерлер",
      "QazSoft — SMM posters with mascots",
    ),
    tag: L(
      "Дизайн · SMM · Instagram · маскоты · 2024",
      "Дизайн · SMM · Instagram · маскоттар · 2024",
      "Design · SMM · Instagram · mascots · 2024",
    ),
    dot: "f",
    imgSrc: "/img/works/qazsoft-posters-card.jpg",
    imgAlt:
      "QazSoft — тёмный промо-постер со скидкой 10% и огненным кубическим маскотом",
    imgPos: "center top",
    listTitle: L("QazSoft — SMM-постеры", "QazSoft — SMM-постерлер", "QazSoft — SMM posters"),
    listSub: L(
      "промо-постеры студии: скидки, приветствие, кубические маскоты · 2024",
      "студияның промо-постерлері: жеңілдіктер, сәлемдесу, кубтық маскоттар · 2024",
      "studio promo posters: discounts, welcome, cubic mascots · 2024",
    ),
    listCat: CAT_DESIGN,
  },
];
