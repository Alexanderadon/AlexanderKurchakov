// Шапка: печать, навигация (data-goto → фильтр + скролл к работам), языки (статичны).
import type { MouseEvent } from "react";
import type { FilterCategory } from "~/data/works";
import { useWorks } from "~/lib/works-context";
import { prefersReducedMotion } from "~/lib/media";

export function Header() {
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
        <span className="hname">курчаков · портфолио</span>
        <nav aria-label="Разделы">
          <a href="#works" data-goto="all" className="mg" onClick={goto("all")}>
            Работы
          </a>
          <a href="#works" data-goto="games" className="mg" onClick={goto("games")}>
            Игры
          </a>
          <a href="#works" data-goto="video" className="mg" onClick={goto("video")}>
            Видео
          </a>
          <a href="#about" className="mg keep">
            Обо мне
          </a>
        </nav>
        <div className="langs" role="group" aria-label="Язык">
          <button aria-pressed="false">KZ</button>
          <button aria-pressed="true">RU</button>
          <button aria-pressed="false">EN</button>
        </div>
      </div>
    </header>
  );
}
