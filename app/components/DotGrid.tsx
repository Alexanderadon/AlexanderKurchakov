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

    let running = false;

    // цикл засыпает при сходимости: обновление --gx/--gy инвалидирует
    // полноэкранную маску, гонять её на неподвижной мыши — греть GPU впустую
    const loop = (): void => {
      const dx = mx - gx;
      const dy = my - gy;
      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
        running = false;
        return;
      }
      gx += dx * 0.14;
      gy += dy * 0.14;
      el.style.setProperty("--gx", `${gx.toFixed(1)}px`);
      el.style.setProperty("--gy", `${gy.toFixed(1)}px`);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent): void => {
      mx = e.clientX;
      my = e.clientY;
      if (!live) {
        live = true;
        gx = mx;
        gy = my;
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <div className="dgrid" ref={ref} aria-hidden="true" />;
}
