// Глаз — отдельный маленький canvas 2D поверх шейдера. Векторная тушь тут
// уместна, а площадь холста в десять с лишним раз меньше экрана, поэтому цена
// кадра остаётся копеечной.
//
// Три вещи, на которых эта штука переделывалась:
//  1. Порядок светлот как в живом глазу: склера светлее радужки, радужка светлее
//     зрачка. Пока уголки были темнее радужки, глаз читался вывернутым наизнанку.
//  2. Радужка живёт НА ШАРЕ: точка считается поворотом яблока, поэтому ближняя
//     сторона расходится, а дальняя сжимается и уходит за горизонт. Простое
//     сжатие по горизонтали давало плоскую наклейку.
//  3. Веко — лента переменной ширины. Линия постоянной толщины читалась как
//     проволока на чертеже, а не как веко.
import { irisProjection, type EyeMetrics } from "./geometry";

const GOLD = "#A8935F";
const BOIL = 0.45;

function noise(i: number, s: number): number {
  const n = Math.imul(i * 374761393 + s * 668265263, 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295 - 0.5;
}

export interface Eye {
  layout(m: EyeMetrics, dpr: number): void;
  draw(nowMs: number, targetX: number, targetY: number): void;
}

export function createEye(canvas: HTMLCanvasElement): Eye | null {
  const g = canvas.getContext("2d");
  if (!g) return null;

  let M: EyeMetrics = { s: 1, w: 0, h: 0, left: 0, top: 0, cy: 0, hh: 0 };
  let px = 0;
  let py = 0;
  let vx = 0;
  let vy = 0;
  let blink = 0;
  let nextBlink = 14000;
  let tremor = 0;
  let nextTremor = 4000;
  let away = 0;
  let nextAway = 30000;
  let awayX = 0;
  let awayY = 0;
  let seed = 0;
  let seedAt = 0;

  return {
    layout(m, dpr) {
      M = m;
      canvas.width = Math.max(1, Math.round(m.w * dpr));
      canvas.height = Math.max(1, Math.round(m.h * dpr));
      canvas.style.left = `${m.left}px`;
      canvas.style.top = `${m.top}px`;
      canvas.style.width = `${m.w}px`;
      canvas.style.height = `${m.h}px`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    draw(now, targetX, targetY) {
      const S = M.s;
      const cx = M.w / 2;
      const cy = M.h / 2;
      const HW = 300 * S;
      const HH = 128 * S;
      const IRIS = 126 * S;
      const TILT = 5 * S;
      const R = (HH * HH + HW * HW) / (2 * HH);
      const C = Math.sqrt(R * R - HW * HW);
      if (now - seedAt > 1000) {
        seed++;
        seedAt = now;
      }
      g.clearRect(0, 0, M.w, M.h);

      // изредка отводит взгляд сам
      if (now > nextAway) {
        away = 1;
        nextAway = now + 26000 + Math.random() * 30000;
        awayX = (Math.random() - 0.5) * 2;
        awayY = (Math.random() - 0.5) * 1.2;
      }
      if (away > 0) away = Math.max(0, away - 0.006);
      const aw = Math.sin(Math.min(1, away) * Math.PI);

      const lx = targetX - M.left;
      const ly = targetY - M.top;
      const dx = lx - cx;
      const dy = ly - cy;
      const d = Math.hypot(dx, dy) || 1;
      const lim = Math.min(d, HW * 0.26);
      const gx = (dx / d) * lim * (1 - aw) + awayX * HW * 0.22 * aw;
      const gy = (dy / d) * lim * 0.42 * (1 - aw) + awayY * HH * 0.3 * aw;

      vx = (vx + (gx - px) * 0.085) * 0.78;
      vy = (vy + (gy - py) * 0.085) * 0.78;
      if (now > nextTremor) {
        tremor = 1;
        nextTremor = now + 2600 + Math.random() * 5200;
      }
      if (tremor > 0) tremor = Math.max(0, tremor - 0.05);
      px += vx + noise(Math.floor(now / 55), 3) * 1.5 * tremor * S;
      py += vy + noise(Math.floor(now / 55), 5) * 1.5 * tremor * S;

      const eX = cx + px;
      const eY = cy + py;
      const lift = (-py / (HH * 0.42)) * 0.16;

      // поворот яблока: зрачок — проекция оси взгляда на сферу
      const proj = irisProjection(cx, cy, IRIS, px, py);
      const iris = proj.project;
      const cA = Math.sqrt(1 - Math.pow(Math.max(-0.82, Math.min(0.82, px / (IRIS * 1.22))), 2));
      const kx = Math.max(0.4, cA * cA);

      if (now > nextBlink) {
        blink = 1;
        nextBlink = now + 17000 + Math.random() * 24000;
      }
      let close = 0;
      if (blink > 0) {
        close = blink > 0.6 ? (1 - blink) / 0.4 : blink / 0.6;
        blink -= blink > 0.6 ? 0.12 : 0.045;
        if (blink < 0) blink = 0;
      }
      const open = 1 - close;

      const lidY = (x: number, dir: number): number => {
        const arc = Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx))) - C;
        const k =
          dir > 0 ? Math.max(0.02, 1 + lift - close) : Math.max(0.02, 1 - lift * 0.5 - close * 0.25);
        return cy + ((x - cx) / HW) * TILT - dir * arc * k;
      };

      const lidRibbon = (dir: number, wMax: number, off: number, alpha: number): void => {
        const N = 64;
        const up: number[] = [];
        const dn: number[] = [];
        const at = (t: number): [number, number] => {
          const x = cx - HW + 2 * HW * t;
          const arc = Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx))) - C;
          return [
            x + noise(Math.round(t * N) + 400, seed + dir * 31) * BOIL * 1.4 * S,
            lidY(x, dir) -
              dir * off * (arc / HH) +
              noise(Math.round(t * N), seed + dir * 91 + off * 7) * BOIL * 2 * S * (arc / HH),
          ];
        };
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          const p = at(t);
          const q = at(Math.min(1, t + 1 / N));
          const ddx = q[0] - p[0];
          const ddy = q[1] - p[1];
          const len = Math.hypot(ddx, ddy) || 1;
          const w = wMax * Math.pow(Math.sin(Math.PI * t), 0.5) * 0.5;
          up.push(p[0] + (-ddy / len) * w, p[1] + (ddx / len) * w);
          dn.push(p[0] - (-ddy / len) * w, p[1] - (ddx / len) * w);
        }
        g.beginPath();
        g.moveTo(up[0], up[1]);
        for (let i = 2; i < up.length; i += 2) g.lineTo(up[i], up[i + 1]);
        for (let i = dn.length - 2; i >= 0; i -= 2) g.lineTo(dn[i], dn[i + 1]);
        g.closePath();
        g.globalAlpha = alpha;
        g.fillStyle = GOLD;
        g.fill();
        g.globalAlpha = 1;
      };

      const lidFlick = (sgn: number): void => {
        const x0 = cx + sgn * HW;
        const y0 = cy + sgn * TILT;
        const L = 54 * S;
        g.beginPath();
        g.moveTo(x0, y0 - 2.2 * S);
        g.quadraticCurveTo(x0 + sgn * L * 0.5, y0 - 3.4 * S, x0 + sgn * L, y0 - 1.1 * S);
        g.quadraticCurveTo(x0 + sgn * L * 0.45, y0 + 0.4 * S, x0, y0 + 2.2 * S);
        g.closePath();
        g.globalAlpha = 0.85;
        g.fillStyle = GOLD;
        g.fill();
        g.globalAlpha = 1;
      };

      g.save();
      g.lineJoin = "round";
      g.beginPath();
      for (let i = 0; i <= 64; i++) {
        const x = cx - HW + 2 * HW * (i / 64);
        g.lineTo(x, lidY(x, 1));
      }
      for (let i = 64; i >= 0; i--) {
        const x = cx - HW + 2 * HW * (i / 64);
        g.lineTo(x, lidY(x, -1));
      }
      g.closePath();
      g.clip();

      // склера. Заливается целиком: без этого между шаром и уголками холст
      // оставался прозрачным и сквозь глаз просвечивал фон с пылинками.
      const box: [number, number, number, number] = [
        cx - HW - 60 * S,
        cy - HH * 2,
        HW * 2 + 120 * S,
        HH * 4,
      ];
      const scl = g.createLinearGradient(cx, cy - HH, cx, cy + HH);
      scl.addColorStop(0, "#141310");
      scl.addColorStop(0.42, "#1C1B16"); // --tile2, самая светлая поверхность сайта
      scl.addColorStop(1, "#181712");
      g.fillStyle = scl;
      g.fillRect(...box);

      const occ = g.createRadialGradient(cx, cy, IRIS * 0.7, cx, cy, HW * 1.05);
      occ.addColorStop(0, "rgba(0,0,0,0)");
      occ.addColorStop(1, "rgba(0,0,0,.62)");
      g.fillStyle = occ;
      g.fillRect(...box);

      const sh0 = g.createLinearGradient(cx, cy - HH, cx, cy + HH * 0.3);
      sh0.addColorStop(0, "rgba(0,0,0,.68)");
      sh0.addColorStop(0.5, "rgba(0,0,0,.2)");
      sh0.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = sh0;
      g.fillRect(...box);

      // Радужка — тёмный диск, который ездит по склере. Её габариты берутся из
      // ТОГО ЖЕ отображения на сферу, что и потоки: раньше диск был простым
      // эллипсом вокруг зрачка, и на отводе взгляда модели расходились — вены
      // торчали за край с одной стороны и не доставали до него с другой, а
      // зрачок сидел не в середине радужки.
      const { cx: icx, cy: icy, rx: irx, ry: iry } = proj.bounds(IRIS * 0.92);
      g.save();
      g.translate(icx, icy);
      g.scale(irx / iry, 1);
      g.translate(-icx, -icy);
      const ig = g.createRadialGradient(icx, icy, iry * 0.12, icx, icy, iry);
      ig.addColorStop(0, "#1A1914");
      ig.addColorStop(0.62, "#121210");
      ig.addColorStop(0.9, "#0C0C0A");
      ig.addColorStop(1, "rgba(9,9,8,0)");
      g.fillStyle = ig;
      g.beginPath();
      g.arc(icx, icy, iry, 0, 7);
      g.fill();
      g.restore();

      g.globalCompositeOperation = "lighter";
      const socket = g.createLinearGradient(cx - HW, cy, cx + HW, cy);
      socket.addColorStop(0, "rgba(168,147,95,.015)");
      socket.addColorStop(0.5, "rgba(168,147,95,.05)");
      socket.addColorStop(1, "rgba(168,147,95,.015)");
      g.fillStyle = socket;
      g.fillRect(cx - HW, cy - HH, HW * 2, HH * 2);

      // волокна радужки: 120 линий рисуются четырьмя обводками по яркости
      const FB = 4;
      const fibs = Array.from({ length: FB }, () => new Path2D());
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2 + noise(i, 71) * 0.3;
        const p1 = iris(IRIS * (0.3 + (noise(i, 73) + 0.5) * 0.18), a);
        const p2 = iris(IRIS * (0.62 + (noise(i, 79) + 0.5) * 0.38), a + noise(i, 83) * 0.1);
        if (p1[2] < 0.05 || p2[2] < 0.05) continue; // ушло за горизонт шара
        const w = 0.04 + Math.sin(now / 2400 + i) * 0.012;
        const b = Math.max(0, Math.min(FB - 1, Math.round((w - 0.028) / 0.008)));
        fibs[b].moveTo(p1[0], p1[1]);
        fibs[b].lineTo(p2[0], p2[1]);
      }
      g.lineWidth = 0.5 * S;
      for (let b = 0; b < FB; b++) {
        g.strokeStyle = `rgba(207,199,178,${(0.028 + b * 0.008) * open})`;
        g.stroke(fibs[b]);
      }

      // Потоки силы: около 380 веток собираются в ≤54 обводки (глубина ×
      // плотность × яркость). Ключ раздельный: если мешать яркость с толщиной,
      // линии худеют вместе с пульсацией.
      const maxL = IRIS * 0.95;
      const AB = 6;
      const DB = 3;
      const grp = new Map<number, { p: Path2D; d: number; r: number; w: number }>();
      const push = (depth: number, rel: number, dens: number, pts: number[]): void => {
        const ab = Math.max(0, Math.min(AB - 1, Math.floor(rel * AB)));
        const db = Math.max(0, Math.min(DB - 1, Math.floor(dens * DB)));
        const key = (depth * DB + db) * AB + ab;
        let q = grp.get(key);
        if (!q) {
          q = { p: new Path2D(), d: depth, r: (ab + 0.5) / AB, w: (db + 0.5) / DB };
          grp.set(key, q);
        }
        q.p.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) q.p.lineTo(pts[i], pts[i + 1]);
      };
      const branch = (
        b0: number,
        r0: number,
        L: number,
        depth: number,
        phase: number,
        dens: number,
      ): void => {
        const pts: number[] = [];
        let a = b0;
        let vis = 1;
        for (let s = 0; s <= 9; s++) {
          const t = s / 9;
          a = b0 + Math.sin(phase * 0.5 + t * 2.6) * 0.07 + noise(Math.round(b0 * 900) + s, 31) * 0.045;
          const p = iris(r0 + L * Math.pow(t, 0.92), a);
          if (p[2] < 0.05) break; // ушло за горизонт шара
          vis = Math.min(vis, Math.min(1, p[2] / 0.3));
          pts.push(p[0], p[1]);
        }
        if (pts.length < 4) return;
        // К краю поток гаснет, а не обрывается. Обрезать его по границе диска
        // пробовал — размах потоков больше диска, и обрезка съедала половину
        // рисунка. Проблема была не в длине, а в том, что диск считался вокруг
        // зрачка, а не по проекции: см. bounds() в geometry.
        const rim = Math.max(0, Math.min(1, (IRIS * 1.05 - (r0 + L)) / (IRIS * 0.45)));
        vis *= 0.45 + 0.55 * rim;
        const wave = 0.3 + 0.7 * Math.max(0, Math.sin(phase));
        push(depth, Math.min(0.999, wave * dens * vis), Math.min(0.999, dens), pts);
        if (depth < 2 && L > maxL * 0.3) {
          for (const sg of [-1, 1]) {
            branch(
              a + sg * (0.16 + Math.abs(noise(Math.round(b0 * 700) + depth, 37)) * 0.2),
              r0 + L * 0.78,
              L * (0.42 + Math.abs(noise(Math.round(b0 * 500), 43)) * 0.2),
              depth + 1,
              phase + 0.4,
              dens * 0.82,
            );
          }
        }
      };
      for (let v = 0; v < 64; v++) {
        const b0 = (v / 64) * Math.PI * 2 + noise(v, 11) * 0.18;
        const lat = Math.abs(Math.sin(b0));
        const gate = lat < 0.3 ? Math.pow(lat / 0.3, 1.6) : 1;
        if (noise(v, 59) + 0.5 > gate * 1.15) continue; // редеет, а не обрывается
        const dens =
          (Math.pow(lat, 0.8) * 0.82 + 0.18) * gate * (1 + Math.sin(b0) * 0.07 + Math.cos(b0 * 2) * 0.05);
        branch(
          b0,
          (8 + noise(v, 41) * 4) * S,
          maxL * (0.3 + 0.7 * dens) * (0.78 + (noise(v, 17) + 0.5) * 0.22),
          0,
          (now / 1000) * (0.35 + (noise(v, 29) + 0.5) * 0.8) * 0.8 + v * 0.8,
          dens,
        );
      }
      g.lineCap = "round";
      for (const q of grp.values()) {
        g.strokeStyle = `rgba(207,199,178,${q.r * (0.19 - q.d * 0.065) * open})`;
        g.lineWidth = Math.max(0.35, (0.5 + q.w * 1.4) * (1 - q.d * 0.45)) * S;
        g.stroke(q.p);
      }

      const glow = g.createRadialGradient(eX, eY, 2, eX, eY, IRIS * 0.34);
      glow.addColorStop(0, "rgba(207,199,178,.30)");
      glow.addColorStop(0.55, "rgba(194,173,121,.12)");
      glow.addColorStop(1, "rgba(168,147,95,0)");
      g.save();
      g.translate(eX, eY);
      g.scale(0.62 * kx, 1);
      g.translate(-eX, -eY);
      g.fillStyle = glow;
      g.beginPath();
      g.arc(eX, eY, IRIS * 0.34, 0, 7);
      g.fill();
      g.restore();
      g.globalCompositeOperation = "source-over";

      // зрачок
      const near = Math.max(0, 1 - Math.hypot(lx - eX, ly - eY) / (420 * S));
      const sw = IRIS * 0.1 * (1 - near * 0.28);
      const shh = IRIS * 0.96 * open;
      const slit = (w: number, hg: number): void => {
        g.beginPath();
        for (let i = 0; i <= 44; i++) {
          const a = (i / 44) * Math.PI * 2;
          const k = Math.cos(a);
          const tp = Math.pow(1 - Math.abs(k), 0.6);
          const rd = 1 + (k < 0 ? Math.pow(-k, 6) * 0.14 : 0);
          g.lineTo(
            eX + Math.sin(a) * w * tp * rd * kx + noise(i, seed + 7) * BOIL * 0.8 * S,
            eY + k * hg * 0.5 + noise(i + 200, seed + 9) * BOIL * 0.8 * S,
          );
        }
        g.closePath();
      };
      g.save();
      g.globalCompositeOperation = "lighter";
      slit(sw * 1.35, shh * 0.82);
      g.strokeStyle = "rgba(194,173,121,.055)";
      g.lineWidth = 3.5 * S;
      g.stroke();
      g.restore();

      // Зрачок — дыра, а у дыры нет контура. Жёсткая обводка давала двойную
      // кромку с каймой и читалась наклейкой: вместо неё мягкая тень.
      for (let k = 4; k >= 1; k--) {
        slit(sw * (1 + k * 0.34), shh * (1 + k * 0.045));
        g.fillStyle = `rgba(0,0,0,${0.13 / k})`;
        g.fill();
      }
      const pg = g.createLinearGradient(eX, eY - shh * 0.5, eX, eY + shh * 0.5);
      pg.addColorStop(0, "#14130F");
      pg.addColorStop(0.28, "#080807");
      pg.addColorStop(0.72, "#050504");
      pg.addColorStop(1, "#0E0E0B");
      slit(sw, shh);
      g.fillStyle = pg;
      g.fill();

      // кайма радужки только со стороны света, а не кольцом по периметру
      g.save();
      g.globalCompositeOperation = "lighter";
      const eg = g.createLinearGradient(eX, eY - shh * 0.5, eX, eY + shh * 0.5);
      eg.addColorStop(0, "rgba(207,199,178,.34)");
      eg.addColorStop(0.45, "rgba(194,173,121,.12)");
      eg.addColorStop(1, "rgba(168,147,95,0)");
      slit(sw, shh);
      g.strokeStyle = eg;
      g.lineWidth = 0.9 * S;
      g.stroke();
      g.restore();
      g.restore();

      // верхнее веко тяжелее нижнего — так глаз и читается
      lidRibbon(1, 5.2 * S, 0, 1);
      lidRibbon(-1, 3.0 * S, 0, 1);
      lidRibbon(1, 1.4 * S, 26 * S, 0.2); // складка: дальше и слабее, иначе задваивает
      lidFlick(-1);
      lidFlick(1);
    },
  };
}
