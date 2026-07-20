// Угловой маскот-компаньон. Смена фигур по секциям (IntersectionObserver),
// реплики-пузырь, клик-подпрыгивание, тумблер вкл/выкл. Императивная анимация
// фигур (on/out/jump) на refs — 1:1 с прежним site-script. Фигуры — инлайн-SVG
// (svgr-компоненты из его исходных персонажей): рендерятся полностью, включая
// foreignObject-детали глаз, и стилизуются правилом CSS `.m-fig svg`.
import { useCallback, useEffect, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import type { Dict } from "~/lib/i18n";
import { useLang } from "~/lib/i18n";
import { usePrefs } from "~/lib/prefs";
import { useMascotRef } from "~/lib/mascot";
import type { FigureName } from "~/lib/mascot";
import { prefersReducedMotion } from "~/lib/media";
import { Fire, Dark, Char02, Char04, Char05 } from "~/components/characters";

// data-m → компонент-персонаж
const FIGURES: { name: FigureName; Fig: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { name: "fire", Fig: Fire },
  { name: "dark", Fig: Dark },
  { name: "wide", Fig: Char02 },
  { name: "buddy", Fig: Char04 },
  { name: "tall", Fig: Char05 },
];

// Реплики — в словаре (t.mascot); здесь только соответствие секция → фигура → ключ.
type SectionKey = keyof Dict["mascot"]["sections"];
const SECTIONS: [string, FigureName, SectionKey][] = [
  ["hero", "fire", "hero"],
  ["works", "buddy", "works"],
  ["about", "dark", "about"],
];

export function Mascot() {
  const { mascotOn } = usePrefs();
  const handleRef = useMascotRef();

  // Актуальный словарь в ref: обработчики и IntersectionObserver-колбэки
  // читают его синхронно, не пересоздаваясь при смене языка.
  const { t } = useLang();
  const tRef = useRef(t);
  tRef.current = t;

  // Держим актуальное mOn в ref (обработчики/наблюдатели читают его синхронно).
  const mOnRef = useRef(mascotOn);
  mOnRef.current = mascotOn;

  const bubbleRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLButtonElement>(null);
  const figRefs = useRef<Record<FigureName, HTMLDivElement | null>>({
    fire: null,
    dark: null,
    wide: null,
    buddy: null,
    tall: null,
  });

  const curMRef = useRef<FigureName | null>(null);
  const wantMRef = useRef<FigureName>("fire");
  const bubTimer = useRef<number>(0);
  const hopTimer = useRef<number>(0);
  const figTimers = useRef<number[]>([]);
  const firstToggle = useRef(true);

  const say = useCallback((text: string): void => {
    if (!mOnRef.current || !text) return;
    const bubble = bubbleRef.current;
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add("show");
    clearTimeout(bubTimer.current);
    bubTimer.current = window.setTimeout(
      () => bubble.classList.remove("show"),
      3000,
    );
  }, []);

  const setM = useCallback(
    (name: FigureName, phrase: string): void => {
      wantMRef.current = name;
      const fig = figRefs.current;
      if (!mOnRef.current || !fig[name]) return;
      if (curMRef.current === name) {
        say(phrase);
        return;
      }
      const prev = curMRef.current ? fig[curMRef.current] : null;
      const next = fig[name];
      if (!next) return;
      curMRef.current = name;
      if (prefersReducedMotion()) {
        (Object.keys(fig) as FigureName[]).forEach((k) =>
          fig[k]?.classList.remove("on", "out", "jump"),
        );
        next.classList.add("on");
        say(phrase);
        return;
      }
      if (prev) {
        prev.classList.remove("on", "jump");
        prev.classList.add("out");
        figTimers.current.push(
          window.setTimeout(() => prev.classList.remove("out"), 340),
        );
      }
      next.classList.remove("out");
      next.classList.add("on", "jump");
      figTimers.current.push(
        window.setTimeout(() => next.classList.remove("jump"), 460),
      );
      say(phrase);
    },
    [say],
  );

  // Экспорт imperative handle для внешних вызовов (Works: setFigure/say).
  useEffect(() => {
    handleRef.current = { say, setFigure: setM };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, say, setM]);

  // Реакция на тумблер маскота (пропускаем самый первый прогон — им занят init-эффект).
  useEffect(() => {
    if (firstToggle.current) {
      firstToggle.current = false;
      return;
    }
    const fig = figRefs.current;
    if (mascotOn) {
      curMRef.current = null;
      setM(wantMRef.current, tRef.current.mascot.sections.hero);
    } else {
      bubbleRef.current?.classList.remove("show");
      (Object.keys(fig) as FigureName[]).forEach((k) =>
        fig[k]?.classList.remove("on", "out", "jump"),
      );
      curMRef.current = null;
    }
  }, [mascotOn, setM]);

  // Инициализация фигуры + наблюдатели секций/футера (один раз).
  useEffect(() => {
    // Не приветствуем, если маскот выключен в localStorage (как прежний init до applyMascot),
    // чтобы у вернувшихся с выключенным маскотом не мелькала фигура до синхронизации префов.
    let storedOff = false;
    try {
      storedOff = localStorage.getItem("bento2:mascot") === "off";
    } catch {
      storedOff = false;
    }
    if (mOnRef.current && !storedOff && !curMRef.current)
      setM(wantMRef.current, tRef.current.mascot.sections.hero);

    const cleanups: Array<() => void> = [];
    if ("IntersectionObserver" in window) {
      const mio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const id = (e.target as HTMLElement).id;
            const m = SECTIONS.find((x) => x[0] === id);
            if (m) setM(m[1], tRef.current.mascot.sections[m[2]]);
          });
        },
        { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
      );
      SECTIONS.forEach((x) => {
        const el = document.getElementById(x[0]);
        if (el) mio.observe(el);
      });
      cleanups.push(() => mio.disconnect());

      const fio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setM("tall", tRef.current.mascot.footerPhrase);
          });
        },
        { threshold: 0.85 },
      );
      const ftr = document.getElementById("contact");
      if (ftr) fio.observe(ftr);
      cleanups.push(() => fio.disconnect());
    }

    return () => {
      cleanups.forEach((f) => f());
      figTimers.current.forEach(clearTimeout);
      clearTimeout(bubTimer.current);
      clearTimeout(hopTimer.current);
    };
  }, [setM]);

  const onStageClick = (): void => {
    if (!mOnRef.current) return;
    const stage = stageRef.current;
    if (!prefersReducedMotion() && stage) {
      stage.classList.remove("hop");
      void stage.offsetWidth; // форсируем reflow для перезапуска анимации
      stage.classList.add("hop");
      clearTimeout(hopTimer.current);
      hopTimer.current = window.setTimeout(
        () => stage.classList.remove("hop"),
        520,
      );
    }
    const quips = tRef.current.mascot.quips;
    say(quips[Math.floor(Math.random() * quips.length)]);
  };

  return (
    <div className="mascot" id="mascot" aria-hidden="true" hidden={!mascotOn}>
      <div className="m-bubble" id="mBubble" ref={bubbleRef} />
      <button
        className="m-stage"
        id="mStage"
        tabIndex={-1}
        aria-hidden="true"
        ref={stageRef}
        onClick={onStageClick}
      >
        {FIGURES.map(({ name, Fig }) => (
          <div
            className="m-fig"
            data-m={name}
            key={name}
            ref={(el) => {
              figRefs.current[name] = el;
            }}
          >
            <Fig aria-hidden="true" />
          </div>
        ))}
      </button>
    </div>
  );
}
