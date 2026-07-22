// Панель «эксперимент» (.expl): палитра / шрифты / тумблер маскота.
// Открытие/закрытие + Escape. aria-pressed производны от префов; подписи — из словаря.
import { useEffect, useRef, useState } from "react";
import { useLang } from "~/lib/i18n";
import { usePrefs } from "~/lib/prefs";
import type { Fonts, Palette } from "~/lib/prefs";

const PALETTES: Palette[] = ["ugol", "graphite", "midnight"];
const FONT_PAIRS: Fonts[] = ["brand", "strict"];

export function ExperimentPanel() {
  const { t } = useLang();
  const {
    palette,
    fonts,
    mascotOn,
    handsOn,
    setPalette,
    setFonts,
    toggleMascot,
    toggleHands,
  } = usePrefs();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="expl" id="expl">
      <div className="exp-body" id="expBody" hidden={!open}>
        <span className="exp-t">{t.experiment.title}</span>
        <div className="exp-row" role="group" aria-label="Палитра">
          <span>{t.experiment.palette}</span>
          {PALETTES.map((pal) => (
            <button
              key={pal}
              data-pal={pal}
              aria-pressed={palette === pal}
              onClick={() => setPalette(pal)}
            >
              {t.experiment.palettes[pal]}
            </button>
          ))}
        </div>
        <div className="exp-row" role="group" aria-label="Шрифтовая пара">
          <span>{t.experiment.fonts}</span>
          {FONT_PAIRS.map((fp) => (
            <button
              key={fp}
              data-fp={fp}
              aria-pressed={fonts === fp}
              onClick={() => setFonts(fp)}
            >
              {t.experiment.fontPairs[fp]}
            </button>
          ))}
        </div>
        <div className="exp-row">
          <span>{t.experiment.mascot}</span>
          <button id="mToggle" aria-pressed={mascotOn} onClick={toggleMascot}>
            {mascotOn ? t.experiment.on : t.experiment.off}
          </button>
        </div>
        <div className="exp-row">
          <span>{t.experiment.hands}</span>
          <button id="hToggle" aria-pressed={handsOn} onClick={toggleHands}>
            {handsOn ? t.experiment.on : t.experiment.off}
          </button>
        </div>
      </div>
      <button
        className="exp-btn"
        id="expBtn"
        ref={btnRef}
        aria-expanded={open}
        aria-label="Панель эксперимента"
        onClick={() => setOpen((o) => !o)}
      >
        ⚙
      </button>
    </div>
  );
}
