import type { CSSProperties } from "react";

// Инлайн CSS-переменные (напр. --i для stagger имени) со строгим типом.
export function cssVars(
  vars: Record<string, string | number>,
): CSSProperties {
  return vars as CSSProperties;
}
