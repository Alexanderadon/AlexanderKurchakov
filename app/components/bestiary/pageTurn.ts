// Переворот страницы сеткой в WebGL.
//
// Почему не CSS rotateY: поворот плоскости — преобразование аффинное, и браузер
// делает его даром, но бумага не доска. Плоский лист на петле читается именно
// картонкой: нет изгиба, нет бегущего по нему блика, свет не меняется. Здесь
// страница гнётся по цилиндру переменного радиуса, нормаль считается в вершинном
// шейдере, а свет берётся ИЗ нормали — то есть блик едет по бумаге сам и не
// запечён в текстуру. Заодно это снимает старую беду: у нарисованного света
// направление зафиксировано навсегда, у расчётного — нет.
//
// Радиус: R = W / (curl · sin(π·t)). На t=0 и t=1 синус равен нулю, радиус
// уходит в бесконечность, лист плоский — начало и конец хода совпадают с
// лежащей страницей без скачка. Максимум изгиба приходится на середину.

export interface TurnOpts {
  /** Текстура лицевой стороны (правая страница). */
  front: TexImageSource;
  /** Текстура оборота (левая страница). */
  back: TexImageSource;
  /** Доли области страницы внутри холста: корешок, правый край, верх, низ. */
  rect: { gutter: number; right: number; top: number; bottom: number };
}

export interface TurnScene {
  /** t: 0 — лист лежит справа, 1 — лёг налево. */
  draw(t: number): void;
  resize(): void;
  dispose(): void;
}

const COLS = 72;
const ROWS = 8;
const CURL = 1.55;
// Перспектива намеренно слабая: при 0.42 поднятый лист раздувался и вылезал
// за обрез книги — страница не может быть шире тома, в котором лежит.
const PERSP = 0.24;

const VERT = `
attribute vec2 a_uv;
uniform float u_t;
uniform vec2 u_page;      // ширина и высота страницы в мировых единицах
uniform vec2 u_scale;     // мировые единицы -> клип
uniform vec2 u_origin;    // корешок в клип-координатах
uniform float u_pass;     // 0 — бумага, 1 — её тень на нижней странице
varying vec2 v_uv;
varying vec3 v_n;
varying float v_shade;
varying float v_lift;

const float PI = 3.141592653589793;

void main(){
  float s = a_uv.x * u_page.x;
  float bend = sin(PI * clamp(u_t, 0.0, 1.0));
  float R = u_page.x / max(1e-4, bend * ${CURL.toFixed(2)});
  float ang = s / R;

  vec3 p = vec3(R * sin(ang), (0.5 - a_uv.y) * u_page.y, R * (1.0 - cos(ang)));
  vec3 n = vec3(sin(ang), 0.0, -cos(ang));

  float ph = PI * clamp(u_t, 0.0, 1.0);
  float c = cos(ph), sn = sin(ph);
  vec3 q  = vec3(p.x * c - p.z * sn, p.y, p.x * sn + p.z * c);
  vec3 nq = vec3(n.x * c - n.z * sn, n.y, n.x * sn + n.z * c);

  // Ближе к зрителю — крупнее. Без этого поворот выглядит плоской развёрткой.
  float pz = 1.0 / (1.0 - q.z * ${PERSP.toFixed(2)});
  vec2 scr = q.xy * pz * u_scale + u_origin;

  // Тень — тот же самый лист, положенный обратно в плоскость книги и сдвинутый
  // по направлению света. Настоящая тень изогнутой бумаги сама изогнута; ни один
  // градиент под элементом её не заменит, потому что он не знает формы листа.
  if (u_pass > 0.5) {
    scr = vec2(q.x, q.y) * u_scale + u_origin + vec2(0.014, -0.018) * bend;
  }
  v_lift = bend;

  v_uv = a_uv;
  v_n = nq;
  // Мягкое затемнение к корешку: у настоящей книги там всегда тень от жёлоба.
  v_shade = 0.72 + 0.28 * smoothstep(0.0, 0.34, a_uv.x);
  gl_Position = vec4(scr, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D u_front;
uniform sampler2D u_back;
uniform vec3 u_light;
// Точность объявлена явно и совпадает с вершинным шейдером. Там по умолчанию
// highp, здесь — mediump, и линковка падала с «Precisions of uniform 'u_pass'
// differ»: общий для двух шейдеров uniform обязан быть одной точности.
uniform highp float u_pass;
varying vec2 v_uv;
varying vec3 v_n;
varying float v_shade;
varying float v_lift;

void main(){
  // Проход тени: только альфа. Чем выше поднят лист, тем тень слабее — бумага
  // отходит от страницы, и контакт теряется.
  if (u_pass > 0.5) {
    float a = 0.38 * (1.0 - v_lift * 0.5) * smoothstep(0.0, 0.20, v_uv.x);
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);
    return;
  }
  vec3 n = normalize(v_n);
  // Оборот зеркалим: это та же страница с изнанки, а не вторая копия лица.
  vec2 uv = gl_FrontFacing ? v_uv : vec2(1.0 - v_uv.x, v_uv.y);
  vec4 tex = gl_FrontFacing ? texture2D(u_front, uv) : texture2D(u_back, uv);
  if (tex.a < 0.02) discard;

  float d = abs(dot(n, normalize(u_light)));
  float lit = 0.66 + 0.34 * d;
  // Бумага не глянец: блик широкий и слабый, иначе выйдет пластик.
  float sheen = pow(d, 8.0) * 0.09;
  vec3 col = tex.rgb * lit * v_shade + sheen;
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

function texture(gl: WebGLRenderingContext, src: TexImageSource): WebGLTexture | null {
  const t = gl.createTexture();
  if (!t) return null;
  gl.bindTexture(gl.TEXTURE_2D, t);
  // Текстуры уже с прозрачной кромкой — грузим умножёнными на альфу, иначе по
  // рваному краю пойдёт светлый ореол (тот же баг, что был у собора).
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

export function createTurn(canvas: HTMLCanvasElement, opts: TurnOpts): TurnScene | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return null;

  // Причину отказа кладём в сам холст: молчаливый null отлаживается вслепую.
  const fail = (why: string): null => { canvas.dataset.turnError = why; return null; };
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  if (typeof vs === "string") return fail("вершинный: " + vs);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (typeof fs === "string") return fail("фрагментный: " + fs);
  const prog = gl.createProgram();
  if (!prog) return fail("не создана программа");
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fail("линковка: " + (gl.getProgramInfoLog(prog) || "?"));
  gl.useProgram(prog);

  // Сетка полосами: строк немного (изгиб одинаков по высоте), столбцов много —
  // от их числа зависит гладкость дуги и то, насколько ровно ляжет текстура.
  const verts: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const u = c / COLS;
      verts.push(u, r / ROWS, u, (r + 1) / ROWS);
    }
    if (r < ROWS - 1) {
      verts.push(1, (r + 1) / ROWS, 0, (r + 1) / ROWS); // вырожденные — разрыв ленты
    }
  }
  const data = new Float32Array(verts);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_uv");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const front = texture(gl, opts.front);
  const back = texture(gl, opts.back);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, front);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, back);
  gl.uniform1i(gl.getUniformLocation(prog, "u_front"), 0);
  gl.uniform1i(gl.getUniformLocation(prog, "u_back"), 1);
  gl.uniform3f(gl.getUniformLocation(prog, "u_light"), -0.35, 0.42, 0.84);

  const uT = gl.getUniformLocation(prog, "u_t");
  const uPage = gl.getUniformLocation(prog, "u_page");
  const uScale = gl.getUniformLocation(prog, "u_scale");
  const uOrigin = gl.getUniformLocation(prog, "u_origin");
  const uPass = gl.getUniformLocation(prog, "u_pass");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE); // обе стороны листа настоящие, отсекать нечего

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

    const { gutter, right, top, bottom } = opts.rect;
    const pw = (right - gutter) * w;
    const ph = (bottom - top) * h;
    const hw = ph / pw; // высота страницы в единицах её ширины
    gl.uniform2f(uPage, 1, hw);
    gl.uniform2f(uScale, (2 * pw) / w, (2 * ph) / h / hw);
    gl.uniform2f(uOrigin, gutter * 2 - 1, 1 - (top + bottom));
  }

  function draw(t: number): void {
    if (!gl) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uT, t);
    // Сначала тень, поверх неё бумага: иначе лист окажется под собственной тенью.
    gl.uniform1f(uPass, 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, data.length / 2);
    gl.uniform1f(uPass, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, data.length / 2);
  }

  resize();

  return {
    draw,
    resize,
    dispose(): void {
      gl.deleteTexture(front);
      gl.deleteTexture(back);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
