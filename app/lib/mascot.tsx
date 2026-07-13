// Императивный контроллер маскота. Компонент Mascot регистрирует handle,
// потребители (Works) вызывают say / setFigure через стабильные обёртки.
import { createContext, useContext, useMemo, useRef } from "react";
import type { ReactNode, RefObject } from "react";

export type FigureName = "fire" | "dark" | "wide" | "buddy" | "tall";

export interface MascotHandle {
  say: (text: string) => void;
  setFigure: (name: FigureName, phrase: string) => void;
}

const MascotContext = createContext<RefObject<MascotHandle | null> | null>(null);

export function MascotProvider({ children }: { children: ReactNode }) {
  const ref = useRef<MascotHandle | null>(null);
  return (
    <MascotContext.Provider value={ref}>{children}</MascotContext.Provider>
  );
}

// Для компонента Mascot: положить сюда свой imperative handle.
export function useMascotRef(): RefObject<MascotHandle | null> {
  const ref = useContext(MascotContext);
  if (!ref) throw new Error("useMascotRef must be used within MascotProvider");
  return ref;
}

// Для потребителей: стабильные обёртки, делегирующие текущему handle.
export function useMascot(): MascotHandle {
  const ref = useContext(MascotContext);
  if (!ref) throw new Error("useMascot must be used within MascotProvider");
  return useMemo<MascotHandle>(
    () => ({
      say: (t) => ref.current?.say(t),
      setFigure: (n, p) => ref.current?.setFigure(n, p),
    }),
    [ref],
  );
}
