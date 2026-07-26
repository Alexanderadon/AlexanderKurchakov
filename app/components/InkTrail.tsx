// Кисть-след за курсором: чернильный мазок в манере рук — сухая кисть,
// кипение линии (перерисовка с новым сидом каждые ~90мс) и таяние за секунду.
// Один fixed-canvas; rAF-цикл живёт ТОЛЬКО пока след виден, дальше спит.
import { useEffect, useRef } from "react";
import { pointerFine, prefersReducedMotion } from "~/lib/media";

const LIFE = 1000; // мс жизни точки следа
const BOIL = 90; // период перерисовки — кипение ~11 к/с
const MAX_PTS = 140;
const MIN_DIST = 5; // px между точками следа

interface Pt {
  x: number;
  y: number;
  t: number;
}

// детерминированный шум: сид кипения + индекс сегмента
function hash(i: number, s: number): number {
  let n = Math.imul(i, 374761393) + Math.imul(s, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

export function InkTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pointerFine() || prefersReducedMotion()) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    function size(): void {
      if (!cv) return;
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
    }
    size();
    window.addEventListener("resize", size);

    const pts: Pt[] = [];
    let raf = 0;
    let running = false;
    let lastDraw = 0;
    let dirty = false;

    function draw(now: number): void {
      if (!cv || !ctx) return;
      const seed = Math.floor(now / BOIL);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const age = now - b.t;
        if (age > LIFE) continue;
        const k = 1 - age / LIFE;
        const speed = Math.hypot(b.x - a.x, b.y - a.y);
        const w = (8 - Math.min(5, speed * 0.18)) * k + 0.6; // быстрее — тоньше
        const j1 = (hash(i, seed) - 0.5) * 2.4;
        const j2 = (hash(i, seed + 7) - 0.5) * 2.4;
        ctx.strokeStyle = `rgba(240,238,233,${(0.5 * k).toFixed(3)})`;
        ctx.lineWidth = w * dpr;
        ctx.beginPath();
        ctx.moveTo((a.x + j1) * dpr, (a.y + j2) * dpr);
        ctx.lineTo((b.x + j1) * dpr, (b.y + j2) * dpr);
        ctx.stroke();
        // сухие волоски рядом с мазком
        if (hash(i, seed + 13) > 0.45) {
          const o = 2.5 + hash(i, seed + 29) * 3;
          ctx.strokeStyle = `rgba(240,238,233,${(0.16 * k).toFixed(3)})`;
          ctx.lineWidth = dpr;
          ctx.beginPath();
          ctx.moveTo((a.x + j1 + o) * dpr, (a.y + j2 - o) * dpr);
          ctx.lineTo((b.x + j1 + o) * dpr, (b.y + j2 - o) * dpr);
          ctx.stroke();
        }
      }
    }

    function loop(now: number): void {
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      if (!pts.length) {
        running = false;
        if (cv && ctx) ctx.clearRect(0, 0, cv.width, cv.height);
        return;
      }
      if (now - lastDraw >= BOIL || dirty) {
        lastDraw = now;
        dirty = false;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: MouseEvent): void => {
      const last = pts[pts.length - 1];
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < MIN_DIST)
        return;
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > MAX_PTS) pts.shift();
      dirty = true;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", size);
    };
  }, []);

  return <canvas className="inktrail" ref={ref} aria-hidden="true" />;
}
