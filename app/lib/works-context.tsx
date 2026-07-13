// Общий фильтр категории для Header (nav data-goto) и Works (pills + список).
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { FilterCategory } from "~/data/works";
import { PILLS } from "~/data/works";
import { useMascot } from "./mascot";

interface WorksValue {
  category: FilterCategory;
  setCategory: (cat: FilterCategory, opts?: { silent?: boolean }) => void;
}

const WorksContext = createContext<WorksValue | null>(null);

export function WorksProvider({ children }: { children: ReactNode }) {
  const [category, setCategoryState] = useState<FilterCategory>("all");
  const { say } = useMascot();

  const setCategory = (
    cat: FilterCategory,
    opts?: { silent?: boolean },
  ): void => {
    setCategoryState(cat);
    if (!opts?.silent) {
      const label = PILLS.find((p) => p.cat === cat)?.label ?? "";
      say("показываю: " + label.toLowerCase());
    }
  };

  return (
    <WorksContext.Provider value={{ category, setCategory }}>
      {children}
    </WorksContext.Provider>
  );
}

export function useWorks(): WorksValue {
  const ctx = useContext(WorksContext);
  if (!ctx) throw new Error("useWorks must be used within WorksProvider");
  return ctx;
}
