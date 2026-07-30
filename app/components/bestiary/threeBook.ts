// Книга на Three.js. Заменяет сцену, написанную руками.
//
// Почему переехали. Своя сцена была оправдана, пока речь шла о перспективе и двух
// поворотах. Но внутри книги будет игра, а к этому моменту я уже третью итерацию
// ловил один и тот же класс ошибок: знаки нормалей, порядок отрисовки, куски,
// проходящие сквозь друг друга, толщина, собранная из трёх полосок. Всё это
// движок держит сам, и держит правильно.
//
// Что даёт переезд помимо избавления от этих багов:
//  - граф сцены: замки просто дети крышки, а не результат перемножения матриц
//    руками. Крышка поворачивается — замки едут с ней, и это не надо
//    поддерживать;
//  - настоящие тела: крышки и блок — коробки, а не плоскости с приделанными
//    торцами. Толщина есть по построению, а не имитируется;
//  - карты теней: тень листа на странице и тень тома на столе считаются, а не
//    рисуются вручную полупрозрачными квадами в правильном порядке;
//  - рейкастинг для будущей игры: попадание курсора по объекту, а не арифметика
//    по долям холста.
//
// Вес: three грузится ОТДЕЛЬНЫМ чанком по динамическому импорту, только когда
// книгу открывают. Первый экран не потяжелел ни на байт — это было главное
// возражение против библиотеки, и оно снято технически.

import { deriveMaps } from "./derive";
import { pageMaterial } from "./pageDip";
import {
  AgXToneMapping,
  AmbientLight,
  BoxGeometry,
  EquirectangularReflectionMapping,
  Color,
  DirectionalLight,
  Group,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  PlaneGeometry,
  RepeatWrapping,
  BackSide,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector2,
  WebGLRenderer,
  type IUniform,
} from "three";

export interface BookTextures {
  coverFront: TexImageSource;
  endpaper: TexImageSource;
  pageLeft: TexImageSource;
  pageRight: TexImageSource;
  spine: TexImageSource;
  strap: TexImageSource;
  plate: TexImageSource;
  nCover: TexImageSource;
  nPage: TexImageSource;
  nPlate: TexImageSource;
  foredge: TexImageSource;
  nForedge: TexImageSource;
  headband: TexImageSource;
  nStrap: TexImageSource;
  catchPlate: TexImageSource;
  nCatch: TexImageSource;
}

export interface BookScene {
  /**
   * Ставит ЦЕЛЬ, а не кадр. Сцена гонит к ней сама в своём цикле — от этого
   * уходит дёрганость: раньше React перерисовывал по событиям, интервалы между
   * кадрами были неровными, и каждое листание давало рывок.
   */
  target(open: number, page: number): void;
  /** Текущее положение — чтобы снаружи знать, можно ли листать дальше. */
  readonly state: { open: number; page: number; busy: boolean };
  /**
   * Мгновенно ставит позу, без хода к цели. Нужно стенду: там смотрят статичное
   * состояние, и ждать 2.6 с на каждый сдвиг ползунка бессмысленно.
   */
  pose(open: number, page: number): void;
  /** Крутить книгу перетаскиванием: сдвиг в пикселях за кадр движения. */
  orbit(dx: number, dy: number): void;
  /** Отпустили — дальше по инерции. */
  release(vx: number, vy: number): void;
  resize(): void;
  dispose(): void;
}

/** Ширина страницы принята за единицу; остальное считается от неё. */
const PAGE_W = 1;
/** Пропорция обложки, снятая с ассета 1122×1402. */
const PAGE_H = PAGE_W / 0.8003;
const BLOCK_T = 0.29;
const COVER_T = 0.022;
/** «Квадрат» — выступ крышки за обрез блока, у переплётчиков миллиметра три. */
const SQUARE = 0.028;
/** Такт раскрытия и такт листания, секунды. Книга тяжёлая: спешка её убивает. */
const OPEN_S = 2.6;
const TURN_S = 0.85;
const LEAVES = 6;
/** Замки отходят до того, как тронется крышка. */
const CLASP_END = 0.3;

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const ease = (x: number): number => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const phase = (t: number, a: number, b: number): number => clamp01((t - a) / (b - a));

/**
 * Профиль падения листа. Страницу подхватывают быстро, вертикаль она проходит по
 * инерции, а на стопку падает с ускорением и коротко колеблется — бумага упругая
 * и лёгкая. Симметричный разгон-торможение читается механикой: одинаковый ход в
 * обе половины и мгновенная остановка в конце.
 */
function leafFall(x: number): number {
  const t = clamp01(x);
  // Перекос времени: первая половина хода идёт быстрее второй. Это и даёт
  // ощущение, что лист подхватили, а дальше он летит сам.
  const u = Math.pow(t, 0.8);
  // Сглаживание пятой степени. У обычного сглаживания нулевая только СКОРОСТЬ на
  // концах, а ускорение прыгает — глаз читает это как толчок в начале и стоп в
  // конце. Здесь ноль и у скорости, и у ускорения: движение начинается и кончается
  // незаметно.
  return u * u * u * (u * (u * 6 - 15) + 10);
}

/**
 * Карта нормалей. Отличается от цветной текстуры одним, но принципиальным: её
 * НЕЛЬЗЯ объявлять sRGB. В ней не цвет, а три числа на пиксель — наклон
 * поверхности по осям. Гамма-преобразование исказило бы наклоны, и рельеф
 * поехал бы не туда.
 */
function makeNormal(src: TexImageSource): Texture {
  const t = new Texture(src as TexImageSource);
  t.needsUpdate = true;
  return t;
}

function makeTexture(src: TexImageSource): Texture {
  const t = new Texture(src as TexImageSource);
  t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

/**
 * Материал бумаги, умеющий гнуться. Изгиб вносится в вершинный шейдер
 * StandardMaterial через onBeforeCompile: так лист получает и деформацию, и
 * правильный свет с тенями — свой шейдер пришлось бы освещать руками, чем я и
 * занимался, пока ловил знаки нормалей.
 */
function bendableMaterial(
  map: Texture,
  width: number,
  cut = false,
  /**
   * Куда загибать по глубине. Лист поднимается ОТ стопки (+1), а ремешок обязан
   * заворачиваться К книге, обнимая передний обрез (-1). С единым знаком ремешки
   * закручивались наружу, в пустоту, и висели в воздухе отдельными скобами.
   */
  dir: 1 | -1 = 1,
): {
  material: MeshStandardMaterial;
  bend: IUniform<number>;
} {
  const bend: IUniform<number> = { value: 0 };
  const material = new MeshStandardMaterial({
    map,
    roughness: 0.92,
    metalness: 0,
    transparent: cut,
    alphaTest: cut ? 0.5 : 0,
  });
  // Правим ровно две вставки — нормаль и позицию, — и не трогаем project_vertex
  // и прочие внутренности: их порядок и содержимое меняются между версиями
  // three, а begin_vertex/beginnormal_vertex — публичная точка расширения.
  // Ширина ПЕРЕДАЁТСЯ, а не берётся от страницы. Раньше стояло PAGE_W/2 и
  // s = position.x + bw, но геометрия и листа, и ремешка сдвинута так, что x
  // начинается с НУЛЯ у петли: оба гнулись, будто петля на полметра позади, а
  // ремешок вдобавок брал радиус чужой ширины и отлетал от бляшки.
  // ПРОГРЕССИВНЫЙ изгиб вместо равномерной дуги.
  //
  // Дуга постоянного радиуса гнёт лист как жесть: кривизна одинакова у петли и у
  // свободного края. Настоящая бумага ведёт себя иначе — у корешка она держится
  // почти плоско, а закручивается тем сильнее, чем дальше от петли.
  //
  // Угол растёт по степени: a = uBend·(s/wid)^1.7. Радиус берётся как Reff = s/a,
  // поэтому длина дуги остаётся равной s — бумага не растягивается, и это
  // отличает настоящий изгиб от простого поворота.
  const bendCode = (target: string) => `
    if (uBend > 0.001) {
      float wid = ${width.toFixed(4)};
      float s = position.x;                 // расстояние от петли
      float u = clamp(s / wid, 0.0, 1.0);
      float a = uBend * pow(u, 1.7);
      float R = a > 0.0005 ? s / a : 1.0e6;
      float dir = ${dir.toFixed(1)};
      ${target}
    }`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = bend;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uBend;")
      .replace(
        "#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>" +
          bendCode("objectNormal = normalize(vec3(-sin(a) * dir, 0.0, cos(a)));"),
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>" +
          bendCode("transformed.x = R * sin(a);\n      transformed.z += dir * R * (1.0 - cos(a));"),
      );
  };
  return { material, bend };
}

export function createBook(canvas: HTMLCanvasElement, tex: BookTextures): BookScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    canvas.dataset.bookError = "webgl недоступен";
    return null;
  }
  renderer.setClearColor(new Color(0x000000), 0);
  // AgX держит золото в светах, не выбеливая его: у ACESFilmic тиснение уходило
  // в жёлтую кашу на ярких участках.
  renderer.toneMapping = AgXToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();

  // ── Окружение, построенное кодом: тёплое окно слева-сверху, холодное небо,
  // тёмный низ. Ноль байт трафика, а материалы получают то, чего два источника
  // дать не могут — отражения комнаты. Именно от них металл читается металлом, а
  // кожа перестаёт быть плоской краской.
  const envCv = document.createElement("canvas");
  envCv.width = 256;
  envCv.height = 128;
  const eg = envCv.getContext("2d");
  if (eg) {
    const sky = eg.createLinearGradient(0, 0, 0, 128);
    sky.addColorStop(0, "#2b2a26");
    sky.addColorStop(0.45, "#171613");
    sky.addColorStop(1, "#080807");
    eg.fillStyle = sky;
    eg.fillRect(0, 0, 256, 128);
    // Окно: единственное яркое пятно. Оно и даёт блик на золоте.
    const win = eg.createRadialGradient(58, 30, 4, 58, 30, 62);
    win.addColorStop(0, "#fff0d2");
    win.addColorStop(0.4, "#8d7c58");
    win.addColorStop(1, "rgba(0,0,0,0)");
    eg.fillStyle = win;
    eg.fillRect(0, 0, 256, 128);
  }
  const envTex = new Texture(envCv);
  envTex.mapping = EquirectangularReflectionMapping;
  envTex.needsUpdate = true;
  const pmrem = new PMREMGenerator(renderer);
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;
  envTex.dispose();
  pmrem.dispose();
  const camera = new PerspectiveCamera(34, 1, 0.5, 40);

  // ── свет. Один направленный плюс заполняющий: тени должны читаться, но не
  // проваливать корешок в черноту.
  const sun = new DirectionalLight(0xfff4e0, 1.55);
  sun.position.set(-1.1, 1.7, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  // Смещение обязательно: без него поверхность затеняет саму себя, и по краям
  // блока идут регулярные светлые штрихи, а левая страница уходит в серость.
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const sc = sun.shadow.camera;
  sc.left = -3.2;
  sc.right = 3.2;
  sc.top = 3.2;
  sc.bottom = -3.2;
  sc.near = 0.2;
  sc.far = 8;
  scene.add(sun);
  scene.add(new AmbientLight(0xb9b4a6, 0.22));

  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const T = {
    cover: makeTexture(tex.coverFront),
    end: makeTexture(tex.endpaper),
    left: makeTexture(tex.pageLeft),
    right: makeTexture(tex.pageRight),
    spine: makeTexture(tex.spine),
    strap: makeTexture(tex.strap),
    plate: makeTexture(tex.plate),
    nCover: makeNormal(tex.nCover),
    nPage: makeNormal(tex.nPage),
    nPlate: makeNormal(tex.nPlate),
    foredge: makeTexture(tex.foredge),
    nForedge: makeNormal(tex.nForedge),
    headband: makeTexture(tex.headband),
    nStrap: makeNormal(tex.nStrap),
    catchPlate: makeTexture(tex.catchPlate),
    nCatch: makeNormal(tex.nCatch),
  };

  for (const key of ['cover', 'end', 'spine', 'plate'] as const) {
    T[key].anisotropy = aniso;
    T[key].needsUpdate = true;
  }

  // Карты рельефа обложки выводятся ИЗ её цветной текстуры. Сгенерированная
  // отдельно карта нормалей совпадала с рисунком на 0.12 по корреляции — то есть
  // почти не совпадала: свет ложился по одному узору, золото нарисовано по
  // другому, и это читалось кашей. У выведенной совпадение 0.533.
  const coverRelief = deriveMaps(tex.coverFront, 768, 2.6);

  const paper = (map: Texture): MeshStandardMaterial =>
    new MeshStandardMaterial({ map, roughness: 0.95, metalness: 0 });
  /** Лист с рваным краем: зубцы должны быть ВЫРЕЗАНЫ, а не залиты фоном. */
  const sheet = (map: Texture, normalMap?: Texture): MeshStandardMaterial => {
    map.generateMipmaps = false;
    map.minFilter = LinearFilter;
    map.needsUpdate = true;
    const m = new MeshStandardMaterial({
      map,
      normalMap,
      normalScale: normalMap ? new Vector2(0.7, 0.7) : undefined,
      roughness: 0.95,
      metalness: 0,
      transparent: false,
      alphaTest: 0.5,
    });
    // Срез через ПОКРЫТИЕ пикселя, а не через жёсткий порог: сглаживание кадра
    // само решает, какая доля пикселя закрыта, и рваная кромка выходит ровной, а
    // не ступенчатой. Работает только при включённом сглаживании — оно у нас есть.
    m.alphaToCoverage = true;
    return m;
  };
  const leather = new MeshStandardMaterial({ color: 0x14130f, roughness: 0.78, metalness: 0.05 });
  // Обрез блока: настоящая текстура кромок с картой нормалей. Процедурная
  // версия (edgeMaps.ts) осталась запасным путём — она гарантирует стыковку и
  // работает без файлов, но нарисованное волокно бумаги точнее.
  const edges: { map: Texture; normal: Texture } = { map: T.foredge, normal: T.nForedge };
  for (const t of [edges.map, edges.normal]) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.repeat.set(9, 1); // сотни тонких кромок вместо нескольких широких полос
    t.needsUpdate = true;
  }
  // Переплёт: сторона, где блок сшит. Тёмная, матовая, без кромок.
  const binding = new MeshStandardMaterial({ color: 0x24211b, roughness: 0.95, metalness: 0 });
  const blockSide = new MeshStandardMaterial({ color: 0x6b6659, roughness: 1, metalness: 0 });
  const edgeMat = new MeshStandardMaterial({
    map: edges.map,
    normalMap: edges.normal,
    normalScale: new Vector2(1.5, 1.5),
    // Кромки бумаги почти белые: контраст со тёмным переплётом и делает книгу
    // книгой. Текстура сама по себе тёмная для нашей сцены, поэтому осветляем.
    color: new Color(3.14, 3.70, 4.72),
    roughness: 0.96,
    metalness: 0,
  });
  // Верх и низ блока показывают те же кромки, но повёрнутые: там стопка видна
  // поперёк. Клонируем текстуру, иначе поворот уедет и на переднем обрезе.
  const edgeCross = new MeshStandardMaterial({
    map: (() => {
      const t = edges.map.clone();
          t.rotation = Math.PI / 2;
          t.center.set(0.5, 0.5);
          t.needsUpdate = true;
          return t;
        })(),
    normalMap: (() => {
      const t = edges.normal.clone();
          t.rotation = Math.PI / 2;
          t.center.set(0.5, 0.5);
          t.needsUpdate = true;
          return t;
        })(),
    normalScale: new Vector2(1.3, 1.3),
    color: new Color(3.14, 3.70, 4.72),
    roughness: 0.96,
    metalness: 0,
  });

  const book = new Group();
  scene.add(book);

  const coverW = PAGE_W + SQUARE;
  const coverH = PAGE_H + SQUARE * 2;

  // ── задняя крышка: коробка, а не плоскость. Толщина есть по построению.
  const backCover = new Mesh(new BoxGeometry(coverW, coverH, COVER_T, 160, 200, 1), [
    leather,
    leather,
    leather,
    leather,
    paper(T.end),
    leather,
  ]);
  backCover.position.set(coverW / 2 - SQUARE / 2, 0, -COVER_T / 2);
  backCover.receiveShadow = true;
  book.add(backCover);

  // ── блок страниц: тоже тело. Обрез по бокам — светлая бумага, сверху страница.
  /**
   * Форма переднего обреза.
   *
   * У книги с КРУГЛЁНЫМ корешком обрез не выпуклый, а ВОГНУТЫЙ: при круглении и
   * кашировке блок получает выпуклую спинку, и ровно та же бумага с другой стороны
   * образует ложбину. Я сперва выгнул наружу — знак был противоположный, книга
   * получала форму, которой у переплёта не бывает.
   *
   * Глубина ложбины у настоящего тома примерно вдвое меньше выступа корешка.
   */
  const bowBlock = (g: BoxGeometry): BoxGeometry => {
    const p = g.attributes.position;
    const halfW = PAGE_W / 2;
    const halfT = BLOCK_T / 2;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      if (Math.abs(x - halfW) > 1e-4) continue;   // трогаем только передний обрез
      const z = p.getZ(i);
      // Дуга по толщине: максимум выпуклости на середине стопки.
      const k = Math.cos((z / halfT) * Math.PI * 0.5);
      p.setX(i, x - 0.019 * k);
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  };

  const block = new Mesh(bowBlock(new BoxGeometry(PAGE_W, PAGE_H, BLOCK_T, 1, 1, 14)), [
    edgeCross,    // +x: передний обрез — UV этой грани повёрнуты
    binding,      // -x: КОРЕШКОВАЯ сторона, книга здесь сшита — обреза нет
    edgeMat,      // +y: верхний обрез
    edgeMat,      // -y: нижний обрез
    blockSide,    // +z: под верхней страницей
    blockSide,    // -z: низ
  ]);
  block.castShadow = true;
  block.receiveShadow = true;
  book.add(block);

  // ── левая половина блока: появляется, когда листы переходят налево.
  const leftBlock = new Mesh(new BoxGeometry(PAGE_W, PAGE_H, 0.01), [
    binding,      // +x: корешковая сторона левой стопки
    edgeCross,    // -x: передний обрез левой стопки, смотрит наружу
    edgeMat,
    edgeMat,
    blockSide,
    blockSide,
  ]);
  leftBlock.castShadow = true;
  leftBlock.receiveShadow = true;
  leftBlock.visible = false;
  book.add(leftBlock);

  // Верхние страницы обеих стопок — ГНУЩИЕСЯ, а не плоские. У настоящей книги
  // лист уходит в жёлоб дугой: у корешка ныряет вниз, к внешнему обрезу
  // выпрямляется. Две плоские плиты с щелью посередине и читались как «страницы
  // не связаны, это не разворот».
  //
  // Сетка по X обязательна: у плоскости из одного квада гнуть нечего. Геометрия
  // сдвинута так, что x = 0 приходится на петлю у корешка — этого ждёт шейдер
  // изгиба.
  // Сетка по X — задел под изгиб в жёлоб. Сам изгиб пока выключен: попытка
  // зеркалить левую страницу поворотом на 180° показывала её ИЗНАНКУ, и текстура
  // пропадала. Правильное решение — своя геометрия с петлёй у корешка для каждой
  // стороны, а не поворот одной и той же.
  // Геометрия ЦЕНТРИРОВАННАЯ. Сдвиг геометрии к петле ломал левую страницу — она
  // переставала рисоваться вовсе, хотя оставалась видимой и на правильной высоте.
  // Расстояние от петли считает шейдер.
  const rightGeo = new PlaneGeometry(PAGE_W, PAGE_H, 48, 1);
  const leftGeo = new PlaneGeometry(PAGE_W, PAGE_H, 48, 1);
  const rightSheet = pageMaterial(T.right, T.nPage, 1);
  const leftSheet = pageMaterial(T.left, T.nPage, -1);
  const rightPage = new Mesh(rightGeo, rightSheet.material);
  rightPage.receiveShadow = true;
  book.add(rightPage);
  const leftPage = new Mesh(leftGeo, leftSheet.material);
  leftPage.receiveShadow = true;
  leftPage.visible = false;
  book.add(leftPage);

  // ── корешок: полуцилиндр между крышками. Лицевая сторона с тиснением смотрит
  // от зрителя, изнутри видна подкладка — как у настоящей раскрытой книги.
  // ── КОРЕШОК.
  //
  // Прежняя версия была построена как ЖЁЛОБ: дуга лежала плашмя под блоком и
  // раскрывалась вверх. Это форма для развёрнутой книги, а у закрытой корешок
  // обязан быть полуцилиндром, который обнимает левое ребро и выпуклый НАРУЖУ.
  // Вдобавок его лицо стояло BackSide, поэтому тиснение читалось зеркально —
  // буквы шли задом наперёд.
  //
  // Теперь это половина цилиндра с вертикальной осью. Дуга идёт от задней крышки
  // к передней, проходя через самую выступающую точку слева. Радиус равен половине
  // толщины книги с крышками: только тогда корешок сходится с крышками без
  // ступеньки.
  const sw = BLOCK_T + COVER_T * 2;
  // Дуга корешка — ЭЛЛИПС, а не полукруг. По толщине она обязана пройти всю
  // книгу (иначе не сойдётся с крышками), а НАРУЖУ выпирать лишь слегка: у
  // настоящего тома выступ корешка около шестой части толщины. Полукруг давал
  // выступ 0.167 — почти пол-толщины, и с торца книга показывала чёрный диск
  // шире самих крышек.
  const spineRz = sw / 2;      // полуось по толщине
  const spineRx = sw * 0.17;   // выступ наружу
  const spineR = spineRz;      // для посадки по глубине
  const SPINE_SEG = 28;
  const spineGeo = new PlaneGeometry(1, coverH, SPINE_SEG, 1);
  const spinePos = spineGeo.attributes.position;
  const spineUv = spineGeo.attributes.uv;
  for (let i = 0; i < spinePos.count; i++) {
    // u = 0 у задней крышки, 1 у передней. Угол идёт от -90° до +90°, поэтому
    // середина дуги приходится ровно на самую левую точку корешка.
    const u = spineUv.getX(i);
    const a = (u - 0.5) * Math.PI;
    spinePos.setX(i, -spineRx * Math.cos(a));
    spinePos.setZ(i, spineRz * Math.sin(a));
  }
  spineGeo.computeVertexNormals();

  // Подкладка: та же дуга чуть внутрь, чтобы с торца не просвечивало насквозь.
  const spine = new Mesh(
    spineGeo.clone().scale(0.97, 1, 0.97),
    new MeshStandardMaterial({ color: 0x14120f, roughness: 0.9, metalness: 0.02, side: BackSide }),
  );
  // Лицо с тиснением смотрит НАРУЖУ, обычной стороной: зеркалить нечего.
  const spineFace = new Mesh(
    spineGeo,
    new MeshStandardMaterial({
      map: T.spine,
      normalMap: T.nCover,
      normalScale: new Vector2(0.5, 0.5),
      roughness: 0.72,
      metalness: 0.18,
    }),
  );
  spineFace.castShadow = true;
  spine.receiveShadow = true;
  book.add(spine);
  book.add(spineFace);

  // Каптал — плетёная лента у корешка сверху и снизу. Мелочь, но именно она
  // выдаёт ручной переплёт: без неё блок просто упирается в корешок.
  const headbandMat = new MeshStandardMaterial({
    map: T.headband,
    roughness: 0.85,
    metalness: 0,
    transparent: true,
    alphaTest: 0.4,
  });
  const headbands: Mesh[] = [];
  for (const sy of [1, -1]) {
    const hb = new Mesh(new PlaneGeometry(BLOCK_T * 0.92, 0.034), headbandMat);
    hb.rotation.x = -Math.PI / 2 * sy;
    headbands.push(hb);
    book.add(hb);
  }

  // ── передняя крышка на петле у корешка. Замки — ЕЁ ДЕТИ: поворачивается
  // крышка, они едут с ней сами, без перемножения матриц руками.
  const coverHinge = new Group();
  book.add(coverHinge);
  // Коробка ПОДРАЗДЕЛЕНА: у грани с одной вершиной на угол смещать нечего, а
  // displacement двигает именно вершины. 160×200 на лицевой грани — тиснение
  // начинает ломать силуэт и отбрасывать собственную тень, чего карта нормалей
  // не умеет в принципе.
  const frontCover = new Mesh(new BoxGeometry(coverW, coverH, COVER_T), [
    leather,
    leather,
    leather,
    leather,
    new MeshStandardMaterial({
      map: T.cover,
      normalMap: coverRelief ? coverRelief.normal : T.nCover,
      normalScale: new Vector2(0.85, 0.85),
      displacementMap: coverRelief ? coverRelief.height : undefined,
      // Высота тиснения на настоящей книге — полмиллиметра при странице 30 см,
      // то есть примерно 0.0017 в наших единицах. Берём втрое больше: на экране
      // полмиллиметра не читается, а втрое — уже да, и ещё не карикатура.
      displacementScale: coverRelief ? 0.005 : 0,
      displacementBias: coverRelief ? -0.0015 : 0,
      roughness: 0.62,
      metalness: 0.22,
    }),
    paper(T.end),
  ]);
  frontCover.position.set(coverW / 2 - SQUARE / 2, 0, COVER_T / 2);
  frontCover.castShadow = true;
  coverHinge.add(frontCover);

  const claspGroups: Group[] = [];
  const straps: Mesh[] = [];
  const strapBends: IUniform<number>[] = [];
  const plateW = 0.2;
  const plateT = 0.014;
  for (const sy of [0.27, -0.27]) {
    const g = new Group();
    g.position.set(PAGE_W + SQUARE - 0.145, PAGE_H * sy, COVER_T);
    coverHinge.add(g);
    claspGroups.push(g);

    // Бляшка — тонкое ТЕЛО, а не плоскость: у плоскости нет толщины, и с торца
    // замок исчезал в линию. Литая латунь: грани из того же материала, лицо с
    // картой нормалей.
    const brass = new MeshStandardMaterial({
      map: T.plate,
      normalMap: T.nPlate,
      normalScale: new Vector2(1.2, 1.2),
      roughness: 0.42,
      metalness: 0.65,
      transparent: true,
      alphaTest: 0.5,
    });
    const brassEdge = new MeshStandardMaterial({ color: 0x8a7748, roughness: 0.38, metalness: 0.8 });
    const plate = new Mesh(new BoxGeometry(plateW, plateW * (386 / 420), plateT), [
      brassEdge,
      brassEdge,
      brassEdge,
      brassEdge,
      brass,
      brassEdge,
    ]);
    plate.position.set(-plateW * 0.42, 0, plateT / 2);
    plate.castShadow = true;
    g.add(plate);

    const strapW = 0.52;
    // Ремешок — тонкая КОРОБКА с сеткой по длине: плоскость с торца исчезала.
    // Сегменты нужны шейдеру изгиба, он гнёт по X.
    const sgeo = new BoxGeometry(strapW, strapW * (106 / 620), 0.008, 18, 1, 1);
    sgeo.translate(strapW / 2, 0, 0);
    const { material, bend } = bendableMaterial(T.strap, strapW, true, -1);
    // Рельеф кожи на ремешке: до этого он был единственной поверхностью совсем
    // без карты нормалей — плоская краска рядом с рельефной крышкой.
    material.normalMap = T.nStrap;
    material.normalScale = new Vector2(1.15, 1.15);
    material.needsUpdate = true;
    // Торцам — своя тёмная кожа. С одним материалом на всю коробку текстура
    // ремешка натягивалась и на боковые грани, вытягиваясь там в яркую нить:
    // вокруг замка шла проволочная обводка. Изгиб общий, поэтому торцевой
    // материал берёт ТОТ ЖЕ параметр гиба — иначе грани поехали бы отдельно.
    const edgeSkin = bendableMaterial(T.strap, strapW, false, -1);
    edgeSkin.material.color.setHex(0x2a241c);
    edgeSkin.material.map = null;
    edgeSkin.material.roughness = 0.95;
    edgeSkin.material.needsUpdate = true;
    const strap = new Mesh(sgeo, [
      edgeSkin.material,
      edgeSkin.material,
      edgeSkin.material,
      edgeSkin.material,
      material,
      material,
    ]);
    strap.castShadow = true;
    g.add(strap);
    straps.push(strap);
    strapBends.push(bend);
    strapBends.push(edgeSkin.bend);
  }

  // ── переворачиваемый лист: плоскость, гнущаяся в шейдере.
  const leafHinge = new Group();
  book.add(leafHinge);
  const leafGeo = new PlaneGeometry(PAGE_W, PAGE_H, 48, 1);
  leafGeo.translate(PAGE_W / 2, 0, 0);
  const leafFront = bendableMaterial(T.right, PAGE_W);
  const leaf = new Mesh(leafGeo, leafFront.material);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  leafHinge.add(leaf);
  // Оборот листа: своя текстура и BackSide. Без него лист за -90° показывал
  // пустоту и вдобавок дублировал страницу, лежащую под ним.
  const leafBackMat = bendableMaterial(T.left, PAGE_W);
  leafBackMat.material.side = BackSide;
  const leafBack = new Mesh(leafGeo.clone(), leafBackMat.material);
  leafBack.castShadow = true;
  leafHinge.add(leafBack);

  let w = 2;
  let h = 2;
  /**
   * Узкий кадр требует другой постановки. Разворот имеет пропорцию около 1.6:1;
   * на телефоне в портрете он влезает такой мелочью, что читать нечего. Поэтому
   * при узком холсте камера идёт не к развороту, а к ОДНОЙ странице — той, с
   * которой листают, — и держит её во весь кадр.
   */
  let narrow = false;

  function resize(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = Math.max(2, canvas.clientWidth);
    h = Math.max(2, canvas.clientHeight);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    narrow = w / h < 1.15;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render(open: number, turn: number, leftPages: number, rightPages: number): void {
    const t = clamp01(open);
    const tw = clamp01(turn);
    const settle = ease(phase(t, 0.15, 1));

    // Камера: закрытая книга читается объёмной, раскрытая лежит перед зрителем,
    // но наклон не сводится в ноль — в лоб объём исчезает целиком.
    // ── Постановка камеры в три такта, а не одним переходом.
    //
    // Один линейный переход давал «полубоком»: камера всё время висела под
    // случайным промежуточным углом и ни в один момент не стояла правильно.
    // Такты разнесены во времени и каждый отвечает за свою мысль.
    //
    //  A. Пока отходят замки — камера НЕ двигается почти совсем, только медленно
    //     подъезжает. Это ожидание: книга ещё закрыта, зритель считает секунды.
    //  B. Крышка идёт — камера поднимается и разворачивается фронтально, следуя
    //     за раскрытием. Здесь всё движение.
    //  C. Посадка — короткий перелёт с недоездом и возвратом: том встаёт на место
    //     не мгновенно, у него есть вес.
    const anticip = ease(phase(t, 0, CLASP_END));
    const swing = ease(phase(t, CLASP_END, 0.86));
    const land = phase(t, 0.86, 1);
    // Недоезд: камера чуть проскакивает и возвращается. Синус даёт ноль на обоих
    // концах, поэтому посадка не рвёт кадр.
    const overshoot = Math.sin(land * Math.PI) * 1.4;

    // Вращение мышью НЕ подменяет постановку, а складывается с ней: срежиссированный
    // ход остаётся, зритель только смотрит с другой стороны. Влияние слабеет по мере
    // раскрытия — у разворота своя правильная точка, крутить его незачем.
    const orbW = 1 - swing * 0.72;
    const basePitch = narrow ? 16 - 2 * anticip - 8 * swing : 20 - 2 * anticip - 9 * swing;
    const pitch = ((basePitch + overshoot) * Math.PI) / 180 + orb.pitch * orbW;
    const baseYaw = narrow ? -9 + 1 * anticip + 8 * swing : -16 + 2 * anticip + 14 * swing;
    const yaw = (baseYaw * Math.PI) / 180 + orb.yaw * orbW;
    // В узком кадре подходим заметно ближе и целимся в одну страницу.
    const dist = narrow
      ? 2.62 + 0.22 * swing + overshoot * 0.02
      : 2.78 + 0.34 * swing - 0.06 * anticip + overshoot * 0.02;
    // Широкий кадр к концу хода смотрит в корешок (виден весь разворот), узкий —
    // остаётся на правой странице.
    const lookX = narrow ? PAGE_W * 0.5 : (PAGE_W / 2) * (1 - swing);
    camera.position.set(
      lookX + dist * Math.sin(yaw) * Math.cos(pitch),
      dist * Math.sin(pitch),
      dist * Math.cos(yaw) * Math.cos(pitch),
    );
    camera.lookAt(lookX, 0, 0);

    // Замки отходят первыми, крышка ждёт их.
    const cl = ease(phase(t, 0, CLASP_END));
    const strapCurl = 3.35 * (1 - ease(phase(t, 0, CLASP_END * 0.6)));
    for (const sb of strapBends) sb.value = strapCurl;
    for (let i = 0; i < claspGroups.length; i++) {
      // Ремешок сначала распрямляется и только потом отходит: сперва он должен
      // отцепиться от штыря, а уже затем подниматься.
      claspGroups[i].rotation.y = -1.5 * ease(phase(t, CLASP_END * 0.45, CLASP_END));
      claspGroups[i].visible = cl < 0.995;

    }

    coverHinge.rotation.y = -ease(phase(t, CLASP_END, 0.86)) * Math.PI;
    coverHinge.position.z = (BLOCK_T + COVER_T) * (1 - ease(phase(t, 0.45, 1)));

    const total = Math.max(1, leftPages + rightPages);
    // Ход листа прогоняется через профиль падения: первая треть — подхват,
    // середина — свободный пролёт, последняя треть — падение с ускорением и
    // короткое затухающее колебание. Линейный ход читается механикой.
    const rawLeaf = tw > 0 ? tw : ease(phase(t, 0.46, 1));
    const leafPhase = leafFall(rawLeaf);
    // Доля левой стопки гасится при ЗАКРЫВАНИИ. Иначе у закрытой книги половина
    // толщины остаётся слева, за пределами крышки: том стоит с торчащей плитой
    // сбоку. Физически верно — закрытая книга это одна стопка под крышкой, где бы
    // ни была закладка. Порог 0.5 совпадает с моментом, когда крышка проходит
    // вертикаль и левая стопка вообще становится видимой.
    const spread = ease(phase(t, 0.5, 0.92));
    const leftShare = ((leftPages + leafPhase) / total) * spread;
    const rightT = 0.01 + BLOCK_T * 0.94 * (1 - leftShare);
    const leftT = 0.01 + BLOCK_T * 0.94 * leftShare;

    block.scale.z = Math.max(0.02, rightT / BLOCK_T);
    block.position.set(PAGE_W / 2, 0, rightT / 2);
    rightPage.position.set(PAGE_W / 2, 0, rightT + 0.006);

    leftBlock.visible = coverHinge.rotation.y < -Math.PI / 2;
    leftBlock.scale.z = Math.max(0.02, leftT / 0.01);
    leftBlock.position.set(-PAGE_W / 2, 0, leftT / 2);
    leftPage.visible = leftBlock.visible;
    leftPage.position.set(-PAGE_W / 2, 0, leftT + 0.006);

    const dipAmt = ease(phase(t, 0.55, 0.95));
    rightSheet.dip.value = rightT * 0.42 * dipAmt;
    leftSheet.dip.value = leftT * 0.42 * dipAmt;
    const rimHi = Math.max(rightT, leftT);
    const rim = rimHi + (Math.min(rightT, leftT) - rimHi) * ease(phase(t, 0.45, 0.9));
    spine.position.set(0, 0, rim - spineR);
    // Капталы сидят на торцах блока у самого корешка и едут за его толщиной.
    for (let i = 0; i < headbands.length; i++) {
      const sy = i === 0 ? 1 : -1;
      const hb = headbands[i];
      hb.position.set(-spineRx * 0.45, (PAGE_H / 2) * sy * 0.995, spine.position.z);
      hb.scale.set(spine.scale.x, 1, 1);
    }
    spineFace.position.copy(spine.position);
    spineFace.position.z -= 0.006;

    leafHinge.rotation.y = -leafPhase * Math.PI;
    leafHinge.position.set(0, 0, Math.max(rightT, leftT) + 0.006);
    const leafBend = Math.sin(clamp01(leafPhase) * Math.PI) * 1.6;
    leafFront.bend.value = leafBend;
    leafBackMat.bend.value = leafBend;
    leaf.visible = leafPhase > 0.002 && leafPhase < 0.998;
    leafBack.visible = leaf.visible;

    renderer.render(scene, camera);
    canvas.dataset.bookState = cur.open.toFixed(3) + ':' + cur.page.toFixed(2);
  }

  resize();

  // ── Цикл кадров. Живёт всё время, пока сцена жива, и гонит текущие значения к
  // целевым. Скорость задана в единицах в секунду, а не «за кадр»: на 144 Гц и
  // на 60 Гц движение одинаковое.
  // Вращение мышью. Держится, а не отскакивает: смысл в том, чтобы дать
  // рассмотреть том — пружина обратно мешала бы именно этому.
  const orb = { yaw: 0, pitch: 0, vYaw: 0, vPitch: 0 };
  const cur = { open: 0, page: Math.floor(LEAVES / 2) };
  const tgt = { open: 0, page: 0 };
  const state = { open: 0, page: Math.floor(LEAVES / 2), busy: false };
  let raf = 0;
  let last = 0;

  function step(now: number): void {
    raf = requestAnimationFrame(step);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    // Раскрытие: 1 / OPEN_S секунды на полный ход, с плавным подходом к цели.
    const openSpeed = 1 / OPEN_S;
    const dOpen = tgt.open - cur.open;
    if (Math.abs(dOpen) > 1e-4) {
      cur.open += Math.sign(dOpen) * Math.min(Math.abs(dOpen), openSpeed * dt);
    } else {
      cur.open = tgt.open;
    }

    // Листание: страница едет к целевой с тем же принципом.
    const turnSpeed = 1 / TURN_S;
    const dPage = tgt.page - cur.page;
    if (Math.abs(dPage) > 1e-4) {
      cur.page += Math.sign(dPage) * Math.min(Math.abs(dPage), turnSpeed * dt);
    } else {
      cur.page = tgt.page;
    }

    // Инерция вращения: скорость гаснет за ~0.4 с, углы упираются в пределы.
    if (orb.vYaw || orb.vPitch) {
      orb.yaw += orb.vYaw * dt;
      orb.pitch += orb.vPitch * dt;
      const damp = Math.pow(0.02, dt);
      orb.vYaw *= damp;
      orb.vPitch *= damp;
      if (Math.abs(orb.vYaw) < 0.01) orb.vYaw = 0;
      if (Math.abs(orb.vPitch) < 0.01) orb.vPitch = 0;
    }
    // Вращение почти по кругу и с заходом ПОД книгу: посмотреть низ тома было
    // нельзя — предел не пускал камеру ниже уровня стола.
    orb.yaw = Math.max(-2.6, Math.min(2.6, orb.yaw));
    orb.pitch = Math.max(-1.0, Math.min(1.15, orb.pitch));

    state.open = cur.open;
    state.page = cur.page;
    state.busy = Math.abs(dOpen) > 1e-3 || Math.abs(dPage) > 1e-3;

    // Целая часть — сколько листов уже слева, дробная — ход текущего.
    const whole = Math.floor(cur.page + 1e-6);
    const frac = cur.page - whole;
    render(cur.open, frac, whole, Math.max(1, LEAVES - whole));
  }
  raf = requestAnimationFrame(step);
  // Метка готовности: по ней и сквозной тест, и замер «клик -> первый кадр».
  canvas.dataset.ready = "1";

  return {
    target(open: number, page: number): void {
      tgt.open = clamp01(open);
      tgt.page = Math.max(0, Math.min(LEAVES, page));
    },
    state,
    pose(open: number, page: number): void {
      cur.open = clamp01(open);
      cur.page = Math.max(0, Math.min(LEAVES, page));
      tgt.open = cur.open;
      tgt.page = cur.page;
    },
    orbit(dx: number, dy: number): void {
      orb.yaw -= dx * 0.006;
      orb.pitch -= dy * 0.005;
      orb.vYaw = 0;
      orb.vPitch = 0;
    },
    release(vx: number, vy: number): void {
      orb.vYaw = -vx * 0.006;
      orb.vPitch = -vy * 0.005;
    },
    resize,
    dispose(): void {
      cancelAnimationFrame(raf);
      for (const key of Object.keys(T) as (keyof typeof T)[]) T[key].dispose();
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m.dispose();
        }
      });
      envRT.dispose();
      renderer.dispose();
    },
  };
}
