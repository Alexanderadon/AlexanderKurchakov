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
import { pageMaterial, DIP_K } from "./pageDip";
import {
  AgXToneMapping,
  AmbientLight,
  BoxGeometry,
  ClampToEdgeWrapping,
  EquirectangularReflectionMapping,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  PlaneGeometry,
  RepeatWrapping,
  RGBADepthPacking,
  BackSide,
  DoubleSide,
  Scene,
  ShadowMaterial,
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
  /**
   * Точка подхвата следующего листа по высоте: -1 низ, +1 верх. Зовётся перед
   * target() с новой страницей; лист закручивается сильнее с той стороны, за
   * которую его взяли.
   */
  turnFrom(fromY: number): void;
  /** Крутить книгу перетаскиванием: сдвиг в пикселях за кадр движения. */
  orbit(dx: number, dy: number): void;
  /** Отпустили — дальше по инерции. */
  release(vx: number, vy: number): void;
  /**
   * Сброс накопленного поворота в ноль. Компенсировать «докруткой» через orbit
   * нельзя: он клампует углы, и попытка стенда вернуть камеру парой orbit(±1e5)
   * просто вбивала её в угловые пределы — все «сбросы» смотрели сверху-сзади.
   */
  resetView(): void;
  resize(): void;
  dispose(): void;
}

/** Ширина страницы принята за единицу; остальное считается от неё. */
const PAGE_W = 1;
/**
 * Пропорция снята с обложки 1043×1508 — готический канон для фолианта.
 * Прежние 1:1.2495 были сняты со старого ассета 1122×1402 и оказались слишком
 * квадратными: настоящая средневековая страница заметно уже и выше.
 * Менять это число без новой обложки нельзя — тиснение растянется.
 */
const PAGE_H = PAGE_W * 1.4459;
const BLOCK_T = 0.29;
const COVER_T = 0.022;
/** Толщина одного листа: даже пустая стопка не схлопывается в плоскость. */
const SHEET_T = 0.004;
/** Просвет между верхней страницей и веером стопки — толщина листа бумаги. */
const PAPER_LIFT = 0.0015;
/**
 * Ремешок замка, кусочный обход тома (режим wrap в bendableMaterial): прямо от
 * корня до угла крышки → дуга R на углу → спуск DROP вдоль обреза → дуга R2 под
 * нижний угол → хвост ложится на изнанку задней крышки, где его ждёт ответная
 * планка. DROP выведен из посадки: ремень лежит на верхе передней крышки
 * (BLOCK_T + 2·PAPER_LIFT + COVER_T + полремня), хвост — под задней.
 *
 * Прямой участок КОРОТКИЙ: фурнитура сидит у самого обреза. С длинным корень
 * уезжал к середине крышки, и бляшки закрывали готическое тиснение.
 */
/**
 * Прямой участок начинается НА БЛЯШКЕ: корень ремня с заклёпкой лежит в её
 * прорези — они же сцеплены. С коротким участком корень висел в воздухе рядом
 * с бляшкой, и крепление не читалось.
 */
const STRAP_FLAT = 0.058;
const STRAP_R = 0.03;
const STRAP_DROP = 0.313;
const STRAP_R2 = 0.025;
/**
 * Прогиб спуска ВНУТРЬ, к бумаге: обрез вогнутый, и натянутый по прямой ремень
 * висел над ним с просветом — виден был воздух. Старая кожа обминается по
 * блоку; прогиб гаснет вместе с зажимом при расстёгивании.
 */
const STRAP_SAG = 0.016;
/** «Квадрат» — выступ крышки за обрез блока, у переплётчиков миллиметра три. */
const SQUARE = 0.028;
/** Такт раскрытия и такт листания, секунды. Книга тяжёлая: спешка её убивает. */
const OPEN_S = 2.6;
const TURN_S = 0.85;
const LEAVES = 6;
/** Замки отходят до того, как тронется крышка. */
const CLASP_END = 0.3;
/**
 * Рубчик (фальц) — жёлоб между корешком и крышкой, по нему крышка сгибается.
 * У переплётчиков его ширина равна толщине картона.
 */
const GROOVE = COVER_T;

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
  // ПОДЪЁМ до вертикали. Лист поднимают, он идёт против своего веса и к вертикали
  // почти останавливается. Сглаживание пятой степени даёт ноль и у скорости, и у
  // ускорения на старте — движение начинается незаметно.
  if (t <= VERT_T) {
    const u = t / VERT_T;
    return 0.5 * (u * u * u * (u * (u * 6 - 15) + 10));
  }
  // ПАДЕНИЕ. За вертикалью лист теряет опору и валится под своим весом: скорость
  // РАСТЁТ к касанию, а не гаснет. Это и отличает падение от «посадки», которой
  // была прежняя симметричная кривая.
  const f = (t - VERT_T) / (1 - VERT_T);
  if (f < DAMP_FROM) {
    return 0.5 + 0.5 * FALL_K * Math.pow(f, FALL_P);
  }
  // ГАШЕНИЕ на касании. Настоящая страница останавливается резко, но не мгновенно:
  // бумага упругая, край успевает прогнуться. Сшиваем по значению И по скорости,
  // чтобы в стыке не было излома, и гасим остаток косинусом.
  const y0 = 0.5 + 0.5 * FALL_K * Math.pow(DAMP_FROM, FALL_P);
  const v0 = 0.5 * FALL_K * FALL_P * Math.pow(DAMP_FROM, FALL_P - 1);
  const d = (f - DAMP_FROM) / (1 - DAMP_FROM);
  // Интеграл от косинусной четверти: скорость плавно уходит в ноль за отрезок d.
  const s = Math.sin((d * Math.PI) / 2);
  return Math.min(1, y0 + v0 * (1 - DAMP_FROM) * (2 / Math.PI) * s);
}
/** Доля хода до вертикали. Подъём короче падения: лист бросают, а не несут. */
const VERT_T = 0.42;
/** С какой доли ПАДЕНИЯ начинается гашение о стопку. */
const DAMP_FROM = 0.86;
/** Показатель разгона: выше единицы значит ускорение под своим весом. */
const FALL_P = 1.75;
/** Подгонка, чтобы конец падения без гашения приходил ровно в единицу. */
const FALL_K = 1.10216;

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
  /** Полувысота меша — нужна вееру и провису, они считаются от неё. */
  halfH = 0,
  /**
   * Куда загибать по глубине. Лист поднимается ОТ стопки (+1), а ремешок обязан
   * заворачиваться К книге, обнимая передний обрез (-1). С единым знаком ремешки
   * закручивались наружу, в пустоту, и висели в воздухе отдельными скобами.
   */
  dir: 1 | -1 = 1,
  /**
   * Режим РЕМЕШКА: прямо до угла крышки → дуга радиуса STRAP_R на углу → прямо
   * вниз вдоль обреза; uBend — доля зажима 0..1. Бумажная «дуга от корня» ремню
   * не годится: на 192° закрутки формула s·sin(a)/a складывает кончик назад за
   * корень, и хвост ремешка уходил ВНУТРЬ блока — с торца книги ремни просто
   * исчезали.
   */
  wrap = false,
): {
  material: MeshStandardMaterial;
  bend: IUniform<number>;
  /**
   * Подъём от пола жёлоба к стопке — тот же профиль, что у лежащих страниц
   * (pageDip). Лист обязан ВЫХОДИТЬ из ложбины и ложиться в такую же: пока он
   * был плоским, а страницы под ним с прогибом, он на входе и выходе нырял под
   * них.
   */
  dip: IUniform<number>;
  /**
   * Веер листа: базовая крутизна и перекос по высоте. Управляются снаружи —
   * лист подхватывают за точку тычка, и каждый переворот летит чуть по-своему.
   */
  fanBase: IUniform<number>;
  fanTilt: IUniform<number>;
  /** Тот же изгиб для карты теней — иначе тень рисуется от плоского листа. */
  depth: MeshDepthMaterial;
} {
  const bend: IUniform<number> = { value: 0 };
  const dip: IUniform<number> = { value: 0 };
  const fanBase: IUniform<number> = { value: 0.97 };
  const fanTilt: IUniform<number> = { value: 0.35 };
  // Крутизна та же, что у лежащей страницы и веера блока (DIP_K): при разной
  // лист и страница под ним расходятся формой, и в жёлобе открывается щель.
  const dipCode = `
    transformed.z += uDip * (1.0 - exp(-position.x * ${DIP_K.toFixed(1)}));`;
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
  // Переменные изгиба. У бумаги — прогрессивная дуга с веером, у ремешка —
  // кусочный обход угла крышки.
  const bendVars = wrap
    ? `
      float s = position.x;
      float q = 1.5708 * clamp(uBend, 0.0, 1.0);
      float r = max(s - ${STRAP_FLAT.toFixed(4)}, 0.0);
      float a1 = min(r / ${STRAP_R.toFixed(4)}, q);
      float r1 = max(r - a1 * ${STRAP_R.toFixed(4)}, 0.0);
      float d = min(r1, ${STRAP_DROP.toFixed(4)});
      float r2 = max(r1 - d, 0.0);
      float a2 = min(r2 / ${STRAP_R2.toFixed(4)}, q);
      float r3 = max(r2 - a2 * ${STRAP_R2.toFixed(4)}, 0.0);
      float a = a1 + a2;
      float dir = ${dir.toFixed(1)};`
    : `
      float wid = ${width.toFixed(4)};
      float s = position.x;                 // расстояние от петли
      float u = clamp(s / wid, 0.0, 1.0);
      // ВЕЕР. Линия сгиба у настоящего листа НЕ параллельна корешку: у одного
      // края он зажат туже, к другому завёрт раскрывается. Форма ближе к конусу
      // с вершиной у корешка, чем к цилиндру. Без веера лист читается свёрнутым
      // жестяным листом. База и перекос конуса — юниформы: перекос ставится от
      // точки подхвата, база дрожит от переворота к перевороту.
      float v = ${halfH > 0 ? `clamp(position.y / ${halfH.toFixed(4)}, -1.0, 1.0)` : `0.0`};
      float fan = uFanBase - uFanTilt * v;
      float a = uBend * fan * pow(u, 1.7);
      // Радиус НЕ вычисляем. Точка на дуге — это s·sin(a)/a и s·(1−cos a)/a, и обе
      // дроби при a→0 стремятся к конечному пределу (к s и к 0). Прежний код брал
      // R = s/a, а при малом угле подменял его на 1e6 — и тогда x = 1e6·sin(a)
      // улетал на пятьсот единиц вместо того, чтобы остаться равным s. Столбец у
      // петли выстреливал за горизонт белыми полосами: 260 мс из каждых 850 мс
      // переворота и ещё 60 мс на ремешках при открывании. Ряды по высоте порог
      // проходили вразнобой из-за веера — оттого «зубцы», а не одна плита.
      float sa = a > 1.0e-4 ? sin(a) / a : 1.0 - a * a / 6.0;
      float ca = a > 1.0e-4 ? (1.0 - cos(a)) / a : a * 0.5;
      float dir = ${dir.toFixed(1)};`;
  // Смещение вершин. Бумаге — дуга и ПРОВИС свободного края (у краёв по высоте
  // сильнее, чем в середине; считается после изгиба, поэтому с ним не спорит).
  // У ремешка сечение ПОВОРАЧИВАЕТСЯ вместе с ходом: толщина коробки (z вершины)
  // раскладывается по нормали пути h·(−dir·sin a, cos a). Без этого на спуске
  // вдоль обреза толщина оставалась осью z — вдоль хода — и ремень с торца
  // истончался в ленту.
  const bendPos = wrap
    ? `transformed.x = min(s, ${STRAP_FLAT.toFixed(4)}) + ${STRAP_R.toFixed(4)} * sin(a1) + d * cos(a1)
        + ${STRAP_R2.toFixed(4)} * (sin(a) - sin(a1)) + r3 * cos(a) - dir * position.z * sin(a)
        - ${STRAP_SAG.toFixed(4)} * sin(3.14159 * clamp(d / ${STRAP_DROP.toFixed(4)}, 0.0, 1.0)) * clamp(uBend, 0.0, 1.0);
      transformed.z = position.z * cos(a) + dir * (${STRAP_R.toFixed(4)} * (1.0 - cos(a1)) + d * sin(a1)
        + ${STRAP_R2.toFixed(4)} * (cos(a1) - cos(a)) + r3 * sin(a));`
    : `transformed.x = s * sa;
      transformed.z += dir * s * ca;
      transformed.z -= dir * uBend * 0.045 * pow(u, 2.2) * (0.3 + 0.7 * abs(v));`;
  const bendCode = (target: string) => `
    if (uBend > 0.001) {${bendVars}
      ${target}
    }`;
  // Ширина, полувысота и знак ВШИТЫ в исходник шейдера, а ключ кэша программ
  // three собирает только из параметров материала. Два одинаково настроенных
  // материала с разной вшитой геометрией получили бы одну программу — так уже
  // случилось со страницами (см. pageDip).
  const key = `bend${width}|${halfH}|${dir}|${cut ? 1 : 0}|${wrap ? "w" : "p"}`;
  material.customProgramCacheKey = () => key;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = bend;
    shader.uniforms.uDip = dip;
    shader.uniforms.uFanBase = fanBase;
    shader.uniforms.uFanTilt = fanTilt;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uBend;\nuniform float uDip;\nuniform float uFanBase;\nuniform float uFanTilt;",
      )
      .replace(
        "#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>" +
          bendCode("objectNormal = normalize(vec3(-sin(a) * dir, 0.0, cos(a)));"),
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>" +
          bendCode(bendPos) + dipCode,
      );
  };
  // ── Тень.
  //
  // Карта глубины рисуется ОТДЕЛЬНЫМ материалом, который про наш изгиб ничего не
  // знает. Поэтому поднятый лист отбрасывал тень плоского прямоугольника — она
  // уходила мимо почти на ширину страницы и ложилась на соседнюю. Собираем такой
  // же изгиб для глубинного материала и вешаем его на меш через customDepthMaterial.
  const depth = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking,
    map,
    alphaTest: cut ? 0.5 : 0,
  });
  depth.customProgramCacheKey = () => key + "|depth";
  depth.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = bend;
    shader.uniforms.uDip = dip;
    shader.uniforms.uFanBase = fanBase;
    shader.uniforms.uFanTilt = fanTilt;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uBend;\nuniform float uDip;\nuniform float uFanBase;\nuniform float uFanTilt;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>" +
          bendCode(bendPos) + dipCode,
      );
  };

  return { material, bend, dip, fanBase, fanTilt, depth };
}

/**
 * Кэш выведенных карт. Прогревается из Bestiary.warm() ДО клика: четыре
 * deriveMaps стоят ~150–200 мс на главном потоке, и без прогрева эта пауза
 * попадала прямо в щелчок открытия книги.
 */
const reliefCache = new Map<TexImageSource, ReturnType<typeof deriveMaps>>();
function derivedCached(src: TexImageSource, w: number, s: number): ReturnType<typeof deriveMaps> {
  let d = reliefCache.get(src);
  if (d === undefined) {
    d = deriveMaps(src, w, s);
    reliefCache.set(src, d);
  }
  return d;
}
export function prewarmRelief(
  tex: Pick<BookTextures, "coverFront" | "spine" | "plate" | "catchPlate">,
): void {
  derivedCached(tex.coverFront, 768, 2.6);
  derivedCached(tex.spine, 512, 2.4);
  derivedCached(tex.plate, 420, 2.2);
  derivedCached(tex.catchPlate, 420, 2.2);
}

export function createBook(
  canvas: HTMLCanvasElement,
  tex: BookTextures,
  opts?: {
    /** Ближняя рамка для ПЛИТКИ: закрытый том крупнее в кадре. */
    closeUp?: boolean;
  },
): BookScene | null {
  const closeUp = !!opts?.closeUp;
  // Узкому экрану — половинные сетки: displacement-геометрии тяжёлые, а на
  // телефоне их разрешение всё равно не читается.
  const lite = typeof window !== "undefined" && window.innerWidth < 720;
  const seg = (n: number): number => (lite ? Math.ceil(n / 2) : n);
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
  renderer.toneMappingExposure = 1.1;
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
  // Широкое перо: жёсткая кромка тени рисовала на подиуме резкие прямоугольники.
  sun.shadow.radius = 5;
  const sc = sun.shadow.camera;
  sc.left = -3.2;
  sc.right = 3.2;
  sc.top = 3.2;
  sc.bottom = -3.2;
  sc.near = 0.2;
  sc.far = 8;
  scene.add(sun);
  scene.add(new AmbientLight(0xb9b4a6, 0.17));
  // Контровик: холодный луч сзади-справа отсекает силуэт от черноты и даёт
  // вторую искру на золоте. Без него тёмная кожа тонула в фоне целиком.
  const rim = new DirectionalLight(0xbcd2ea, 0.5);
  rim.position.set(2.6, 0.7, -2.0);
  scene.add(rim);

  // ── Подиум. Книга в пустоте не имеет веса: тёплое пятно света позади и
  // НАСТОЯЩАЯ тень тома на нём дают опору. Пятно — градиент кодом, тень ловит
  // отдельная плоскость с ShadowMaterial чуть ближе пятна.
  const glowCv = document.createElement("canvas");
  glowCv.width = 256;
  glowCv.height = 256;
  const gg = glowCv.getContext("2d");
  if (gg) {
    const rad = gg.createRadialGradient(128, 116, 10, 128, 128, 126);
    rad.addColorStop(0, "rgba(66,59,47,0.5)");
    rad.addColorStop(0.55, "rgba(38,35,29,0.26)");
    rad.addColorStop(1, "rgba(0,0,0,0)");
    gg.fillStyle = rad;
    gg.fillRect(0, 0, 256, 256);
  }
  const glowTex = new Texture(glowCv);
  glowTex.colorSpace = SRGBColorSpace;
  glowTex.needsUpdate = true;
  const glow = new Mesh(
    new PlaneGeometry(7, 7),
    new MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false }),
  );
  glow.position.set(0.2, -0.3, -0.06);
  scene.add(glow);
  // Плотность тени на подиуме живёт в кадре: закрытому тому она даёт вес, а при
  // раскрытии квадратные тени крышки и блока ездили по заднику «квадратиками».
  const shadowMat = new ShadowMaterial({ opacity: 0.42 });
  const shadowCatch = new Mesh(new PlaneGeometry(7, 7), shadowMat);
  shadowCatch.position.set(0.2, -0.3, -0.045);
  shadowCatch.receiveShadow = true;
  scene.add(shadowCatch);

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
  const coverRelief = derivedCached(tex.coverFront, 768, 2.6);

  const paper = (map: Texture): MeshStandardMaterial =>
    new MeshStandardMaterial({ map, roughness: 0.95, metalness: 0 });
  // Кожа торцов крышек — с ПРОТИРАМИ: рёбра коробок светлеют к краям каждой
  // грани, пятнами, как обношенная о полку кожа. Ровный цвет читался пластиком.
  const leatherTex = (() => {
    const S = 128;
    const cv = document.createElement("canvas");
    cv.width = S;
    cv.height = S;
    const g = cv.getContext("2d");
    if (!g) return null;
    const img = g.createImageData(S, S);
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const ex = Math.min(x, S - 1 - x) / S;
        const ey = Math.min(y, S - 1 - y) / S;
        const edge = 1 - Math.min(1, Math.min(ex, ey) / 0.16);
        const patch = 0.6 + 0.4 * Math.sin(x * 0.23 + 1.3) * Math.sin(y * 0.31 + 2.1);
        const wear = Math.pow(Math.max(0, edge), 1.6) * patch;
        const k = (y * S + x) * 4;
        img.data[k] = Math.round(20 + 41 * wear);
        img.data[k + 1] = Math.round(19 + 34 * wear);
        img.data[k + 2] = Math.round(15 + 24 * wear);
        img.data[k + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const t = new Texture(cv);
    t.colorSpace = SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  })();
  const leather = new MeshStandardMaterial({
    map: leatherTex ?? undefined,
    color: leatherTex ? 0xffffff : 0x14130f,
    roughness: 0.78,
    metalness: 0.05,
  });
  // Обрез блока: текстура кромок (линии листов уложены по её ВЫСОТЕ). Развёртка
  // пишется прямо в геометрии веера: v — доля толщины стопки, u — путь вдоль
  // грани. Прежние повороты и repeat на самой текстуре складывались друг с
  // другом, и кромки растягивались в смазанный парус без единой линии.
  //
  // Осветление умеренное: старый множитель (3.14, 3.70, 4.72) выбивал бурую
  // бумагу в сине-белый пластик и съедал весь рисунок кромок.
  for (const t of [T.foredge, T.nForedge]) {
    t.wrapS = RepeatWrapping;
    t.wrapT = ClampToEdgeWrapping;
    t.anisotropy = aniso;
    t.needsUpdate = true;
  }
  const edgeMat = new MeshStandardMaterial({
    map: T.foredge,
    normalMap: T.nForedge,
    normalScale: new Vector2(0.95, 0.95),
    color: new Color(1.6, 1.56, 1.44),
    roughness: 0.92,
    metalness: 0,
  });
  // Переплёт: сторона, где блок сшит. Тёмная, матовая, без кромок.
  const binding = new MeshStandardMaterial({ color: 0x24211b, roughness: 0.95, metalness: 0 });
  // Верх блока под страницей — ТЕКСТУРА СЛЕДУЮЩЕЙ СТРАНИЦЫ, чуть притемнённая:
  // под настоящим листом лежит такой же лист, и всё, что выглядывает в прорехи
  // рваного края, совпадает по тону по построению. Плоская светлая заливка
  // читалась чужим белым ободом вокруг страниц.
  const underPaperR = new MeshStandardMaterial({
    map: T.right,
    roughness: 0.96,
    metalness: 0,
    color: new Color(0.9, 0.89, 0.87),
  });
  const underPaperL = new MeshStandardMaterial({
    map: T.left,
    roughness: 0.96,
    metalness: 0,
    color: new Color(0.9, 0.89, 0.87),
  });

  const book = new Group();
  scene.add(book);

  // Ширина крышки считается от рубчика: картон начинается ЗА жёлобом, поэтому
  // из общей ширины вычитается его ширина. Тогда передний кант выходит ровно
  // SQUARE и совпадает с верхним и нижним.
  const coverW = PAGE_W + SQUARE - GROOVE;
  const coverH = PAGE_H + SQUARE * 2;

  // ── задняя крышка: коробка, а не плоскость. Толщина есть по построению.
  //
  // Снаружи — СЛЕПОЕ тиснение: тот же штамп, что на лицевой, но без золота.
  // Гладкая кожа с тыла выдавала заготовку.
  //
  // Ориентация выяснена опытом: задняя грань коробки показывает карту БЕЗ
  // зеркала (поворот на 180° при первой попытке ставил заголовок вверх ногами).
  // Оригинальные карты дают прямой макет того же панельного штампа. Вдавленность
  // слепого тиснения — инверсия R и G у нормалей разом (наклоны разворачиваются,
  // выступ читается ямой) плюс отрицательный displacement: штамп давит в кожу.
  const recessNormal = (t: Texture): Texture => {
    const img = t.image as HTMLCanvasElement;
    const cv = document.createElement("canvas");
    cv.width = img.width;
    cv.height = img.height;
    const g2 = cv.getContext("2d");
    if (!g2) return t;
    g2.drawImage(img, 0, 0);
    const d = g2.getImageData(0, 0, cv.width, cv.height);
    for (let i = 0; i < d.data.length; i += 4) {
      d.data[i] = 255 - d.data[i];
      d.data[i + 1] = 255 - d.data[i + 1];
    }
    g2.putImageData(d, 0, 0);
    const nt = new Texture(cv);
    nt.needsUpdate = true;
    return nt;
  };
  const backTooling = coverRelief
    ? new MeshStandardMaterial({
        color: 0x1a1712,
        normalMap: recessNormal(coverRelief.normal),
        normalScale: new Vector2(1.25, 1.25),
        displacementMap: coverRelief.height,
        displacementScale: -0.004,
        displacementBias: 0.001,
        roughness: 0.74,
        metalness: 0.04,
      })
    : leather;
  const backCover = new Mesh(new BoxGeometry(coverW, coverH, COVER_T, seg(160), seg(200), 1), [
    leather,
    leather,
    leather,
    leather,
    paper(T.end),
    backTooling,
  ]);
  backCover.position.set(GROOVE + coverW / 2, 0, -COVER_T / 2);
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
  /**
   * Половина блока — ВЕЕР листов, а не коробка.
   *
   * Столбец бумаги на расстоянии s от жёлоба имеет высоту h(s) = T·(1−exp(−K·s)):
   * ноль у сшивки, полная толщина к обрезу. Спад тот же, что у страницы (pageDip)
   * и у ложбины листа — одна константа DIP_K, поэтому страница, лист и стопка
   * нигде не расходятся формой. Обе половины приходят в ноль В ОДНОЙ точке жёлоба,
   * и сквозной щели между ними не остаётся ни при какой закладке.
   *
   * Веер существует только у РАСКРЫТОЙ книги: доля carve гасит спад до плоского
   * кирпича при закрывании — у закрытого тома жёлоба нет, и прежняя вечная
   * канава светила белым клином из-под крышки у корешка.
   *
   * Пережимается ВЕСЬ столбец: каждая вершина хранит свои доли s01/z01 и встаёт
   * на h(s)·z01. Прежний код смещал один верхний ряд коробки — боковые грани
   * заворачивались под него валиком, а торец у жёлоба оставался стеной.
   */
  const buildHalfBlock = (gutterAt: -1 | 1): { mesh: Mesh; update: (T: number, carve: number) => void } => {
    const g = new BoxGeometry(PAGE_W, PAGE_H, BLOCK_T, seg(56), 1, seg(14));
    g.translate(0, 0, BLOCK_T / 2); // низ на нуле: толщина растёт вверх
    const p = g.attributes.position;
    const uv = g.attributes.uv;
    const idx = g.index;
    const n = p.count;
    const s01 = new Float32Array(n); // доля пути от жёлоба к обрезу
    const z01 = new Float32Array(n); // доля толщины, 0 низ — 1 верх
    for (let i = 0; i < n; i++) {
      const x = p.getX(i);
      s01[i] = gutterAt < 0 ? x / PAGE_W + 0.5 : 0.5 - x / PAGE_W;
      z01[i] = p.getZ(i) / BLOCK_T;
    }
    // Вогнутый передний обрез: у круглёного корешка та же бумага с другой
    // стороны образует ложбину. Дуга по толщине, максимум на середине стопки.
    // Смещение по x статично — пережим столбцов меняет только z.
    for (let i = 0; i < n; i++) {
      if (s01[i] < 1 - 1e-4) continue;
      p.setX(i, p.getX(i) + gutterAt * 0.019 * Math.sin(z01[i] * Math.PI));
    }
    // Развёртка кромок: v — доля толщины (линии листов в текстуре лежат по её
    // высоте), u — путь вдоль грани с повтором под пропорцию куска ~2.5:1.
    // Верх и низ блока (грани 4 и 5) — бумага без текстуры, их не трогаем.
    if (idx) {
      for (const grp of g.groups) {
        const face = grp.materialIndex ?? 0;
        const seen = new Set<number>();
        for (let k = grp.start; k < grp.start + grp.count; k++) {
          const vi = idx.getX(k);
          if (seen.has(vi)) continue;
          seen.add(vi);
          if (face > 3) {
            // Верх и низ блока несут текстуру страницы, но семплируют её
            // ВНУТРЕННЮЮ область: по краям у страницы рваная альфа, и на
            // сплошной грани прозрачные текселы рисовались белой гребёнкой
            // вдоль обрезов.
            uv.setXY(vi, 0.06 + uv.getX(vi) * 0.88, 0.06 + uv.getY(vi) * 0.88);
            continue;
          }
          // Повтор 1:1 — растяжение линий вдоль грани незаметно (они и так
          // тянутся вдоль), а видимый шов от тайлинга заметен сразу.
          const along = face < 2 ? p.getY(vi) / PAGE_H + 0.5 : s01[vi];
          uv.setXY(vi, along, z01[vi]);
        }
      }
      uv.needsUpdate = true;
    }
    const mats = [
      gutterAt < 0 ? edgeMat : binding, // +x
      gutterAt < 0 ? binding : edgeMat,       // -x
      edgeMat,                                // +y: верхний обрез
      edgeMat,                                // -y: нижний обрез
      gutterAt < 0 ? underPaperR : underPaperL, // +z: под верхней страницей
      gutterAt < 0 ? underPaperR : underPaperL, // -z: низ
    ];
    const mesh = new Mesh(g, mats);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    let lastT = -1;
    let lastCarve = -1;
    const update = (T: number, carve: number): void => {
      if (Math.abs(T - lastT) < 1e-4 && Math.abs(carve - lastCarve) < 1e-4) return;
      lastT = T;
      lastCarve = carve;
      for (let i = 0; i < n; i++) {
        const h = T * (1 - carve + carve * (1 - Math.exp(-DIP_K * s01[i] * PAGE_W)));
        p.setZ(i, h * z01[i]);
      }
      p.needsUpdate = true;
      g.computeVertexNormals();
    };
    update(BLOCK_T, 0);
    return { mesh, update };
  };

  const rightHalf = buildHalfBlock(-1);
  const block = rightHalf.mesh;
  block.position.set(PAGE_W / 2, 0, 0);
  book.add(block);

  // ── левая половина блока: появляется, когда листы переходят налево.
  // Левая стопка живёт в КРЫЛЕ, повёрнутом вместе с крышкой: листы лежат на
  // форзаце под её текущим углом и едут с ней до самого стола. Пока стопка
  // сидела в осях книги, она ложилась на пол ПОД ещё опускающейся крышкой и
  // белым торчала из-за её краёв — листа за корочкой быть не может никогда.
  const leftWing = new Group();
  book.add(leftWing);
  const leftHalf = buildHalfBlock(1);
  const leftBlock = leftHalf.mesh;
  leftBlock.position.set(-PAGE_W / 2, 0, 0);
  leftBlock.visible = false;
  leftWing.add(leftBlock);

  // Верхние страницы обеих стопок — ГНУЩИЕСЯ, а не плоские: лист ныряет в жёлоб
  // тем же спадом DIP_K, каким выточен веер, и лежит на нём с просветом в лист
  // бумаги. Сетка по X обязательна — у плоскости из одного квада гнуть нечего.
  // Геометрия ЦЕНТРИРОВАННАЯ, расстояние от петли считает шейдер по знаку side:
  // зеркалить одну страницу поворотом на 180° нельзя, к зрителю встаёт изнанка.
  // Сетка и по высоте: рябь двумерная, полосе из одного ряда гнуться нечем.
  const rightGeo = new PlaneGeometry(PAGE_W, PAGE_H, seg(48), seg(20));
  const leftGeo = new PlaneGeometry(PAGE_W, PAGE_H, seg(48), seg(20));
  const rightSheet = pageMaterial(T.right, T.nPage, 1);
  const leftSheet = pageMaterial(T.left, T.nPage, -1);
  const rightPage = new Mesh(rightGeo, rightSheet.material);
  rightPage.receiveShadow = true;
  book.add(rightPage);
  const leftPage = new Mesh(leftGeo, leftSheet.material);
  leftPage.receiveShadow = true;
  leftPage.visible = false;
  leftWing.add(leftPage);

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
  const SPINE_SEG = 28;
  const spineGeo = new PlaneGeometry(1, coverH, SPINE_SEG, 1);
  const spinePos = spineGeo.attributes.position;
  const spineUv = spineGeo.attributes.uv;
  for (let i = 0; i < spinePos.count; i++) {
    // u = 0 у задней крышки, 1 у передней. Угол идёт от -90° до +90°, поэтому
    // середина дуги приходится ровно на самую левую точку корешка.
    const u = spineUv.getX(i);
    const a = (u - 0.5) * Math.PI;
    // Концы дуги ПОДВОРАЧИВАЮТСЯ под крышки за рубчик: кожа корешка у настоящего
    // тома заходит на картон. Дуга, кончавшаяся на x = 0, оставляла у жёлоба
    // светлую щель — в неё был виден торец блока во всю высоту книги.
    const tuck = (GROOVE + 0.006) * Math.sin(a) * Math.sin(a);
    spinePos.setX(i, -spineRx * Math.cos(a) + tuck);
    spinePos.setZ(i, spineRz * Math.sin(a));
  }
  spineGeo.computeVertexNormals();

  // Подкладка: та же дуга чуть внутрь, чтобы с торца не просвечивало насквозь.
  const spine = new Mesh(
    spineGeo.clone().scale(0.97, 1, 0.97),
    new MeshStandardMaterial({ color: 0x14120f, roughness: 0.9, metalness: 0.02, side: BackSide }),
  );
  // Лицо с тиснением смотрит НАРУЖУ, обычной стороной: зеркалить нечего.
  // Рельеф и золото корешка — из ЕГО СОБСТВЕННОЙ текстуры: раньше сюда была
  // прикручена карта нормалей обложки, и свет ложился по чужому рисунку.
  const spineRelief = derivedCached(tex.spine, 512, 2.4);
  const spineFace = new Mesh(
    spineGeo,
    new MeshStandardMaterial({
      map: T.spine,
      normalMap: spineRelief ? spineRelief.normal : T.nCover,
      normalScale: new Vector2(0.8, 0.8),
      metalnessMap: spineRelief ? spineRelief.metal : undefined,
      roughnessMap: spineRelief ? spineRelief.rough : undefined,
      roughness: spineRelief ? 1 : 0.72,
      metalness: spineRelief ? 1 : 0.18,
    }),
  );
  spineFace.castShadow = true;
  spine.receiveShadow = true;
  book.add(spine);
  book.add(spineFace);

  // Каптал — плетёная лента на торце корешка сверху и снизу. Мелочь, но именно
  // она выдаёт ручной переплёт: без неё блок просто упирается в корешок.
  //
  // Это НЕ планка, а колпачок-дуга: лента идёт по торцу горба, следуя его
  // эллипсу, с валиком посередине. Плоская планка парила над горбом и на косых
  // ракурсах торчала из силуэта с чёрной щелью под ней.
  T.headband.wrapS = RepeatWrapping;
  T.headband.needsUpdate = true;
  const headbandMat = new MeshStandardMaterial({
    map: T.headband,
    roughness: 0.85,
    metalness: 0,
    alphaTest: 0.4,
    side: DoubleSide,
  });
  headbandMat.alphaToCoverage = true;
  const hbGeo = new PlaneGeometry(1, 1, SPINE_SEG, 4);
  {
    const hp = hbGeo.attributes.position;
    const huv = hbGeo.attributes.uv;
    for (let i = 0; i < hp.count; i++) {
      const u = huv.getX(i);
      const w = huv.getY(i); // 0 — внутренний край (у блока), 1 — внешний
      const a = (u - 0.5) * Math.PI;
      const k = 0.8 + 0.23 * w;
      const tuck = (GROOVE + 0.006) * Math.sin(a) * Math.sin(a) * k;
      hp.setX(i, -spineRx * k * Math.cos(a) + tuck);
      hp.setZ(i, spineRz * k * Math.sin(a));
      hp.setY(i, Math.sin(w * Math.PI) * 0.008);
      huv.setXY(i, u * 3, w); // плетение повторяется вдоль дуги, а не тянется
    }
    hbGeo.computeVertexNormals();
  }
  // Заглушка ПАЗУХИ. Между дугой горба и плоской корешковой гранью блока —
  // полость, и сверху в неё было видно черноту насквозь. У настоящего тома её
  // закрывает загиб кожи под капталом: тёмный полудиск на всю пазуху.
  const capGeo = new PlaneGeometry(1, 1, SPINE_SEG, 2);
  {
    const cpos = capGeo.attributes.position;
    const cuv = capGeo.attributes.uv;
    for (let i = 0; i < cpos.count; i++) {
      const u = cuv.getX(i);
      const w = cuv.getY(i); // 0 — центр пазухи, 1 — дуга
      const a = (u - 0.5) * Math.PI;
      const k = 0.03 + 0.97 * w;
      const tuck = (GROOVE + 0.006) * Math.sin(a) * Math.sin(a) * k;
      cpos.setX(i, -spineRx * k * Math.cos(a) + tuck);
      cpos.setZ(i, spineRz * k * Math.sin(a));
      cpos.setY(i, 0);
    }
    capGeo.computeVertexNormals();
  }
  const capMat = new MeshStandardMaterial({
    color: 0x171411,
    roughness: 0.92,
    metalness: 0,
    side: DoubleSide,
  });
  const headbands: Mesh[] = [];
  for (const sy of [1, -1]) {
    const hb = new Mesh(hbGeo, headbandMat);
    hb.scale.y = sy; // нижний колпачок — зеркало верхнего, валиком вниз
    const cap = new Mesh(capGeo, capMat);
    cap.position.y = -0.0012; // чуть ниже плетёнки, в тень
    hb.add(cap);
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
  // не умеет в принципе. Сетка была молча ПОТЕРЯНА в одной из правок — коробка
  // осталась из четырёх вершин на грань, и displacement обложки не делал ничего.
  const frontCover = new Mesh(new BoxGeometry(coverW, coverH, COVER_T, seg(160), seg(200), 1), [
    leather,
    leather,
    leather,
    leather,
    new MeshStandardMaterial({
      map: T.cover,
      normalMap: coverRelief ? coverRelief.normal : T.nCover,
      normalScale: new Vector2(1.0, 1.0),
      displacementMap: coverRelief ? coverRelief.height : undefined,
      // Высота тиснения на настоящей книге — полмиллиметра при странице 30 см,
      // то есть примерно 0.0017 в наших единицах. Берём вчетверо: на экране
      // полмиллиметра не читается, а вчетверо — уже да, и ещё не карикатура.
      displacementScale: coverRelief ? 0.0075 : 0,
      displacementBias: coverRelief ? -0.002 : 0,
      // Оба параметра в единице: их значения целиком живут в выведенных картах —
      // кожа остаётся матовым диэлектриком, а тиснение становится НАСТОЯЩИМ
      // металлом и ловит окружение. С одним общим числом на всю крышку золото
      // было краской: блестело ровно так же, как кожа под ним.
      metalnessMap: coverRelief ? coverRelief.metal : undefined,
      roughnessMap: coverRelief ? coverRelief.rough : undefined,
      roughness: coverRelief ? 1 : 0.62,
      metalness: coverRelief ? 1 : 0.22,
    }),
    paper(T.end),
  ]);
  frontCover.position.set(GROOVE + coverW / 2, 0, COVER_T / 2);
  frontCover.castShadow = true;
  coverHinge.add(frontCover);

  // Бляшка приклёпана к крышке и не двигается; качается только РЕМЕНЬ — поэтому
  // у каждого замка свой шарнир (pivot) поверх группы с бляшкой.
  const strapPivots: Group[] = [];
  const straps: Mesh[] = [];
  const strapBends: IUniform<number>[] = [];
  const plateW = 0.2;
  const plateT = 0.014;
  // Рельеф бляшки выводится из её же текстуры: карта нормалей давала свет, но
  // не силуэт — displacement выдавливает литьё по-настоящему, объёмом.
  const plateRelief = derivedCached(tex.plate, 420, 2.2);
  for (const sy of [0.27, -0.27]) {
    const g = new Group();
    // Корень стоит так, чтобы прямой участок STRAP_FLAT кончался ровно на углу
    // крышки: спуск ремня тогда идёт по обрезу, а не внутри блока и не в воздухе.
    // По высоте фурнитура прижата к середине: на 0.72 нижняя бляшка налезала
    // на заголовок тиснения.
    g.position.set(GROOVE + coverW - STRAP_FLAT - STRAP_R + 0.004, PAGE_H * sy * 0.6, COVER_T);
    coverHinge.add(g);

    // Бляшка — тонкое ТЕЛО, а не плоскость: у плоскости нет толщины, и с торца
    // замок исчезал в линию. Литая латунь: грани из того же материала, лицо с
    // картой нормалей.
    const brass = new MeshStandardMaterial({
      map: T.plate,
      normalMap: T.nPlate,
      normalScale: new Vector2(1.2, 1.2),
      displacementMap: plateRelief ? plateRelief.height : undefined,
      displacementScale: plateRelief ? 0.013 : 0,
      displacementBias: plateRelief ? -0.0025 : 0,
      roughness: 0.42,
      metalness: 0.65,
      transparent: true,
      alphaTest: 0.5,
    });
    // Бляшка — СТОПКА вырезанных по альфе лиц, а не коробка.
    //
    // Коробка давала толщину, но её четыре торца — сплошные прямоугольники по
    // границе, а лицо вырезано по силуэту фигурной накладки: всё, что торчало за
    // силуэт, читалось золотой рамкой вокруг замка. Одно лицо и одна изнанка
    // решали это, но с ребра литьё превращалось в линию в пиксель. Четыре слоя
    // с шагом в треть толщины дают с торца честное тело, а лишнего не показывают.
    brass.transparent = false;
    brass.alphaToCoverage = true;
    const brassBack = brass.clone();
    brassBack.color = new Color(0x6f5f38);
    brassBack.metalness = 0.8;
    brassBack.normalMap = null;
    // Подложки плоские: выдавленные тем же рельефом, они бы спорили с лицом.
    brassBack.displacementMap = null;
    brassBack.displacementScale = 0;
    // Сетка нужна displacement'у: у грани без вершин выдавливать нечего.
    const plateGeo = new PlaneGeometry(plateW, plateW * (386 / 420), seg(72), seg(66));
    const plate = new Group();
    // Бляшка стоит на прежнем месте (центр ~0.89): корень группы уехал влево
    // на бляшку, и относительный сдвиг пересчитан, чтобы литьё не поехало.
    plate.position.set(-0.054, 0, 0);
    // Слои — ПИРАМИДОЙ: основание у кожи самое большое, наружный меньше. При
    // обратном порядке внешний слой нависал грибом, и с ребра под его краем
    // был виден воздух. Ступеньки внутрь читаются фаской литья.
    for (const [z, mat, k] of [
      [plateT, brass, 0.94],
      [plateT * 0.67, brassBack, 0.97],
      [plateT * 0.33, brassBack, 0.99],
      [0, brassBack, 1],
    ] as const) {
      const face = new Mesh(plateGeo, mat);
      face.position.z = z;
      face.scale.setScalar(k);
      face.castShadow = true;
      plate.add(face);
    }
    g.add(plate);

    // Длина ремешка выверена под обход: прямой участок, угол крышки, спуск по
    // обрезу, нижний угол и хвост по заднику ДО крюка ответной планки.
    const strapW = 0.47;
    // Высота НЕ привязана к длине: ремень укоротился к обрезу, а ширина ремня —
    // свойство кожи, не длины. Текстура тянется на ~12%, на коже не читается.
    const strapH = 0.082;
    // Ремешок — КОРОБКА в толщину сыромятного ремня, с сеткой по длине для
    // шейдера изгиба и по ширине для валика.
    const sgeo = new BoxGeometry(strapW, strapH, 0.019, 24, 4, 1);
    sgeo.translate(strapW / 2, 0, 0);
    // Валик по верху: кожаный ремень выпуклый в сечении, плоская лента читалась
    // бумажной полосой. К кромкам валик сходит в ноль — шва с торцами нет.
    {
      const spos = sgeo.attributes.position;
      for (let i = 0; i < spos.count; i++) {
        if (spos.getZ(i) < 0.0094) continue;
        const q = Math.cos((spos.getY(i) / (strapH / 2)) * (Math.PI / 2));
        spos.setZ(i, 0.0095 + 0.005 * q);
      }
      sgeo.computeVertexNormals();
    }
    // Полувысота НУЛЕВАЯ намеренно: веер — свойство бумажного листа. Последний
    // аргумент — режим wrap: ремень обходит угол крышки, а не гнётся дугой от
    // корня (см. bendableMaterial).
    const { material, bend, depth: depthOfStrap } =
      bendableMaterial(T.strap, strapW, true, 0, -1, true);
    // Рельеф кожи на ремешке: до этого он был единственной поверхностью совсем
    // без карты нормалей — плоская краска рядом с рельефной крышкой.
    material.normalMap = T.nStrap;
    material.normalScale = new Vector2(1.15, 1.15);
    material.needsUpdate = true;
    // Торцам — своя тёмная кожа. С одним материалом на всю коробку текстура
    // ремешка натягивалась и на боковые грани, вытягиваясь там в яркую нить:
    // вокруг замка шла проволочная обводка. Изгиб общий, поэтому торцевой
    // материал берёт ТОТ ЖЕ параметр гиба — иначе грани поехали бы отдельно.
    const edgeSkin = bendableMaterial(T.strap, strapW, false, 0, -1, true);
    // Срез кожи СВЕТЛЫЙ: сырая сердцевина ремня всегда бледнее лицевой стороны.
    // Чёрные торцы сливались с фоном, и с ребра ремень читался плоской лентой.
    edgeSkin.material.color.setHex(0x54432f);
    edgeSkin.material.map = null;
    edgeSkin.material.roughness = 1;
    edgeSkin.material.needsUpdate = true;
    const strap = new Mesh(sgeo, [
      edgeSkin.material,
      edgeSkin.material,
      edgeSkin.material,
      edgeSkin.material,
      material,
      material,
    ]);
    strap.customDepthMaterial = depthOfStrap;
    strap.castShadow = true;
    // Ремень ПРИПОДНЯТ над литьём бляшки: корень едет ПО её рельефу, а не сквозь
    // него; дуга на углу крышки съедает высоту при спуске.
    strap.position.z = 0.0175;
    const pivot = new Group();
    pivot.add(strap);
    g.add(pivot);
    strapPivots.push(pivot);
    straps.push(strap);
    strapBends.push(bend);
    strapBends.push(edgeSkin.bend);
  }

  // Ответная часть замка на заднике — та же фигурная бляшка, что спереди, с
  // выдавленным литьём: хвост ремня приходит на её край. Узкая планка с крюком
  // (catch.webp) убрана — вместе с бляшкой и хвостом она сливалась в кашу.
  const catchBrass = new MeshStandardMaterial({
    map: T.plate,
    normalMap: T.nPlate,
    normalScale: new Vector2(1.2, 1.2),
    displacementMap: plateRelief ? plateRelief.height : undefined,
    displacementScale: plateRelief ? 0.013 : 0,
    displacementBias: plateRelief ? -0.0025 : 0,
    roughness: 0.42,
    metalness: 0.65,
    alphaTest: 0.5,
  });
  catchBrass.alphaToCoverage = true;
  const catchBrassDark = catchBrass.clone();
  catchBrassDark.color = new Color(0x6f5f38);
  catchBrassDark.normalMap = null;
  catchBrassDark.displacementMap = null;
  catchBrassDark.displacementScale = 0;
  // БЕЗ узкой планки и крюка поверх: бляшка + планка + клин + хвост сливались
  // в кашу. Остаётся чистая бляшка с выдавленным литьём; хвост ремня со своей
  // нарисованной заклёпкой прижимается к её краю и не наезжает на лилию.
  const catchPlateGeo = new PlaneGeometry(plateW, plateW * (386 / 420), seg(72), seg(66));
  for (const sy of [0.27, -0.27]) {
    // Пирамидой и ВПЛОТНУЮ к коже: у прежней стопки внешний слой висел в семи
    // миллиметрах над крышкой и с ребра парил светлой пластинкой в воздухе.
    for (const [dz, m, k] of [
      [-0.0015, catchBrassDark, 1],
      [-0.003, catchBrassDark, 0.97],
      [-0.0045, catchBrass, 0.94],
    ] as const) {
      const cp = new Mesh(catchPlateGeo, m);
      cp.rotation.set(0, Math.PI, 0);
      cp.position.set(0.9, PAGE_H * sy * 0.6, -COVER_T + dz);
      cp.scale.setScalar(k);
      book.add(cp);
    }
  }

  // ── Угловые оковки: латунные накладки по углам обеих крышек — тем же приёмом,
  // что бляшки замков: вырезанные по альфе слои, вложенные с уменьшением.
  // Текстура рисуется кодом: щиток с огивой, гравировка по контуру, трилистник
  // у угла и две заклёпки на лапах.
  const cornerTex = (() => {
    const S = 256;
    const cv = document.createElement("canvas");
    cv.width = S;
    cv.height = S;
    const g = cv.getContext("2d");
    if (!g) return null;
    const shape = (): void => {
      g.beginPath();
      g.moveTo(3, 3);
      g.lineTo(S * 0.94, 3);
      g.lineTo(S * 0.99, S * 0.1);
      g.quadraticCurveTo(S * 0.52, S * 0.2, S * 0.34, S * 0.34);
      g.quadraticCurveTo(S * 0.2, S * 0.52, S * 0.1, S * 0.99);
      g.lineTo(3, S * 0.94);
      g.closePath();
    };
    const grad = g.createLinearGradient(0, 0, S * 0.62, S * 0.62);
    grad.addColorStop(0, "#d9b568");
    grad.addColorStop(0.55, "#a8874a");
    grad.addColorStop(1, "#6f5730");
    g.fillStyle = grad;
    shape();
    g.fill();
    g.lineWidth = S * 0.016;
    g.strokeStyle = "rgba(46,35,16,0.9)";
    shape();
    g.stroke();
    // Гравированная линия параллельно контуру.
    g.save();
    g.translate(S * 0.045, S * 0.045);
    g.scale(0.85, 0.85);
    g.lineWidth = S * 0.014;
    g.strokeStyle = "rgba(56,42,18,0.75)";
    shape();
    g.stroke();
    g.restore();
    // Трилистник у самого угла — пробит насквозь.
    g.globalCompositeOperation = "destination-out";
    for (const [tx, ty] of [
      [0.2, 0.115],
      [0.115, 0.2],
      [0.205, 0.205],
    ] as const) {
      g.beginPath();
      g.arc(S * tx, S * ty, S * 0.042, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = "source-over";
    // Заклёпки на лапах.
    for (const [rx, ry] of [
      [0.79, 0.1],
      [0.1, 0.79],
    ] as const) {
      const rr = S * 0.05;
      const rg = g.createRadialGradient(S * rx - rr * 0.35, S * ry - rr * 0.35, rr * 0.15, S * rx, S * ry, rr);
      rg.addColorStop(0, "#f0d489");
      rg.addColorStop(0.7, "#96793f");
      rg.addColorStop(1, "#4a3819");
      g.beginPath();
      g.arc(S * rx, S * ry, rr, 0, Math.PI * 2);
      g.fillStyle = rg;
      g.fill();
    }
    const t = new Texture(cv);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = aniso;
    t.needsUpdate = true;
    return t;
  })();
  if (cornerTex) {
    const cornerBrass = new MeshStandardMaterial({
      map: cornerTex,
      metalness: 0.78,
      roughness: 0.38,
      alphaTest: 0.5,
    });
    cornerBrass.alphaToCoverage = true;
    const cornerDark = cornerBrass.clone();
    cornerDark.color = new Color(0x8a7748);
    const CORNER_S = 0.17;
    const cornerGeo = new PlaneGeometry(CORNER_S, CORNER_S);
    // Слои начинаются ВЫШЕ гребней displacement-тиснения кожи (+0.0055), иначе
    // рельеф прорастает сквозь латунь.
    const addCorners = (back: boolean): void => {
      const cx0 = GROOVE + CORNER_S / 2 - 0.006;
      const cx1 = GROOVE + coverW - CORNER_S / 2 + 0.006;
      const cy = coverH / 2 - CORNER_S / 2 + 0.006;
      const spots: Array<[number, number, number]> = [
        [cx0, cy, 0],
        [cx1, cy, -Math.PI / 2],
        [cx1, -cy, Math.PI],
        [cx0, -cy, Math.PI / 2],
      ];
      for (const [x, y, rz] of spots) {
        for (const [dz, m, k] of [
          [0.008, cornerBrass, 0.93],
          [0.0055, cornerDark, 0.97],
          [0.003, cornerDark, 1],
        ] as const) {
          const c = new Mesh(cornerGeo, m);
          if (back) {
            // Задняя грань НЕ зеркалит развёртку (выяснено на слепом штампе),
            // но Ry(π) меняет базис плоскости: уголок доворачивается на
            // −rz − 90° — иначе все четыре смотрели мимо своих углов.
            c.rotation.set(0, Math.PI, -rz - Math.PI / 2);
            c.position.set(x, y, -COVER_T - dz);
            book.add(c);
          } else {
            c.rotation.set(0, 0, rz);
            c.position.set(x, y, COVER_T + dz);
            coverHinge.add(c);
          }
          c.scale.setScalar(k);
          c.castShadow = true;
        }
      }
    };
    addCorners(false);
    addCorners(true);
  }

  // ── переворачиваемый лист: плоскость, гнущаяся в шейдере.
  const leafHinge = new Group();
  book.add(leafHinge);
  const leafGeo = new PlaneGeometry(PAGE_W, PAGE_H, seg(48), seg(16));
  leafGeo.translate(PAGE_W / 2, 0, 0);
  // Лист режется по альфе ТАК ЖЕ, как лежащие страницы. Без этого он оставался
  // honest-to-god прямоугольником: у страницы под ним край рваный, и в каждую
  // выемку зубца был виден угол листа — вдоль обреза шла гребёнка белых плашек.
  // Прозрачность при этом выключаем и режем покрытием пикселя, как у страниц:
  // с transparent порядок отрисовки начинает зависеть от угла камеры.
  const cutLeaf = (m: { material: MeshStandardMaterial }): void => {
    m.material.transparent = false;
    m.material.alphaToCoverage = true;
    m.material.needsUpdate = true;
  };
  const leafFront = bendableMaterial(T.right, PAGE_W, true, PAGE_H / 2);
  cutLeaf(leafFront);
  const leaf = new Mesh(leafGeo, leafFront.material);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  leaf.customDepthMaterial = leafFront.depth;
  leafHinge.add(leaf);
  // Оборот листа: своя текстура и BackSide. Без него лист за -90° показывал
  // пустоту и вдобавок дублировал страницу, лежащую под ним.
  const leafBackMat = bendableMaterial(T.left, PAGE_W, true, PAGE_H / 2);
  cutLeaf(leafBackMat);
  leafBackMat.material.side = BackSide;
  // UV оборота ЗЕРКАЛИТСЯ по u. Рваный обрез — один и тот же физический край
  // листа, дальний от петли, и на обороте он обязан лежать у того же конца
  // геометрии. Текстура левой страницы рисует зубцы у своего u = 0, поэтому без
  // зеркала лист в момент старта листания менял рваную сторону на глазах:
  // у лежащей страницы зубцы снаружи, у подлетевшего листа — у корешка.
  const leafBackGeo = leafGeo.clone();
  {
    const buv = leafBackGeo.attributes.uv;
    for (let i = 0; i < buv.count; i++) buv.setX(i, 1 - buv.getX(i));
    buv.needsUpdate = true;
  }
  const leafBack = new Mesh(leafBackGeo, leafBackMat.material);
  leafBack.castShadow = true;
  leafBack.customDepthMaterial = leafBackMat.depth;
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
    // Тень на подиуме гаснет по ходу раскрытия: у разворота она почти не нужна,
    // а движущиеся прямоугольники теней читались артефактом.
    shadowMat.opacity = 0.42 * (1 - 0.72 * settle);

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
    // Раскрытая книга НЕ выводится строго в лоб: толщина шла бы вдоль взгляда и
    // проецировалась в ничто — том читался бы двумя листами бумаги на столе.
    // К развороту камера ПОДНИМАЕТСЯ (~25° тангажа при ~12° рысканья) и отходит:
    // сверху видны оба веера стопок, обрезы и канты крышек — толщина читается,
    // разворот целиком в кадре и с воздухом по краям.
    const basePitch = narrow ? 16 - 2 * anticip + 5 * swing : 20 - 2 * anticip + 7 * swing;
    const pitch = ((basePitch + overshoot) * Math.PI) / 180 + orb.pitch * orbW;
    const baseYaw = narrow ? -9 + 1 * anticip + 3 * swing : -16 + 2 * anticip + 4 * swing;
    const yaw = (baseYaw * Math.PI) / 180 + orb.yaw * orbW;
    // В узком кадре подходим заметно ближе и целимся в одну страницу. Ближняя
    // рамка плитки поджимает дистанцию, пока том закрыт.
    const dist =
      (narrow
        ? 2.62 + 0.5 * swing + overshoot * 0.02
        : 2.78 + 0.55 * swing - 0.06 * anticip + overshoot * 0.02) -
      (closeUp ? 0.2 * (1 - swing) : 0);
    // Широкий кадр к концу хода смотрит в корешок (виден весь разворот), узкий —
    // остаётся на правой странице.
    const lookX = narrow ? PAGE_W * 0.5 : (PAGE_W / 2) * (1 - swing);
    camera.position.set(
      lookX + dist * Math.sin(yaw) * Math.cos(pitch),
      dist * Math.sin(pitch),
      dist * Math.cos(yaw) * Math.cos(pitch),
    );
    // Ближняя рамка целится чуть выше центра тома — иначе верхний каптал
    // цеплялся за кромку плитки.
    camera.lookAt(lookX, closeUp ? 0.07 * (1 - swing) : 0, 0);

    // Замки отходят первыми, крышка ждёт их. Зажим ремешка — доля 0..1: единица
    // значит «обнимает том и пристёгнут к планке», ноль — ремень свободен.
    const strapCurl = 1 - ease(phase(t, 0, CLASP_END * 0.6));
    for (const sb of strapBends) sb.value = strapCurl;
    // Доля поворота крышки: нужна петле и посадке крышки по высоте.
    const rot = ease(phase(t, CLASP_END, 0.86));
    // Ремешки НЕ исчезают: у раскрытой книги фурнитура остаётся на крышке.
    // Отщёлкнутый ремень приподнимается и ЗАМИРАЕТ под небольшим углом —
    // болтанки нет намеренно: сыромятный ремень с латунным весом держит форму,
    // маятник на нём выглядел дешёвкой.
    const unl = ease(phase(t, CLASP_END * 0.45, CLASP_END));
    for (const p of strapPivots) {
      p.rotation.y = -unl * (1.1 - 0.72 * unl);
    }

    coverHinge.rotation.y = -rot * Math.PI;

    const total = Math.max(1, leftPages + rightPages);
    // Ход листа прогоняется через профиль падения: первая треть — подхват,
    // середина — свободный пролёт, последняя треть — падение с ускорением и
    // короткое затухающее колебание. Линейный ход читается механикой.
    //
    // Раньше при отсутствии переворота сюда подставлялось РАСКРЫТИЕ: пока книга
    // открывалась, лист перелетал слева направо и оставался лежать слева. Но
    // номер страницы при этом не менялся, и лишний лист навсегда оседал в левой
    // доле. Отсюда вся кривизна: на середине книги стопки стояли 4:2 вместо 3:3,
    // на нулевой странице слева уже лежала шестая часть блока, а на последней
    // доля переваливала за единицу и ПРАВАЯ толщина уходила в минус — правая
    // страница проваливалась под крышки. Лист летит только когда листают.
    const leafPhase = leafFall(tw);
    // Доля левой стопки гасится при ЗАКРЫВАНИИ. Иначе у закрытой книги половина
    // толщины остаётся слева, за пределами крышки: том стоит с торчащей плитой
    // сбоку. Физически верно — закрытая книга это одна стопка под крышкой, где бы
    // ни была закладка.
    //
    // Начало сдвинуто к ПОСАДКЕ крышки: листы уходят налево, когда крышке до
    // стола меньше сантиметра. Пока порог стоял на вертикали (0.5), стопка
    // ложилась на пол под ещё опускающейся крышкой и торчала белым из-за её
    // краёв. Так и у настоящей книги: перекинутые листы падают на крышку в самом
    // конце её хода, а не повисают в воздухе на полпути.
    const spread = ease(phase(t, 0.66, 0.95));
    const leftShare = ((leftPages + leafPhase) / total) * spread;
    // Две доли в СУММЕ дают ровно толщину блока. Прежние 0.01 + 0.94·BLOCK_T
    // недобирали 0.007, а крышка вдобавок стояла на BLOCK_T + COVER_T — на целую
    // толщину картона выше бумаги. Вместе это давало 0.029 воздуха под крышкой:
    // десятую часть блока, из-за которой у закрытой книги обрез торчал из-под
    // переплёта.
    const rightT = Math.max(SHEET_T, BLOCK_T * (1 - leftShare));
    const leftT = Math.max(SHEET_T, BLOCK_T * leftShare);
    // Крышка лежит на самой бумаге, а не на константе. Два просвета: один под
    // страницей, один над ней — в одной плоскости с крышкой страница мерцала бы.
    //
    // Опускание привязано к ПОВОРОТУ, а не ко времени: петля сидит на верхе
    // правой стопки, пока крышка не пройдёт вертикаль, и только потом съезжает
    // на стол. Прежний спуск по времени начинался раньше вертикали — блок
    // протыкал наклонённую крышку у корешка насквозь.
    coverHinge.position.z = (rightT + PAPER_LIFT * 2) * (1 - ease(phase(rot, 0.5, 1)));
    // Крыло левой стопки повёрнуто НА ПОЛОБОРОТА ОТ КРЫШКИ: при крышке в −π
    // крыло в нуле — листы лежат в плоскости стола; на середине хода — под её
    // углом, на форзаце. Плюс её высота: листы едут на крышке, а не ждут на полу.
    leftWing.rotation.y = coverHinge.rotation.y + Math.PI;
    leftWing.position.z = coverHinge.position.z + 0.0006;

    // Толщина и веер жёлоба живут в самой геометрии половин: пережим столбцов,
    // а не scale.z — масштаб плющил бы вместе с толщиной и профиль спада.
    rightHalf.update(rightT, spread);
    leftHalf.update(leftT, spread);

    leftBlock.visible = coverHinge.rotation.y < -Math.PI / 2;
    leftPage.visible = leftBlock.visible;

    // ── ЖЁЛОБ. Страница повторяет веер своей стопки: база страницы — верх веера
    // у обреза T·(1−carve), прогиб — T·carve тем же спадом DIP_K. Обе половины
    // ныряют в одну точку сшивки, поэтому щели между ними нет. При закрывании
    // спад гаснет вместе с веером, и страница ложится плоско под крышку — прежняя
    // константная посадка на GUTTER топила её внутри закрытой стопки.
    rightPage.position.set(PAGE_W / 2, 0, rightT * (1 - spread) + PAPER_LIFT);
    leftPage.position.set(-PAGE_W / 2, 0, leftT * (1 - spread) + PAPER_LIFT);
    rightSheet.dip.value = rightT * spread;
    leftSheet.dip.value = leftT * spread;
    // Рябь старой бумаги видна только у раскрытого тома: под крышкой листы
    // прижаты в плоскость.
    rightSheet.ripple.value = 0.003 * spread;
    leftSheet.ripple.value = 0.003 * spread;
    const rimHi = Math.max(rightT, leftT);
    // Окно сдвинуто за вертикаль крышки: пока том по сути закрыт, горб корешка
    // обязан держаться высокой стопки — ранний спад оголял блок у жёлоба.
    const rim = rimHi + (Math.min(rightT, leftT) - rimHi) * ease(phase(t, 0.6, 0.95));
    // Корешок РАСПРЯМЛЯЕТСЯ. У закрытой книги это полуцилиндр во всю толщину, у
    // раскрытой — он лежит между крышками почти плоско. Пока высота была
    // постоянной, у разворота дуга поднималась до верха стопок и в жёлобе была
    // видна НАРУЖНАЯ, тиснёная сторона корешка: посреди раскрытой книги шла
    // золочёная полоса с бинтами, то есть спина тома изнутри.
    // Распрямление КОРОТКОЕ и кончается сразу за вертикалью крышки: пока горб
    // стоял до 0.95, он торчал в жёлобе наружной тиснёной стороной — между
    // раскрывающимися стопками была видна спина тома.
    const flat = 1 - ease(phase(t, 0.55, 0.72));
    // Пока горб жив, его размах следует за ТЕКУЩЕЙ высотой тома (rim + крышки):
    // с постоянным размахом на середине хода корешок то не доставал до блока,
    // и у жёлоба чернел клин, то торчал за крышки.
    const squash = Math.max(COVER_T / (spineRz * 2), flat * ((rim + 2 * COVER_T) / sw));
    spine.scale.z = squash;
    spineFace.scale.z = squash;
    // Центр дуги — середина ВСЕГО тома с крышками: (низ −COVER_T + верх
    // rim + COVER_T)/2 = rim/2. Прежняя посадка rim − R центрировала дугу по
    // одному блоку: торец передней крышки оставался голым, а снизу дуга выходила
    // за заднюю крышку ровно на толщину картона.
    spine.position.set(0, 0, (rim / 2) * flat - (COVER_T / 2) * (1 - flat));
    // Капталы: дуга колпачка сжимается по толщине вместе с горбом и сидит на
    // его торцах.
    for (let i = 0; i < headbands.length; i++) {
      const sy = i === 0 ? 1 : -1;
      const hb = headbands[i];
      hb.position.set(0, (PAGE_H / 2 + 0.0005) * sy, spine.position.z);
      hb.scale.z = squash;
    }
    spineFace.position.copy(spine.position);
    spineFace.position.z -= 0.006;

    leafHinge.rotation.y = -leafPhase * Math.PI;
    // Петля листа сидит на линии сшивки — в той же точке, куда ныряют оба веера
    // и обе страницы. Любая другая высота отрывает лист от стопок на концах хода.
    leafHinge.position.set(0, 0, 0.004);
    const lift = Math.sin(clamp01(leafPhase) * Math.PI);
    const leafBend = lift * turnFx.amp;
    leafFront.bend.value = leafBend;
    leafBackMat.bend.value = leafBend;
    leafFront.fanBase.value = turnFx.base;
    leafFront.fanTilt.value = turnFx.tilt;
    leafBackMat.fanBase.value = turnFx.base;
    leafBackMat.fanTilt.value = turnFx.tilt;
    // Ложбина листа гаснет к вертикали: в воздухе жёлоба нет. На концах хода лист
    // повторяет профиль той стопки, к которой прилегает, — иначе он на входе и
    // выходе ныряет под лежащую страницу.
    //
    // Ложбина задаётся в ЛОКАЛЬНЫХ осях листа, а петля к концу хода повёрнута на
    // ~180°: локальный +z там смотрит ВНИЗ. Со знаком «плюс до конца» лист на
    // подлёте вдавливался в левую стопку на всю глубину ложбины. cos(πφ) даёт
    // плюс на правой половине хода, минус на левой, а его квадрат — то самое
    // квадратичное гашение веса к вертикали: лист держится вровень со стопкой,
    // пока от неё почти не оторвался.
    const lc = Math.cos(clamp01(leafPhase) * Math.PI);
    const leafDip = lc * Math.abs(lc) * (rightT + leafPhase * (leftT - rightT)) * spread;
    leafFront.dip.value = leafDip;
    leafBackMat.dip.value = leafDip;
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
  // Характер текущего переворота: база и перекос веера, амплитуда изгиба.
  // hint — точка подхвата (-1 низ … +1 верх), приходит из turnFrom() перед
  // листанием; остальное разыгрывается заново на каждый лист.
  const turnFx = { base: 0.97, tilt: 0.3, amp: 1.6, hint: 0 };
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
    // Правую долю НЕ подпираем единицей. С подпоркой на последней странице сумма
    // становилась семёркой вместо шестёрки, и слева оказывалось 6/7 блока: у
    // дочитанной книги справа оставалась заметная стопка из ниоткуда.
    render(cur.open, frac, whole, LEAVES - whole);
  }
  raf = requestAnimationFrame(step);
  // Метка готовности: по ней и сквозной тест, и замер «клик -> первый кадр».
  canvas.dataset.ready = "1";
  // Дев-шов: стенду нужно мерить фактические высоты мешей, а не пересчитывать
  // формулы на бумаге. Пересчёт уже дважды показывал не то, что рисует шейдер.
  if (import.meta.env.DEV) {
    (canvas as unknown as { __scene?: Scene }).__scene = scene;
  }

  return {
    target(open: number, page: number): void {
      const p = Math.max(0, Math.min(LEAVES, page));
      if (p !== tgt.page) {
        // Каждый лист летит чуть по-своему: живая книга не умеет повторяться.
        // Перекос конуса ставится от точки подхвата: ткнули сверху — сильнее
        // закручивается верх, снизу — низ.
        turnFx.base = 0.94 + Math.random() * 0.08;
        turnFx.tilt = Math.max(-0.55, Math.min(0.55, 0.3 - 0.45 * turnFx.hint + (Math.random() - 0.5) * 0.2));
        turnFx.amp = 1.5 + Math.random() * 0.28;
        turnFx.hint = 0;
      }
      tgt.open = clamp01(open);
      tgt.page = p;
    },
    turnFrom(fromY: number): void {
      turnFx.hint = Math.max(-1, Math.min(1, fromY));
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
    resetView(): void {
      orb.yaw = 0;
      orb.pitch = 0;
      orb.vYaw = 0;
      orb.vPitch = 0;
    },
    resize,
    dispose(): void {
      cancelAnimationFrame(raf);
      glowTex.dispose();
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
