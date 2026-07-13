// UI-префы: палитра / шрифты / маскот. Пишет в localStorage ("bento2:*")
// и ставит data-palette / data-fonts на <html>. Ключи и логика 1:1 с прежним site-script.
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Palette = "ugol" | "graphite" | "midnight";
export type Fonts = "brand" | "strict";

interface PrefsValue {
  palette: Palette;
  fonts: Fonts;
  mascotOn: boolean;
  setPalette: (p: Palette) => void;
  setFonts: (f: Fonts) => void;
  toggleMascot: () => void;
}

const PrefsContext = createContext<PrefsValue | null>(null);

function store(key: string, value: string): void {
  try {
    localStorage.setItem("bento2:" + key, value);
  } catch {
    /* localStorage недоступен — молча игнорируем */
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  // Начальные значения совпадают с SSR-разметкой (по умолчанию уголь/фирменная/маскот вкл).
  // BOOT-скрипт уже восстановил data-palette / data-fonts на <html> до отрисовки —
  // после маунта подтягиваем фактическое состояние (aria-pressed правится рендером).
  const [palette, setPaletteState] = useState<Palette>("ugol");
  const [fonts, setFontsState] = useState<Fonts>("brand");
  const [mascotOn, setMascotOn] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const p = root.getAttribute("data-palette");
    if (p === "graphite" || p === "midnight") setPaletteState(p);
    if (root.getAttribute("data-fonts") === "strict") setFontsState("strict");
    try {
      if (localStorage.getItem("bento2:mascot") === "off") setMascotOn(false);
    } catch {
      /* игнорируем */
    }
  }, []);

  const setPalette = (p: Palette): void => {
    setPaletteState(p);
    const root = document.documentElement;
    if (p === "ugol") root.removeAttribute("data-palette");
    else root.setAttribute("data-palette", p);
    store("palette", p === "ugol" ? "" : p);
  };

  const setFonts = (f: Fonts): void => {
    setFontsState(f);
    const root = document.documentElement;
    if (f === "brand") root.removeAttribute("data-fonts");
    else root.setAttribute("data-fonts", f);
    store("fonts", f === "brand" ? "" : f);
  };

  const toggleMascot = (): void => {
    setMascotOn((on) => {
      const next = !on;
      store("mascot", next ? "" : "off");
      return next;
    });
  };

  return (
    <PrefsContext.Provider
      value={{ palette, fonts, mascotOn, setPalette, setFonts, toggleMascot }}
    >
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs(): PrefsValue {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}
