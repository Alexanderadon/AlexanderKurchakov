// Трёхмерная книга: перспективная камера и десяток плоскостей с текстурами.
//
// Почему не модель и не библиотека. Книга — это крышка, блок страниц с толщиной,
// корешок и пара листов. Полигонов тут нужно меньше двух десятков; всё, что
// действительно требуется, — честная камера с делением на глубину и свет,
// считаемый из нормалей. Ровно это уже работало в перевороте страницы, здесь оно
// расширено до сцены из нескольких объектов.
//
// Прошлое «открытие» было переворотом карточки: крышка уходила ребром, и в этот
// кадр её подменял разворот. Приём прятал несовпадение пропорций (альбомная
// обложка против книжных страниц) и выглядел ровно тем, чем был. Теперь обложка
// портретная, той же пропорции, что и блок, и прятать нечего.

import { identity, multiply, perspective, rotationX, rotationY, translation, type Mat4 } from "./mat4";

export interface BookTextures {
  coverFront: TexImageSource;
  endpaper: TexImageSource;
  pageLeft: TexImageSource;
  pageRight: TexImageSource;
}

export interface BookScene {
  /** open: 0 — книга закрыта, 1 — разворот лежит перед зрителем. */
  draw(open: number): void;
  resize(): void;
  dispose(): void;
}

/** Ширина страницы принята за единицу; остальное считается от неё. */
const PAGE_W = 1;
/** Пропорция обложки, снятая с ассета: 1122×1402. */
const PAGE_H = PAGE_W / 0.8003;
/** Толщина блока страниц. Без неё книга — лист бумаги, а не том. */
const BLOCK_T = 0.055;
const COVER_T = 0.012;

const COLS = 48;
const ROWS = 6;

const VERT = `
attribute vec2 a_uv;
uniform mat4 u_mvp;
uniform mat4 u_model;
uniform vec2 u_size;     // ширина и высота плоскости
uniform float u_bend;    // 0 — жёсткая плоскость, >0 — изгиб бумаги
uniform float u_dir;     // +1 растём вправо от петли, -1 влево
varying vec2 v_uv;
varying vec3 v_n;

const float PI = 3.141592653589793;

void main(){
  float s = a_uv.x * u_size.x;
  vec3 p;
  vec3 n;
  if (u_bend > 0.001) {
    // Тот же цилиндр переменного радиуса, что и в перевороте страницы: на краях
    // хода радиус уходит в бесконечность и лист становится плоским.
    float R = u_size.x / max(1e-4, u_bend);
    float ang = s / R;
    p = vec3(R * sin(ang) * u_dir, (0.5 - a_uv.y) * u_size.y, R * (1.0 - cos(ang)));
    n = vec3(sin(ang) * u_dir, 0.0, -cos(ang));
  } else {
    p = vec3(s * u_dir, (0.5 - a_uv.y) * u_size.y, 0.0);
    n = vec3(0.0, 0.0, 1.0);
  }
  v_uv = a_uv;
  // Нормаль поворачиваем моделью — свет обязан жить в мировых координатах,
  // иначе он поедет вместе с предметом, а это первый признак подделки.
  v_n = mat3(u_model[0].xyz, u_model[1].xyz, u_model[2].xyz) * n;
  gl_Position = u_mvp * vec4(p, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec3 u_light;
uniform vec4 u_tint;      // rgb — подмешиваемый цвет, a — его доля
uniform highp float u_stripe;   // >0: рисуем торец блока полосами вместо текстуры
varying vec2 v_uv;
varying vec3 v_n;

void main(){
  vec3 n = normalize(v_n);
  float d = abs(dot(n, normalize(u_light)));
  float lit = 0.58 + 0.42 * d;

  vec4 tex;
  if (u_stripe > 0.5) {
    // Торец блока — сотни листов. Рисуем их полосами: текстуру такого разрешения
    // пришлось бы гнать отдельным файлом ради полоски в шесть пикселей.
    float k = fract(v_uv.y * 190.0);
    float line = smoothstep(0.42, 0.5, k) * smoothstep(0.58, 0.5, k);
    vec3 paper = mix(vec3(0.62, 0.59, 0.51), vec3(0.44, 0.41, 0.34), line);
    tex = vec4(paper * (0.82 + 0.18 * fract(sin(v_uv.y * 419.0) * 7351.0)), 1.0);
  } else {
    tex = texture2D(u_tex, v_uv);
  }
  if (tex.a < 0.02) discard;
  vec3 col = mix(tex.rgb, u_tint.rgb, u_tint.a) * lit;
  gl_FragColor = vec4(col * tex.a, tex.a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | string {
  const s = gl.createShader(type);
  if (!s) return "не создан шейдер";
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
  return gl.getShaderInfoLog(s) || "шейдер не собрался";
}

function makeTexture(gl: WebGLRenderingContext, src: TexImageSource): WebGLTexture | null {
  const t = gl.createTexture();
  if (!t) return null;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
/** Плавный старт-стоп: движение начинается и заканчивается без рывка. */
const ease = (x: number): number => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
/** Фаза внутри общего такта: [a, b] растягивается на весь ход 0..1. */
const phase = (t: number, a: number, b: number): number => clamp01((t - a) / (b - a));

export function createBook(canvas: HTMLCanvasElement, tex: BookTextures): BookScene | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return null;
  const fail = (why: string): null => {
    canvas.dataset.bookError = why;
    return null;
  };

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  if (typeof vs === "string") return fail("вершинный: " + vs);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (typeof fs === "string") return fail("фрагментный: " + fs);
  const prog = gl.createProgram();
  if (!prog) return fail("не создана программа");
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    return fail("линковка: " + (gl.getProgramInfoLog(prog) || "?"));
  }
  gl.useProgram(prog);

  const verts: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const u = c / COLS;
      verts.push(u, r / ROWS, u, (r + 1) / ROWS);
    }
    if (r < ROWS - 1) verts.push(1, (r + 1) / ROWS, 0, (r + 1) / ROWS);
  }
  const data = new Float32Array(verts);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const aUv = gl.getAttribLocation(prog, "a_uv");
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

  const uMvp = gl.getUniformLocation(prog, "u_mvp");
  const uModel = gl.getUniformLocation(prog, "u_model");
  const uSize = gl.getUniformLocation(prog, "u_size");
  const uBend = gl.getUniformLocation(prog, "u_bend");
  const uDir = gl.getUniformLocation(prog, "u_dir");
  const uTint = gl.getUniformLocation(prog, "u_tint");
  const uStripe = gl.getUniformLocation(prog, "u_stripe");
  gl.uniform1i(gl.getUniformLocation(prog, "u_tex"), 0);
  gl.uniform3f(gl.getUniformLocation(prog, "u_light"), -0.3, 0.5, 0.81);

  const texCover = makeTexture(gl, tex.coverFront);
  const texEnd = makeTexture(gl, tex.endpaper);
  const texL = makeTexture(gl, tex.pageLeft);
  const texR = makeTexture(gl, tex.pageRight);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);

  let proj: Mat4 = identity();

  function resize(): void {
    if (!gl) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    proj = perspective((38 * Math.PI) / 180, w / h, 0.1, 40);
  }

  interface Piece {
    model: Mat4;
    size: [number, number];
    dir: 1 | -1;
    tex: WebGLTexture | null;
    bend?: number;
    stripe?: boolean;
    tint?: [number, number, number, number];
  }

  function drawPiece(view: Mat4, p: Piece): void {
    if (!gl) return;
    const mvp = multiply(proj, multiply(view, p.model));
    gl.uniformMatrix4fv(uMvp, false, mvp);
    gl.uniformMatrix4fv(uModel, false, p.model);
    gl.uniform2f(uSize, p.size[0], p.size[1]);
    gl.uniform1f(uBend, p.bend ?? 0);
    gl.uniform1f(uDir, p.dir);
    gl.uniform1f(uStripe, p.stripe ? 1 : 0);
    const t = p.tint ?? [0, 0, 0, 0];
    gl.uniform4f(uTint, t[0], t[1], t[2], t[3]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, p.tex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, data.length / 2);
  }

  function draw(open: number): void {
    if (!gl) return;
    const t = clamp01(open);

    // ── Камера. Она не украшение: закрытая книга должна читаться объёмной, а
    // раскрытый разворот — лежать перед зрителем в лоб. Поэтому наклон уходит в
    // ноль к концу хода, а точка взгляда переезжает с центра крышки на корешок.
    const settle = ease(phase(t, 0.15, 1));
    const pitch = ((30 - 30 * settle) * Math.PI) / 180;
    const yaw = ((-13 + 13 * settle) * Math.PI) / 180;
    const dist = 2.62 - 0.22 * settle;
    const lookX = (PAGE_W / 2) * (1 - settle);
    const view = multiply(
      multiply(translation(0, 0, -dist), multiply(rotationX(pitch), rotationY(yaw))),
      translation(-lookX, 0, 0),
    );

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // ── Крышка. Идёт первой по времени: от 0 до 78% такта поворачивается вокруг
    // корешка на 180° и по дороге опускается на стол.
    const coverA = ease(phase(t, 0, 0.78)) * Math.PI;
    const coverZ = BLOCK_T + COVER_T - (BLOCK_T + COVER_T - 0.002) * ease(phase(t, 0.45, 1));
    const coverModel = multiply(translation(0, 0, coverZ), rotationY(-coverA));

    // ── Первый лист трогается позже крышки: бумага не приклеена к переплёту.
    const leafA = ease(phase(t, 0.34, 1)) * Math.PI;
    const leafBend = Math.sin(clamp01(phase(t, 0.34, 1)) * Math.PI) * 1.5;
    const leafModel = multiply(translation(0, 0, BLOCK_T + 0.002), rotationY(-leafA));

    const half: [number, number] = [PAGE_W, PAGE_H];

    // Порядок рисования снизу вверх; глубина включена, но прозрачные кромки
    // страниц требуют, чтобы дальнее шло раньше ближнего.
    const pieces: Piece[] = [
      // Задняя крышка — под всем, изнанкой вверх. Растёт вправо от корешка:
      // у закрытой книги слева нет ничего, и отдельной «левой страницы» тоже
      // быть не должно — левой стороной становится перевернувшийся лист.
      { model: translation(0, 0, 0), size: half, dir: 1, tex: texEnd },
      // торцы блока: верхний, нижний и внешний обрез
      {
        model: multiply(translation(0, PAGE_H / 2, 0), rotationX(-Math.PI / 2)),
        size: [PAGE_W, BLOCK_T],
        dir: 1,
        tex: null,
        stripe: true,
      },
      {
        model: multiply(translation(0, -PAGE_H / 2, 0), rotationX(Math.PI / 2)),
        size: [PAGE_W, BLOCK_T],
        dir: 1,
        tex: null,
        stripe: true,
      },
      {
        model: multiply(translation(PAGE_W, 0, 0), rotationY(Math.PI / 2)),
        size: [BLOCK_T, PAGE_H],
        dir: 1,
        tex: null,
        stripe: true,
      },
      // правая страница — верх блока
      { model: translation(0, 0, BLOCK_T), size: half, dir: 1, tex: texR },
      // Лист, следующий за крышкой. Рисуем дважды: лицом вверх он показывает
      // ту же страницу, что лежала справа, а лёгши налево — свою изнанку.
      { model: leafModel, size: half, dir: 1, tex: texR, bend: leafBend },
      { model: multiply(leafModel, translation(0, 0, -0.0008)), size: half, dir: 1, tex: texL, bend: leafBend },
      // крышка: лицо снаружи, форзац изнутри — рисуем двумя проходами
      { model: coverModel, size: half, dir: 1, tex: texCover },
      { model: multiply(coverModel, translation(0, 0, -0.001)), size: half, dir: 1, tex: texEnd },
    ];

    for (const p of pieces) drawPiece(view, p);
  }

  resize();

  return {
    draw,
    resize,
    dispose(): void {
      if (!gl) return;
      for (const t of [texCover, texEnd, texL, texR]) gl.deleteTexture(t);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
