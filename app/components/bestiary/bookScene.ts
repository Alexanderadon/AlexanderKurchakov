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
  /**
   * open: 0 — книга закрыта, 1 — разворот лежит перед зрителем.
   * turn: 0..1 — ход переворачиваемого листа поверх раскрытой книги.
   * left/right: сколько листов уже слева и сколько осталось справа —
   * от этого растут стопки, и книга выглядит листаемой, а не двухстраничной.
   */
  draw(open: number, turn?: number, left?: number, right?: number): void;
  resize(): void;
  dispose(): void;
}

/** Ширина страницы принята за единицу; остальное считается от неё. */
const PAGE_W = 1;
/** Пропорция обложки, снятая с ассета: 1122×1402. */
const PAGE_H = PAGE_W / 0.8003;
/** Толщина блока страниц. Без неё книга — лист бумаги, а не том. */
const BLOCK_T = 0.155;
const COVER_T = 0.012;
/**
 * «Квадрат» — выступ крышки за обрез блока. У переплётчиков это миллиметра три,
 * и без него книга разваливается на две бумажки: крышка ровно по размеру
 * страницы целиком прячется под ней, кожаной рамки вокруг не остаётся.
 * Это главное, что отличает том от двух картинок на чёрном фоне.
 */
const SQUARE = 0.028;

const COLS = 48;
const ROWS = 1; // изгиб одинаков по высоте — лишние строки были холостой работой

const VERT = `
attribute vec2 a_uv;
uniform mat4 u_mvp;
uniform mat4 u_model;
uniform vec2 u_size;     // ширина и высота плоскости
uniform float u_bend;    // 0 — жёсткая плоскость, >0 — изгиб бумаги
uniform float u_dir;     // +1 растём вправо от петли, -1 влево
uniform float u_sag;     // провал бумаги к жёлобу
uniform float u_arc;     // >0: плоскость свёрнута дугой — корешок
uniform float u_flip;    // >0: зеркалить текстуру по горизонтали
varying vec2 v_uv;
varying vec3 v_n;
varying float v_face;

const float PI = 3.141592653589793;
const float SAG_K = 0.16;   // как быстро провал сходит на нет от корешка

void main(){
  float s = a_uv.x * u_size.x;
  vec3 p;
  vec3 n;
  if (u_arc > 0.001) {
    // Корешок. Полоса кожи, свёрнутая полуцилиндром между крышками: у закрытой
    // книги это узкая дуга по толщине блока, у раскрытой — широкий жёлоб, в
    // который уходят страницы. Без него том разваливается на две половины
    // ровно в середине кадра, куда зритель и смотрит.
    float a = (a_uv.x - 0.5) * PI * u_arc;
    float R = u_size.x / max(1e-3, PI * u_arc);
    p = vec3(R * sin(a), (0.5 - a_uv.y) * u_size.y, -R * (1.0 - cos(a)));
    n = vec3(sin(a), 0.0, cos(a));
  } else if (u_bend > 0.001) {
    // Тот же цилиндр переменного радиуса, что и в перевороте страницы: на краях
    // хода радиус уходит в бесконечность и лист становится плоским.
    float R = u_size.x / max(1e-4, u_bend);
    float ang = s / R;
    p = vec3(R * sin(ang) * u_dir, (0.5 - a_uv.y) * u_size.y, R * (1.0 - cos(ang)));
    // Знак проверен через векторное произведение касательных: при ang=0
    // нормаль обязана быть (0,0,1) — вверх, к зрителю. Была (0,0,-1), то есть
    // смотрела в стол; при abs(dot) это не замечалось, а с честным светом
    // изгибающийся лист становился серым.
    n = vec3(-sin(ang) * u_dir, 0.0, cos(ang));
  } else {
    // Раскрытая книга не лежит идеально плоско: у корешка бумага уходит вниз, в
    // жёлоб, и выпрямляется к обрезу. Без этого разворот читается наклейкой.
    float dip = -u_sag * exp(-a_uv.x / SAG_K);
    float slope = (u_sag / SAG_K) * exp(-a_uv.x / SAG_K) / max(1e-4, u_size.x);
    p = vec3(s * u_dir, (0.5 - a_uv.y) * u_size.y, dip);
    n = normalize(vec3(-slope * u_dir, 0.0, 1.0));
  }
  // Лист, повернувшийся на 180°, показан зрителю изнанкой — текстуру надо
  // зеркалить, иначе рваный обрез страницы окажется у корешка вместо внешнего
  // края. У настоящей книги обрубок всегда снаружи, у жёлоба бумага сшита.
  v_uv = vec2(u_flip > 0.5 ? 1.0 - a_uv.x : a_uv.x, a_uv.y);
  // Нормаль поворачиваем моделью — свет обязан жить в мировых координатах,
  // иначе он поедет вместе с предметом, а это первый признак подделки.
  v_n = mat3(u_model[0].xyz, u_model[1].xyz, u_model[2].xyz) * n;
  // У плоскостей, растущих ВЛЕВО от петли, геометрия зеркальна: обход вершин
  // переворачивается, и gl_FrontFacing сообщает «изнанка» для поверхности,
  // которая смотрит на зрителя. Передаём знак, чтобы фрагментный шейдер это учёл.
  v_face = u_dir;
  gl_Position = u_mvp * vec4(p, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec3 u_light;
uniform vec4 u_tint;      // rgb — подмешиваемый цвет, a — его доля
uniform highp float u_stripe;   // 1 — торец, 2 — тень на столе, 3 — кожа, 4 — тень листа
varying vec2 v_uv;
varying vec3 v_n;
varying float v_face;

void main(){
  // Нормаль разворачиваем по грани: у изнанки листа она смотрит от зрителя, и
  // abs(dot) светил её наравне с лицом — бумага казалась самосветящейся.
  vec3 n = normalize(v_n) * (gl_FrontFacing ? 1.0 : -1.0) * v_face;
  vec3 l = normalize(u_light);
  float d = max(dot(n, l), 0.0);
  // Просвет: тонкая бумага пропускает свет с обратной стороны, но слабо.
  float back = max(-dot(n, l), 0.0) * 0.12;
  float lit = 0.34 + 0.66 * d + back;

  // Контактная тень на «столе». Без неё том висит в пустоте: глаз ищет опору
  // раньше, чем разбирается в форме предмета.
  if (u_stripe > 1.5) {
    vec2 q = (v_uv - 0.5) * 2.0;
    float r = length(vec2(q.x * 0.92, q.y));
    float a = (1.0 - smoothstep(0.55, 1.0, r)) * 0.5;
    if (a < 0.004) discard;
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);
    return;
  }

  // Тень переворачиваемого листа. Настоящая тень изогнутой бумаги сама изогнута —
  // ни один градиент под элементом её не заменит, потому что не знает формы.
  if (u_stripe > 3.5) {
    float a = 0.26 * smoothstep(0.0, 0.10, v_uv.x) * (1.0 - smoothstep(0.12, 0.62, v_uv.x));
    if (a < 0.004) discard;
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);
    return;
  }

  vec4 tex;
  if (u_stripe > 2.5) {
    // Кожа корешка. Процедурная, а не кусок обложки: натянутая на дугу обложка
    // выводила в жёлоб обрывки тиснения — там, куда зритель смотрит в первую
    // очередь. Бинты поперёк — след шнуров, на которые сшит блок.
    float grain = fract(sin(v_uv.y * 733.0 + v_uv.x * 91.0) * 4137.0);
    float bands = smoothstep(0.34, 0.5, abs(fract(v_uv.y * 5.0) - 0.5)) * 0.16;
    vec3 leather = vec3(0.135, 0.125, 0.104) * (0.86 + 0.14 * grain) + bands * vec3(0.10, 0.09, 0.07);
    tex = vec4(leather, 1.0);
  } else if (u_stripe > 0.5) {
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
  const fail = (why: string): null => {
    canvas.dataset.bookError = why;
    return null;
  };
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return fail("webgl недоступен");

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
  gl.deleteShader(vs);
  gl.deleteShader(fs);
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
  const uSag = gl.getUniformLocation(prog, "u_sag");
  const uArc = gl.getUniformLocation(prog, "u_arc");
  const uFlip = gl.getUniformLocation(prog, "u_flip");
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
    proj = perspective((38 * Math.PI) / 180, w / h, 1.2, 40);
  }

  interface Piece {
    model: Mat4;
    size: [number, number];
    dir: 1 | -1;
    tex: WebGLTexture | null;
    bend?: number;
    sag?: number;
    flip?: boolean;
    arc?: number;
    stripe?: number;
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
    // Тень — декаль: пишет цвет, но не глубину, иначе перекроет книгу собой.
    // Тени — декали: пишут цвет, но не глубину, иначе перекроют книгу собой.
    const st = p.stripe ?? 0;
    gl.depthMask(!(st > 1.5 && st < 2.5) && st < 3.5);
    gl.uniform1f(uStripe, p.stripe ?? 0);
    gl.uniform1f(uSag, p.sag ?? 0);
    gl.uniform1f(uArc, p.arc ?? 0);
    gl.uniform1f(uFlip, p.flip ? 1 : 0);
    const t = p.tint ?? [0, 0, 0, 0];
    gl.uniform4f(uTint, t[0], t[1], t[2], t[3]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, p.tex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, data.length / 2);
  }

  function draw(open: number, turn = 0, leftPages = 0, rightPages = 8): void {
    if (!gl) return;
    const t = clamp01(open);
    const tw = clamp01(turn);

    // ── Камера. Она не украшение: закрытая книга должна читаться объёмной, а
    // раскрытый разворот — лежать перед зрителем в лоб. Поэтому наклон уходит в
    // ноль к концу хода, а точка взгляда переезжает с центра крышки на корешок.
    const settle = ease(phase(t, 0.15, 1));
    // Наклон не сводится в ноль. Строго лобовой ракурс уплощает всё: толщина
    // блока, выступ крышки и корешок вырождаются в линии. Остаточные девять
    // градусов держат объём и в покое.
    const pitch = ((32 - 23 * settle) * Math.PI) / 180;
    const yaw = ((-14 + 10 * settle) * Math.PI) / 180;
    // Горб по дистанции: в середине хода крышка стоит дыбом и вылезала за
    // кадр. Камера отъезжает и возвращается — на концах такта расстояние то же.
    const dist = 2.62 - 0.22 * settle + 1.15 * Math.sin(Math.PI * ease(phase(t, 0, 0.78)));
    const lookX = (PAGE_W / 2) * (1 - settle);
    const view = multiply(
      // Знак наклона именно такой. Мировой +Z — «вверх от стола»; при
      // rotationX(+pitch) он проецировался ВНИЗ экрана: толщина блока, подъём
      // крышки и высота отходящего листа рисовались в обратную сторону, а
      // разворот выходил трапецией шире сверху — обратная перспектива.
      multiply(translation(0, 0, -dist), multiply(rotationX(-pitch), rotationY(yaw))),
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
    // Лист во время РАСКРЫТИЯ идёт следом за крышкой, а после — слушается
    // листания. Задержка 0.46 против 0.30 у крышки: бумага не приклеена к
    // переплёту, и раньше лист успевал нырнуть под крышку, пока та ещё шла.
    const leafPhase = tw > 0 ? tw : ease(phase(t, 0.46, 1));
    const leafA = leafPhase * Math.PI;
    const leafBend = Math.sin(clamp01(leafPhase) * Math.PI) * 1.6;
    // Стопки живут от числа перевёрнутых листов, а не от хода открытия.
    const total = Math.max(1, leftPages + rightPages);
    const leftShare = (leftPages + leafPhase) / total;
    const leftT = 0.004 + BLOCK_T * 0.92 * leftShare * ease(phase(t, 0.4, 1));
    const rightT = 0.004 + BLOCK_T * 0.92 * (1 - leftShare);
    // Лист идёт ВЫШЕ правой стопки и выше крышки, пока та ещё в воздухе: раньше
    // он нырял внутрь корочки, потому что его высота была привязана к блоку.
    const leafZ = Math.max(rightT, leftT) + 0.006 + 0.03 * Math.sin(leafPhase * Math.PI);
    const leafModel = multiply(translation(0, 0, leafZ), rotationY(-leafA));

    const half: [number, number] = [PAGE_W, PAGE_H];
    // Крышка больше блока на «квадрат» и посажена так, чтобы выступ шёл по трём
    // сторонам — сверху, снизу и по обрезу, — а у корешка совпадал с блоком.
    const coverSize: [number, number] = [PAGE_W + SQUARE, PAGE_H + SQUARE * 2];
    // Насколько левая стопка уже набралась: пока лист один, это доля его хода.
    // Бумага проваливается в жёлоб только у раскрытой книги.
    const sag = 0.038 * settle;   // страницы заметно уходят в жёлоб

    // Порядок рисования снизу вверх; глубина включена, но прозрачные кромки
    // страниц требуют, чтобы дальнее шло раньше ближнего.
    const pieces: Piece[] = [
      // Контактная тень на столе — первой, под всем остальным.
      {
        model: translation(-(PAGE_W * settle + SQUARE), 0, -0.004),
        size: [PAGE_W * (1 + settle) + SQUARE * 2, PAGE_H * 1.24],
        dir: 1,
        tex: null,
        stripe: 2,
      },
      // Корешок: у закрытой книги узкая дуга по толщине блока, у раскрытой —
      // широкий жёлоб. Ставим до крышек, чтобы он уходил ЗА них по глубине.
      {
        model: translation(0, 0, BLOCK_T + COVER_T),
        size: [BLOCK_T + COVER_T * 2, PAGE_H + SQUARE * 2],
        dir: -1,
        tex: null,
        arc: 1,
        stripe: 3,
      },
      // Задняя крышка — под всем, изнанкой вверх, с выступом за обрез блока.
      // Растёт вправо от корешка: у закрытой книги слева нет ничего, и отдельной
      // «левой страницы» быть не должно — ею становится перевернувшийся лист.
      { model: translation(0, 0, 0), size: coverSize, dir: 1, tex: texEnd, sag },
      // торцы блока: верхний, нижний и внешний обрез
      {
        model: multiply(translation(0, PAGE_H / 2, rightT / 2), rotationX(-Math.PI / 2)),
        size: [PAGE_W, rightT],
        dir: 1,
        tex: null,
        stripe: 1,
      },
      {
        model: multiply(translation(0, -PAGE_H / 2, rightT / 2), rotationX(Math.PI / 2)),
        size: [PAGE_W, rightT],
        dir: 1,
        tex: null,
        stripe: 1,
      },
      {
        model: multiply(translation(PAGE_W, 0, rightT), rotationY(Math.PI / 2)),
        size: [rightT, PAGE_H],
        dir: 1,
        tex: null,
        stripe: 1,
      },
      // Правая страница — верх блока, с провалом к жёлобу.
      { model: translation(0, 0, rightT), size: half, dir: 1, tex: texR, sag },
      // Левая стопка: набирается по мере того, как лист ложится налево.
      {
        model: multiply(translation(0, PAGE_H / 2, leftT / 2), rotationX(-Math.PI / 2)),
        size: [PAGE_W, leftT],
        dir: -1,
        tex: null,
        stripe: 1,
      },
      {
        model: multiply(translation(-PAGE_W, 0, 0), rotationY(-Math.PI / 2)),
        size: [leftT, PAGE_H],
        dir: 1,
        tex: null,
        stripe: 1,
      },
      // Тень листа на странице под ним. Строго ПЕРЕД самим листом: наоборот
      // она накрывала его собой. Держится у корешка и слабеет к обрезу — там
      // бумага уже отошла от страницы и контакт потерян.
      ...(leafBend > 0.02
        ? [
            {
              model: multiply(
                translation(-0.01 * leafBend, -0.014 * leafBend, Math.max(rightT, leftT) + 0.0015),
                rotationY(-leafA),
              ),
              size: half,
              dir: 1 as const,
              tex: null,
              stripe: 4,
            },
          ]
        : []),
      // Лист, следующий за крышкой. Рисуем дважды: лицом вверх он показывает
      // ту же страницу, что лежала справа, а лёгши налево — свою изнанку.
      { model: leafModel, size: half, dir: 1, tex: texR, bend: leafBend, sag: leafBend < 0.01 ? (leafA > Math.PI / 2 ? -sag : sag) : 0 },
      {
        model: multiply(leafModel, translation(0, 0, -0.0008)),
        size: half,
        dir: 1,
        tex: texL,
        bend: leafBend,
        sag: leafBend < 0.01 ? (leafA > Math.PI / 2 ? -sag : sag) : 0,
        flip: true,
      },
      // крышка: лицо снаружи, форзац изнутри — рисуем двумя проходами
      { model: coverModel, size: coverSize, dir: 1, tex: texCover },
      { model: multiply(coverModel, translation(0, 0, -0.001)), size: coverSize, dir: 1, tex: texEnd, flip: true },
    ];

    // Левая страница существует только после того, как крышка перевалила за
    // ребро: до этого слева нет ничего, книга закрыта. Раньше она лежала
    // открытой с самого начала — страница показывалась прежде корочки.
    if (coverA > Math.PI / 2) {
      pieces.splice(2, 0, {
        model: translation(0, 0, leftT),
        size: half,
        dir: -1,
        tex: texL,
        sag: -sag,
        flip: true,
      });
    }

    for (const p of pieces) drawPiece(view, p);
    gl.depthMask(true);
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
