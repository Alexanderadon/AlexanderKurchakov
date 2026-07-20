// Трёхъязычность RU/KZ/EN без сторонних библиотек: словари + контекст.
// Persist в localStorage "bento2:lang" (ранняя синхронизация — BOOT в root.tsx),
// при смене языка обновляется document.documentElement.lang (ru / kk / en).
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "ru" | "kz" | "en";

// Переводимая строка в данных (works / experience / stack).
export type Localized = Record<Lang, string>;

// Компактный конструктор Localized-строк для файлов данных.
export const L = (ru: string, kz: string, en: string): Localized => ({ ru, kz, en });

// Строка, одинаковая во всех языках (имена собственные, техтермины).
export const same = (s: string): Localized => ({ ru: s, kz: s, en: s });

// html lang: у казахского код языка — "kk" (не "kz").
const HTML_LANG: Record<Lang, string> = { ru: "ru", kz: "kk", en: "en" };

const RU = {
  header: {
    name: "курчаков · портфолио",
    nav: { works: "Работы", games: "Игры", video: "Видео", about: "Обо мне" },
  },
  hero: {
    portfolio: "портфолио — 2026",
    location: "Алматы, Казахстан",
    now: "сейчас в работе",
    nowName: "KIDO — SaaS-платформа детских курсов",
    nowLine: "fix(booking): validation i18n · сегодня",
    roleLabel: "/ роль",
    roleA: "разработчик",
    roleB: "& дизайнер",
    roleSub:
      "frontend из Алматы · React, Next.js, Web3 — плюс айдентика, игры и видео",
    base: "база",
    city: "Алматы",
    contacts: "контакты",
    released: "выпущено",
    releasedCap: "проектов — от лендингов до игровых прототипов",
    seal: "печать",
  },
  marquee: ["сайты", "игры", "айдентика", "видео", "шеберлік", "匠心", "мастерство"],
  works: {
    label: "избранное 2021–2026",
    title: "Работы",
    grid: "сетка",
    list: "список",
  },
  about: {
    label: "коротко",
    title: "Обо мне",
    photoCaption: "Александр Курчаков · 22 года · Алматы",
    workLabel: "о работе",
    bio: "В разработке с 2019: начинал на фрилансе с сайтов, лого и фирстилей, делал сайты федерации QAZAQSTAN RUGBY, вырос до middle React-разработчика в QazSoft — SPA на React/Next, микросервисы, 3D на Three.js. Сейчас делаю коммерческие продукты: iiko-интеграции для HoReCa, платежи Stripe, Web3 — TON Connect и WalletConnect. Дизайн-бэкграунд никуда не делся — ",
    bioEm: "Figma и код в одних руках.",
    resume: "резюме (PDF)",
    write: "написать мне",
    tz: "Алматы · UTC+5",
    expLabel: "/ опыт",
    education:
      "Образование: IT-колледж + университет (КЗ) · Языки: RU родной · EN B1",
    factExp: "опыт",
    factExpCap: "лет в разработке и дизайне — с 2019",
    factDone: "сделано",
    factDoneCap: "проектов — от лендингов до Web3",
    factLangs: "языки",
    factLangsCap: "рабочие языки",
    toolsLabel: "/ инструменты",
    keyStack: "ключевой стек",
    oneStack: "один стек — от идеи до релиза",
  },
  footer: {
    copy: "© 2026 Александр Курчаков · Алматы",
    motif: "шеберлік · 匠心 · мастерство",
  },
  mascot: {
    sections: {
      hero: "сәлем! я тут гид",
      works: "это все мои работы",
      about: "немного обо мне",
    },
    footerPhrase: "пиши — не стесняйся",
    quips: ["ойбай!", "код и кисть", "шеберлік!", "你好!"],
    showing: "показываю: ",
    listView: "редкий гость! это индекс",
    gridView: "и снова плитки",
  },
  experiment: {
    title: "эксперимент",
    palette: "палитра",
    palettes: { ugol: "уголь", graphite: "графит", midnight: "полночь" },
    fonts: "шрифты",
    fontPairs: { brand: "фирменная", strict: "строгая" },
    mascot: "маскот",
    on: "вкл",
    off: "выкл",
  },
  video: { watch: "смотреть", sndOff: "звук выкл", sndOn: "звук вкл" },
};

export type Dict = typeof RU;

const KZ: Dict = {
  header: {
    name: "курчаков · портфолио",
    nav: { works: "Жұмыстар", games: "Ойындар", video: "Бейне", about: "Мен туралы" },
  },
  hero: {
    portfolio: "портфолио — 2026",
    location: "Алматы, Қазақстан",
    now: "қазір жұмыста",
    nowName: "KIDO — балалар курстарына арналған SaaS-платформа",
    nowLine: "fix(booking): validation i18n · бүгін",
    roleLabel: "/ рөл",
    roleA: "әзірлеуші",
    roleB: "& дизайнер",
    roleSub:
      "Алматыдан frontend · React, Next.js, Web3 — оған қоса айдентика, ойындар және бейне",
    base: "база",
    city: "Алматы",
    contacts: "байланыс",
    released: "шығарылды",
    releasedCap: "жоба — лендингтерден ойын прототиптеріне дейін",
    seal: "мөр",
  },
  marquee: ["сайттар", "ойындар", "айдентика", "бейне", "шеберлік", "匠心", "өнер"],
  works: {
    label: "таңдаулылар 2021–2026",
    title: "Жұмыстар",
    grid: "тор",
    list: "тізім",
  },
  about: {
    label: "қысқаша",
    title: "Мен туралы",
    photoCaption: "Александр Курчаков · 22 жаста · Алматы",
    workLabel: "жұмыс туралы",
    bio: "Әзірлеуде 2019 жылдан бері: фрилансте сайттардан, лого мен фирмалық стильдерден бастадым, QAZAQSTAN RUGBY федерациясының сайттарын жасадым, QazSoft-та middle React-әзірлеушіге дейін өстім — React/Next-тегі SPA, микросервистер, Three.js-тегі 3D. Қазір коммерциялық өнімдер жасаймын: HoReCa үшін iiko-интеграциялар, Stripe төлемдері, Web3 — TON Connect және WalletConnect. Дизайн-бэкграунд еш жоғалған жоқ — ",
    bioEm: "Figma мен код бір қолда.",
    resume: "түйіндеме (PDF)",
    write: "маған жазу",
    tz: "Алматы · UTC+5",
    expLabel: "/ тәжірибе",
    education:
      "Білім: IT-колледж + университет (ҚР) · Тілдер: RU ана тілі · EN B1",
    factExp: "тәжірибе",
    factExpCap: "жыл әзірлеу мен дизайнда — 2019 жылдан",
    factDone: "жасалды",
    factDoneCap: "жоба — лендингтерден Web3-ке дейін",
    factLangs: "тілдер",
    factLangsCap: "жұмыс тілдері",
    toolsLabel: "/ құралдар",
    keyStack: "негізгі стек",
    oneStack: "бір стек — идеядан релизге дейін",
  },
  footer: {
    copy: "© 2026 Александр Курчаков · Алматы",
    motif: "шеберлік · 匠心 · өнер",
  },
  mascot: {
    sections: {
      hero: "сәлем! мен мұнда гидпін",
      works: "мынау — менің жұмыстарым",
      about: "мен туралы аздап",
    },
    footerPhrase: "жаз — ұялма",
    quips: ["ойбай!", "код пен қылқалам", "шеберлік!", "你好!"],
    showing: "көрсетемін: ",
    listView: "сирек қонақ! бұл — индекс",
    gridView: "қайтадан тақтайшалар",
  },
  experiment: {
    title: "эксперимент",
    palette: "палитра",
    palettes: { ugol: "көмір", graphite: "графит", midnight: "түн ортасы" },
    fonts: "қаріптер",
    fontPairs: { brand: "фирмалық", strict: "қатаң" },
    mascot: "маскот",
    on: "қосулы",
    off: "өшірулі",
  },
  video: { watch: "қарау", sndOff: "дыбыс өшірулі", sndOn: "дыбыс қосулы" },
};

const EN: Dict = {
  header: {
    name: "kurchakov · portfolio",
    nav: { works: "Works", games: "Games", video: "Video", about: "About" },
  },
  hero: {
    portfolio: "portfolio — 2026",
    location: "Almaty, Kazakhstan",
    now: "in progress now",
    nowName: "KIDO — SaaS platform for kids' courses",
    nowLine: "fix(booking): validation i18n · today",
    roleLabel: "/ role",
    roleA: "developer",
    roleB: "& designer",
    roleSub:
      "frontend from Almaty · React, Next.js, Web3 — plus identity, games and video",
    base: "base",
    city: "Almaty",
    contacts: "contacts",
    released: "shipped",
    releasedCap: "projects — from landing pages to game prototypes",
    seal: "seal",
  },
  marquee: ["sites", "games", "identity", "video", "шеберлік", "匠心", "mastery"],
  works: {
    label: "selected 2021–2026",
    title: "Works",
    grid: "grid",
    list: "list",
  },
  about: {
    label: "in brief",
    title: "About me",
    photoCaption: "Alexander Kurchakov · 22 y.o. · Almaty",
    workLabel: "about work",
    bio: "In development since 2019: started out freelancing with websites, logos and brand identities, built websites for the QAZAQSTAN RUGBY federation, grew into a middle React developer at QazSoft — React/Next SPAs, microservices, 3D with Three.js. Now I build commercial products: iiko integrations for HoReCa, Stripe payments, Web3 — TON Connect and WalletConnect. The design background never went away — ",
    bioEm: "Figma and code in the same hands.",
    resume: "CV (PDF)",
    write: "email me",
    tz: "Almaty · UTC+5",
    expLabel: "/ experience",
    education:
      "Education: IT college + university (KZ) · Languages: RU native · EN B1",
    factExp: "experience",
    factExpCap: "years in development and design — since 2019",
    factDone: "shipped",
    factDoneCap: "projects — from landing pages to Web3",
    factLangs: "languages",
    factLangsCap: "working languages",
    toolsLabel: "/ tools",
    keyStack: "core stack",
    oneStack: "one stack — from idea to release",
  },
  footer: {
    copy: "© 2026 Alexander Kurchakov · Almaty",
    motif: "шеберлік · 匠心 · mastery",
  },
  mascot: {
    sections: {
      hero: "hi! I'm your guide here",
      works: "these are all my works",
      about: "a bit about me",
    },
    footerPhrase: "drop me a line",
    quips: ["ойбай!", "code & brush", "шеберлік!", "你好!"],
    showing: "showing: ",
    listView: "a rare guest! this is the index",
    gridView: "back to tiles",
  },
  experiment: {
    title: "experiment",
    palette: "palette",
    palettes: { ugol: "charcoal", graphite: "graphite", midnight: "midnight" },
    fonts: "fonts",
    fontPairs: { brand: "brand", strict: "strict" },
    mascot: "mascot",
    on: "on",
    off: "off",
  },
  video: { watch: "watch", sndOff: "sound off", sndOn: "sound on" },
};

const DICTS: Record<Lang, Dict> = { ru: RU, kz: KZ, en: EN };

interface LangValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const LangContext = createContext<LangValue | null>(null);

function readStored(): Lang {
  try {
    const v = localStorage.getItem("bento2:lang");
    if (v === "kz" || v === "en") return v;
  } catch {
    /* localStorage недоступен — остаёмся на ru */
  }
  return "ru";
}

export function LangProvider({ children }: { children: ReactNode }) {
  // SSR/prerender всегда рендерит RU (совпадает с разметкой) — после маунта
  // подтягиваем сохранённый язык; html.lang уже выставлен BOOT-скриптом.
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const stored = readStored();
    if (stored !== "ru") {
      setLangState(stored);
      document.documentElement.lang = HTML_LANG[stored];
    }
  }, []);

  const setLang = (l: Lang): void => {
    setLangState(l);
    document.documentElement.lang = HTML_LANG[l];
    try {
      localStorage.setItem("bento2:lang", l);
    } catch {
      /* игнорируем */
    }
  };

  const value = useMemo<LangValue>(
    () => ({ lang, setLang, t: DICTS[lang] }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
