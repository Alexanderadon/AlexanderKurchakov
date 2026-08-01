// Шапка: печать, навигация (data-goto → фильтр + скролл к работам),
// тумблер рук, переключатель языка.
import type { MouseEvent } from "react";
import type { FilterCategory } from "~/data/works";
import type { Lang } from "~/lib/i18n";
import { useLang } from "~/lib/i18n";
import { useWorks } from "~/lib/works-context";
import { usePrefs } from "~/lib/prefs";
import { prefersReducedMotion } from "~/lib/media";

const LANGS: { code: Lang; label: string }[] = [
  { code: "kz", label: "KZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export function Header() {
  const { lang, setLang, t } = useLang();
  const { setCategory } = useWorks();
  const { handsOn, toggleHands } = usePrefs();

  const goto =
    (cat: FilterCategory) => (e: MouseEvent<HTMLAnchorElement>): void => {
      e.preventDefault();
      setCategory(cat, { silent: true });
      const works = document.getElementById("works");
      if (works)
        works.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    };

  return (
    <header>
      <div className="hwrap">
        <a className="seal" href="#top" aria-label="АК — на главную">
          АК
        </a>
        <span className="hname">{t.header.name}</span>
        <nav aria-label="Разделы">
          <a href="#works" data-goto="all" className="mg" onClick={goto("all")}>
            {t.header.nav.works}
          </a>
          <a href="#works" data-goto="games" className="mg" onClick={goto("games")}>
            {t.header.nav.games}
          </a>
          <a href="#works" data-goto="video" className="mg" onClick={goto("video")}>
            {t.header.nav.video}
          </a>
          <a href="#about" className="mg keep">
            {t.header.nav.about}
          </a>
        </nav>
        <button
          className="htog"
          aria-pressed={handsOn}
          onClick={toggleHands}
          title={t.experiment.hands + ": " + (handsOn ? t.experiment.on : t.experiment.off)}
        >
          {/* Линейная ладонь вместо эмодзи: эмодзи красится системой и спорил
              со стилем шапки, а штриховая иконка наследует цвет состояний
              кнопки (золото включено, приглушённый выключено). */}
          <svg
            aria-hidden="true"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 11V6a2 2 0 0 0-4 0v5" />
            <path d="M14 10V4a2 2 0 0 0-4 0v2" />
            <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <span className="htog-t">{t.experiment.hands}</span>
        </button>
        <div className="langs" role="group" aria-label="Язык">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
