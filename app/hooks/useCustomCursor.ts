// Кастомный курсор (.cur/.cur-r): только pointer:fine и без reduced-motion.
// Точка следует мгновенно, кольцо — с lerp через rAF; .on на ховере интерактивных.
import { useEffect } from "react";
import type { RefObject } from "react";
import { pointerFine, prefersReducedMotion } from "~/lib/media";

export function useCustomCursor(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (prefersReducedMotion() || !pointerFine()) return;
    const root = rootRef.current;
    if (!root) return;

    const dot = document.createElement("div");
    dot.className = "cur";
    const ring = document.createElement("div");
    ring.className = "cur-r";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    // системная стрелка мешает кастомному курсору — прячем на время его жизни
    document.documentElement.classList.add('cur-on');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let shown = false;

    const onMove = (e: MouseEvent): void => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
      if (!shown) {
        shown = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let rafId = 0;
    const loop = (): void => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("a,button,.work,.irow"),
    );
    const enter = (): void => ring.classList.add("on");
    const leave = (): void => ring.classList.remove("on");
    targets.forEach((t) => {
      t.addEventListener("mouseenter", enter);
      t.addEventListener("mouseleave", leave);
    });

    return () => {
      document.documentElement.classList.remove('cur-on');
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      targets.forEach((t) => {
        t.removeEventListener("mouseenter", enter);
        t.removeEventListener("mouseleave", leave);
      });
      dot.remove();
      ring.remove();
    };
  }, [rootRef]);
}
