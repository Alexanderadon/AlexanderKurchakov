// Шапка: печать, навигация (data-goto → фильтр + скролл к работам), переключатель языка.
import type { MouseEvent } from "react";
import type { FilterCategory } from "~/data/works";
import type { Lang } from "~/lib/i18n";
import { useLang } from "~/lib/i18n";
import { useWorks } from "~/lib/works-context";
import { prefersReducedMotion } from "~/lib/media";

const LANGS: { code: Lang; label: string }[] = [
  { code: "kz", label: "KZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export function Header() {
  const { lang, setLang, t } = useLang();
  const { setCategory } = useWorks();

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
