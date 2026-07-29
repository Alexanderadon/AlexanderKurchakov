// Фон прелоадера — один фрагментный шейдер на весь экран: тьма, факел, пыль и
// виньетка считаются попиксельно за проход. Собор и слова запекаются в две
// текстуры-слоя, шейдер сдвигает их с разной силой — отсюда параллакс.
//
// Почему не Canvas 2D, с которого всё начиналось: там маска факела, затухание и
// виньетка были отдельными полноэкранными заливками. Замер под программным
// растром на 1904×985 показал 53.7 мс в покое и 137 мс при движении курсора.
// Тот же кадр на шейдере — 1.1 мс.
//
// Почему не three.js: 600 КБ библиотеки ради одного полноэкранного квада на
// странице, чья работа — показывать загрузку. Прелоадер, который сам грузит
// полмегабайта, бессмысленен.
import { cathMetrics, type CathMetrics } from "./geometry";
import { layoutWords, placeWords, type Viewport } from "./words";
import { CATHEDRAL, PAPER, bake } from "./tint";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform vec2 u_mouse;   // пиксели, начало сверху слева
uniform vec2 u_par;     // сдвиг параллакса ближнего слоя, пиксели
uniform float u_time;
uniform float u_done;   // 0..1 — финал: свет заливает всё
uniform float u_rad;    // радиус факела
uniform float u_amb;    // сколько видно вне луча
uniform sampler2D u_t0, u_t1, u_paper;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

void main(){
  vec2 fc=gl_FragCoord.xy;
  vec2 tuv=vec2(fc.x,u_res.y-fc.y)/u_res;
  float t=u_time;

  // земля страницы — та же бумага, что фоном сайта: фон не чёрная пустота,
  // а тёмная фактура. Факелом открывается то, что НА ней написано.
  vec3 ground=texture2D(u_paper,tuv).rgb;
  vec3 scene=texture2D(u_t0,tuv).rgb+texture2D(u_t1,tuv-u_par/u_res).rgb;

  vec2 m=vec2(u_mouse.x,u_res.y-u_mouse.y);
  float flick=1.0+sin(t*11.3)*0.035+sin(t*27.1)*0.022;
  float rad=u_rad*flick*(1.0+u_done*2.6);
  float d=distance(fc,m)/rad;

  float lit=1.0;
  lit=mix(lit,0.92,smoothstep(0.00,0.30,d));
  lit=mix(lit,0.42,smoothstep(0.30,0.62,d));
  lit=mix(lit,max(0.18,u_amb*1.5),smoothstep(0.62,0.86,d));
  lit=mix(lit,u_amb,smoothstep(0.86,1.00,d));
  lit=mix(lit,1.0,u_done);

  vec3 col=scene*lit;

  float pd=distance(fc,m);
  col+=vec3(0.659,0.576,0.373)*0.19*pow(max(0.0,1.0-pd/(rad*0.55)),2.2);
  float fl=1.0+sin(t*14.0)*0.12+sin(t*43.0)*0.07;
  float fs=u_res.y/900.0;
  vec2 fv=(fc-m)/(vec2(9.0,fc.y>m.y?20.0:11.0)*fl*fs);
  col+=vec3(0.96,0.90,0.76)*pow(max(0.0,1.0-length(fv)),2.5);

  float dust=0.0;
  for(int i=0;i<2;i++){
    float sc=(54.0+46.0*float(i))*fs;
    vec2 g=fc/sc+vec2(sin(t*0.07+float(i))*0.4,t*(0.035+0.02*float(i)));
    vec2 id=floor(g),f=fract(g);
    vec2 o=vec2(hash(id+float(i)*3.7),hash(id+7.3+float(i)));
    dust+=smoothstep(0.055,0.0,length(f-o))*(0.35+0.65*hash(id+3.1));
  }
  col+=vec3(0.812,0.780,0.698)*dust*0.18*max(lit*lit,u_done);

  // виньетка ровно как .cinebg-vig на сайте, и гасит она только свет:
  // база остаётся --bg, иначе на стыке с сайтом был бы скачок фона
  vec2 vd=(fc-vec2(u_res.x*0.5,u_res.y*0.6))/(u_res*vec2(0.65,0.52));
  float vr=length(vd);
  float vig=smoothstep(0.46,0.76,vr)*0.42+smoothstep(0.76,1.0,vr)*0.53;

  gl_FragColor=vec4((ground+col)*(1.0-vig*0.8),1.0);
}`;

const GOLD = "#A8935F"; // --fire
const CARVE = '"Cinzel", Georgia, serif';
const BOOK = '"Old Standard TT", Georgia, serif';
/** Бумага сайта: background-size 820px. */
const PAPER_TILE = 820;

function noise(i: number, s: number): number {
  const n = Math.imul(i * 374761393 + s * 668265263, 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295 - 0.5;
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

/**
 * Буква за буквой: своя посадка, наклон и «стёртость». Слово целиком дрожать не
 * должно — тогда это выглядит как дрожащий шрифт, а не как резьба по камню.
 * al: -1 по левому краю, 0 по центру, 1 по правому. maxW ужимает под экран.
 */
function chisel(
  g: CanvasRenderingContext2D,
  text: string,
  size: number,
  font: string,
  alpha: number,
  sd: number,
  al: -1 | 0 | 1,
  maxW: number,
): { w: number; s: number } {
  const ch = Array.from(text);
  let widths: number[] = [];
  let tr = 0;
  let total = 0;
  const fit = (): void => {
    g.font = `${size}px ${font}`;
    widths = ch.map((c) => g.measureText(c).width);
    tr = size * 0.16;
    total = widths.reduce((a, b) => a + b, 0) + tr * (ch.length - 1);
  };
  fit();
  if (maxW > 0 && total > maxW) {
    size *= maxW / total;
    fit();
  }
  g.textAlign = "center";
  g.textBaseline = "alphabetic";

  let x = al < 0 ? 0 : al > 0 ? -total : -total / 2;
  for (let i = 0; i < ch.length; i++) {
    const w = widths[i];
    if (ch[i] !== " ") {
      const worn = 1 - Math.abs(noise(i * 3 + sd, 29)) * 1.15;
      g.save();
      g.translate(x + w / 2 + noise(i * 7 + sd, 11) * size * 0.05, noise(i * 13 + sd, 17) * size * 0.055);
      g.rotate(noise(i * 5 + sd, 23) * 0.07);
      for (let k = 0; k < 3; k++) {
        g.globalAlpha = alpha * Math.max(0.08, worn) * (k === 0 ? 0.55 : k === 1 ? 0.24 : 0.2);
        g.fillStyle = k === 2 ? "rgba(207,199,178,1)" : "rgba(168,147,95,1)"; // --lt / --fire
        g.fillText(ch[i], noise(k * 17 + i + sd, 41) * size * 0.035, noise(k * 29 + i + sd, 43) * size * 0.04);
      }
      g.restore();
    }
    x += w + tr;
  }

  const mid = (al < 0 ? total : al > 0 ? -total : 0) / 2;
  g.globalAlpha = alpha * 0.28;
  g.strokeStyle = "rgba(207,199,178,1)";
  g.lineWidth = Math.max(0.6, size * 0.012);
  g.lineCap = "round";
  g.beginPath();
  for (let k = 0; k < 5; k++) {
    const sx = mid + noise(k, sd + 3) * total;
    const sy = noise(k + 40, sd + 5) * size * 0.8 - size * 0.3;
    g.moveTo(sx, sy);
    g.lineTo(sx + noise(k + 80, sd + 7) * size * 0.5, sy + noise(k + 120, sd + 9) * size * 0.3);
  }
  g.stroke();
  g.globalAlpha = 1;
  return { w: total, s: size };
}

export interface SceneImages {
  cathedral: HTMLImageElement;
  paper: HTMLImageElement;
}

export interface RenderState {
  /** Курсор/факел в CSS-пикселях. */
  mx: number;
  my: number;
  /** Сдвиг параллакса ближнего слоя, CSS-пиксели. */
  parX: number;
  parY: number;
  /** Секунды с запуска. */
  time: number;
  /** 0..1 — финальный разлив света. */
  done: number;
}

export interface Scene {
  layout(vp: Viewport, dpr: number): void;
  paint(vp: Viewport, images: Partial<SceneImages>): void;
  render(state: RenderState): void;
  readonly cath: CathMetrics | null;
  dispose(): void;
}

export function createScene(canvas: HTMLCanvasElement): Scene | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, "u_res"),
    mouse: gl.getUniformLocation(prog, "u_mouse"),
    par: gl.getUniformLocation(prog, "u_par"),
    time: gl.getUniformLocation(prog, "u_time"),
    done: gl.getUniformLocation(prog, "u_done"),
    rad: gl.getUniformLocation(prog, "u_rad"),
    amb: gl.getUniformLocation(prog, "u_amb"),
  };

  const mkCanvas = (): HTMLCanvasElement => document.createElement("canvas");
  const layers = [mkCanvas(), mkCanvas()];
  const paperCv = mkCanvas();
  const texes: WebGLTexture[] = [];
  for (let i = 0; i < 3; i++) {
    const tex = gl.createTexture();
    if (!tex) return null;
    texes.push(tex);
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }
  gl.uniform1i(gl.getUniformLocation(prog, "u_t0"), 0);
  gl.uniform1i(gl.getUniformLocation(prog, "u_t1"), 1);
  gl.uniform1i(gl.getUniformLocation(prog, "u_paper"), 2);

  let dpr = 1;
  let cath: CathMetrics | null = null;
  // перекрашенные исходники: считаются один раз, переиспользуются при resize
  let bakedCath: HTMLCanvasElement | null = null;
  let bakedPaper: HTMLCanvasElement | null = null;

  function upload(unit: number, src: HTMLCanvasElement, premultiply: boolean): void {
    if (!gl) return;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texes[unit]);
    // Обязательно premultiply для слоёв: canvas хранит цвет умноженным на альфу,
    // WebGL по умолчанию делит обратно — тогда полупрозрачные пиксели сглаживания
    // вылезают на полную яркость и волосяные линии собора слипаются в пятно.
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  }

  return {
    get cath() {
      return cath;
    },

    layout(vp, nextDpr) {
      dpr = nextDpr;
      canvas.width = Math.max(1, Math.round(vp.w * dpr));
      canvas.height = Math.max(1, Math.round(vp.h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.rad, Math.min(canvas.width, canvas.height) * (vp.narrow ? 0.6 : 0.4));
      // вне луча на телефоне видно больше: мышью там не поводишь
      gl.uniform1f(U.amb, vp.narrow ? 0.3 : 0.16);
      for (const c of layers) {
        c.width = canvas.width;
        c.height = canvas.height;
      }
    },

    paint(vp, images) {
      const k = canvas.width / vp.w;

      // ── бумага. Тайлится паттерном в размер буфера — как background-repeat в
      // браузере. REPEAT-обёртка WebGL1 не годится: 1024×600 не степень двойки,
      // а подгонка под POT рвёт бесшовность.
      if (images.paper) {
        // плитка перекрашивается один раз и кладётся паттерном уже готовой
        if (!bakedPaper) bakedPaper = bake(images.paper, PAPER);
        paperCv.width = canvas.width;
        paperCv.height = canvas.height;
        const pg = paperCv.getContext("2d");
        if (pg && bakedPaper) {
          pg.setTransform(1, 0, 0, 1, 0, 0);
          pg.fillStyle = "#0D0D0B";
          pg.fillRect(0, 0, paperCv.width, paperCv.height);
          const pat = pg.createPattern(bakedPaper, "repeat");
          if (pat) {
            const s = (PAPER_TILE * k) / bakedPaper.width;
            pat.setTransform?.(new DOMMatrix([s, 0, 0, s, 0, 0]));
            pg.fillStyle = pat;
            pg.fillRect(0, 0, paperCv.width, paperCv.height);
          }
          upload(2, paperCv, false);
        }
      }

      const ctxs = layers.map((c) => c.getContext("2d"));
      for (const g of ctxs) {
        if (!g) continue;
        g.setTransform(k, 0, 0, k, 0, 0);
        g.clearRect(0, 0, vp.w, vp.h);
        g.globalCompositeOperation = "lighter";
      }
      const [g0, g1] = ctxs;
      if (!g0 || !g1) return;

      const aspect = images.cathedral
        ? images.cathedral.naturalWidth / images.cathedral.naturalHeight
        : 1.9;
      cath = cathMetrics(vp, aspect);

      // ── слой 0: пол и собор
      g0.strokeStyle = "rgba(168,147,95,.20)";
      g0.lineWidth = 1;
      g0.beginPath();
      for (let i = 0; i <= 80; i++) g0.lineTo(vp.w * (i / 80), cath.fy + noise(i, 13) * 2.2);
      g0.stroke();
      if (images.cathedral) {
        // Чертёж — тёмные линии по БЕЛОМУ. Перекраска (инверсия яркости в --fire)
        // делается пиксельно и один раз на исходнике, а не фильтром canvas: в
        // Safari ctx.filter поддержан частично, цепочка из шести функций молча
        // отбрасывается, и собор ложится аддитивно светлым прямоугольником в
        // пол-экрана. Проверка присваиванием тут не спасает — простой invert(1)
        // Safari принимает, а всю цепочку нет.
        if (!bakedCath) bakedCath = bake(images.cathedral, CATHEDRAL);
        if (bakedCath) g0.drawImage(bakedCath, cath.left, cath.top, cath.w, cath.h);
      }

      // ── слой 1: слова. Один кегль на все — иерархию держат глаз и собор.
      const eye = { cy: vp.h * 0.3, hh: 128 * 0.5 };
      const l = layoutWords(vp, eye, cath.top, cath.fy);
      const step = l.hgt / l.rows;
      const size = Math.max(
        11,
        Math.min(Math.min(vp.w, vp.h) * (vp.narrow ? 0.046 : 0.03), step * 0.46),
      );
      placeWords(vp, l).forEach((w, i) => {
        const base = w.side === "B";
        g1.save();
        g1.translate(w.x, w.y);
        const m = chisel(
          g1,
          w.t,
          base ? size * 0.78 : size,
          base ? BOOK : CARVE,
          0.95,
          i * 31 + 7,
          w.align,
          w.room,
        );
        if (w.ru) {
          // перевод — нейтральным текстовым цветом сайта: та же пара
          // «золотой акцент + серый текст», что на всех страницах портфолио
          g1.font = `italic ${m.s * 0.4}px ${BOOK}`;
          g1.textAlign = w.align < 0 ? "left" : w.align > 0 ? "right" : "center";
          g1.textBaseline = "alphabetic";
          g1.globalAlpha = 0.32;
          g1.fillStyle = "rgba(196,196,192,1)"; // --tx
          g1.fillText(w.ru, 0, m.s * 0.74);
          g1.globalAlpha = 1;
        }
        g1.restore();
      });

      for (const g of ctxs) if (g) g.globalCompositeOperation = "source-over";
      upload(0, layers[0], true);
      upload(1, layers[1], true);
    },

    render(state) {
      gl.uniform2f(U.mouse, state.mx * dpr, state.my * dpr);
      gl.uniform2f(U.par, state.parX * dpr, state.parY * dpr);
      gl.uniform1f(U.time, state.time);
      gl.uniform1f(U.done, state.done);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    dispose() {
      for (const t of texes) gl.deleteTexture(t);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export { GOLD, CARVE, BOOK };
