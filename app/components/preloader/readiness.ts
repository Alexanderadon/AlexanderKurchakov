// Сбор реальной готовности страницы. Прелоадер тянется за настоящей загрузкой,
// а не за таймером: доля считается по взвешенным сигналам.
//
// Веса подобраны по вкладу в первый экран: шрифты решают, поедет ли вёрстка,
// текстуры — увидит ли пользователь фон, кадр — жив ли рендер вообще.

// Руки — самый тяжёлый ассет первого экрана (32 файла, ≈1.1 МБ) и единственный,
// который видно сразу по обоим краям. Пока их тут не было, прелоадер честно
// дожидался шрифтов и текстур, снимал оверлей — и пользователь секунду смотрел
// на страницу без рук. Вес соответствует весу в байтах, а не важности.
export const SIGNAL_WEIGHTS = {
  fonts: 0.26,
  hands: 0.18,
  cathedral: 0.2,
  paper: 0.16,
  hero: 0.12,
  frame: 0.08,
} as const;

export type SignalName = keyof typeof SIGNAL_WEIGHTS;

export class Readiness {
  private readonly got = new Set<SignalName>();
  private value = 0;

  mark(name: SignalName): void {
    if (this.got.has(name)) return;
    this.got.add(name);
    this.value += SIGNAL_WEIGHTS[name];
  }

  /** Доля готовности 0..1. Округляем: сумма весов может не дать ровно 1. */
  get ratio(): number {
    return Math.min(1, this.value);
  }

  has(name: SignalName): boolean {
    return this.got.has(name);
  }
}

export interface FontRequest {
  /** Строка в формате свойства font, например '600 16px "Cinzel"'. */
  font: string;
  /** Образец текста: у шрифта несколько срезов по unicode-range, и без образца
   *  FontFaceSet.load грузит только тот, что покрывает пробел, то есть латиницу.
   *  Кириллический срез так и не приедет, а надпись отрисуется подставным шрифтом. */
  text: string;
}

/**
 * Ждёт шрифты прелоадера поимённо. Одного document.fonts.ready мало: он
 * резолвится и тогда, когда ни один @font-face ещё не был запрошен.
 */
export function whenFontsReady(doc: Document, reqs: readonly FontRequest[]): Promise<void> {
  const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return Promise.resolve();
  const loads = reqs.map((r) => fonts.load(r.font, r.text).catch(() => undefined));
  return Promise.all([...loads, fonts.ready]).then(() => undefined);
}

/** Картинка считается готовой только после декодирования, а не после onload. */
export function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const done = (): void => resolve(img);
      // decode() может отсутствовать или отклониться — тогда хватит onload
      if (typeof img.decode === "function") img.decode().then(done, done);
      else done();
    };
    img.onerror = () => reject(new Error(`image failed: ${src}`));
    img.src = src;
  });
}
