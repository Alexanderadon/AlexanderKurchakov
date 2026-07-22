// Чертёжная точечная сетка на фоне: видна только в радиусе вокруг курсора
// (маска-прожектор ленивo следует за мышью). На тач-устройствах скрыта CSS.
import { useEffect, useRef } from "react";
import { pointerFine } from "~/lib/media";

export function DotGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pointerFine()) return;
    const el = ref.current;
    if (!el) return;
    let mx = -500;
    let my = -500;
    let gx = mx;
    let gy = my;
    let raf = 0;
    let live = false;

    const onMove = (e: MouseEvent): void => {
      mx = e.clientX;
      my = e.clientY;
      if (!live) {
        live = true;
        gx = mx;
        gy = my;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = (): void => {
      gx += (mx - gx) * 0.14;
      gy += (my - gy) * 0.14;
      el.style.setProperty("--gx", `${gx.toFixed(1)}px`);
      el.style.setProperty("--gy", `${gy.toFixed(1)}px`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <div className="dgrid" ref={ref} aria-hidden="true" />;
}
