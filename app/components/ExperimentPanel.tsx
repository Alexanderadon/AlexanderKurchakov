// Панель «эксперимент» (.expl): палитра / шрифты / тумблер маскота.
// Открытие/закрытие + Escape. aria-pressed производны от префов.
import { useEffect, useRef, useState } from "react";
import { usePrefs } from "~/lib/prefs";
import type { Fonts, Palette } from "~/lib/prefs";

const PALETTES: { pal: Palette; label: string }[] = [
  { pal: "ugol", label: "уголь" },
  { pal: "graphite", label: "графит" },
  { pal: "midnight", label: "полночь" },
];

const FONT_PAIRS: { fp: Fonts; label: string }[] = [
  { fp: "brand", label: "фирменная" },
  { fp: "strict", label: "строгая" },
];

export function ExperimentPanel() {
  const { palette, fonts, mascotOn, setPalette, setFonts, toggleMascot } =
    usePrefs();
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
        <span className="exp-t">эксперимент</span>
        <div className="exp-row" role="group" aria-label="Палитра">
          <span>палитра</span>
          {PALETTES.map(({ pal, label }) => (
            <button
              key={pal}
              data-pal={pal}
              aria-pressed={palette === pal}
              onClick={() => setPalette(pal)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="exp-row" role="group" aria-label="Шрифтовая пара">
          <span>шрифты</span>
          {FONT_PAIRS.map(({ fp, label }) => (
            <button
              key={fp}
              data-fp={fp}
              aria-pressed={fonts === fp}
              onClick={() => setFonts(fp)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="exp-row">
          <span>маскот</span>
          <button id="mToggle" aria-pressed={mascotOn} onClick={toggleMascot}>
            {mascotOn ? "вкл" : "выкл"}
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
