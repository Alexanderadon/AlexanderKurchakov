// Магнитные ссылки (.mg): только pointer:fine и без reduced-motion.
import { useEffect } from "react";
import type { RefObject } from "react";
import { pointerFine, prefersReducedMotion } from "~/lib/media";

export function useMagneticLinks(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (prefersReducedMotion() || !pointerFine()) return;
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>(".mg"));
    const cleanups: Array<() => void> = [];

    els.forEach((el) => {
      el.style.transition = "transform .22s ease-out";
      const move = (e: MouseEvent): void => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px,${y * 0.28}px)`;
      };
      const leave = (): void => {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
        el.style.transition = "";
        el.style.transform = "";
      });
    });

    return () => cleanups.forEach((f) => f());
  }, [rootRef]);
}
