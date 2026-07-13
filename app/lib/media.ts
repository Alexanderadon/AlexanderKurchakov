// Клиентские media-флаги (доступны только после маунта; на сервере — false).
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const pointerFine = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;
