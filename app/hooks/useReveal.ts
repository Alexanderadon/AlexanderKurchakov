// Reveal на TRANSITION (не animation): stagger через data-d, немедленный показ
// того, что уже в зоне видимости (getBoundingClientRect), остальное — IntersectionObserver,
// плюс страховочный таймер на 2500мс. Логика 1:1 с прежним site-script.
import { useEffect } from "react";
import type { RefObject } from "react";
import { prefersReducedMotion } from "~/lib/media";

export function useReveal(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const RM = prefersReducedMotion();

    root.querySelectorAll<HTMLElement>("[data-st]").forEach((grp) => {
      grp
        .querySelectorAll<HTMLElement>(":scope > .rv, :scope > * > .rv")
        .forEach((el, i) => {
          el.dataset.d = String(i * 80);
        });
    });

    const allRv = Array.from(root.querySelectorAll<HTMLElement>(".rv"));
    const timers: number[] = [];
    const reveal = (el: HTMLElement): void => {
      timers.push(
        window.setTimeout(
          () => el.classList.add("in"),
          Number(el.dataset.d ?? 0),
        ),
      );
    };

    if (RM || !("IntersectionObserver" in window)) {
      allRv.forEach((el) => el.classList.add("in"));
      return () => timers.forEach(clearTimeout);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          reveal(e.target as HTMLElement);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4%" },
    );

    // уже на первом экране — показываем сразу; остальное по скроллу
    allRv.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.96) reveal(el);
      else io.observe(el);
    });

    // страховка: контент не должен остаться невидимым ни при каких сбоях IO
    timers.push(
      window.setTimeout(
        () => allRv.forEach((el) => el.classList.add("in")),
        2500,
      ),
    );

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [rootRef]);
}
