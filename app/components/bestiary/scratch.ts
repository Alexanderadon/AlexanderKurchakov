// Рабочий холст, один вызов для двух миров.
//
// Сцена книги обязана собираться и на главном потоке (запасной путь для старых
// Safari), и в воркере — а там нет document, и holст берётся из OffscreenCanvas.
// Все двенадцать мест, где сцене нужен временный 2D-холст (карты рельефа,
// окружение, процедурная кожа и латунь), ходят через эту пару функций и не
// знают, в каком мире исполняются.
//
// Размер передаётся сюда, а не выставляется после: OffscreenCanvas без размеров
// не создаётся, и это к лучшему — холст нулевого размера молча даёт пустой
// getImageData, такие ошибки всплывали бы картинкой, а не исключением.

/** Холст для промежуточных отрисовок: DOM-канвас в окне, OffscreenCanvas в воркере. */
export function scratch(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof document !== "undefined") {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    return cv;
  }
  return new OffscreenCanvas(w, h);
}

/**
 * 2D-контекст без различия миров.
 *
 * Возвращаемые типы контекстов формально разные, но весь используемый нами
 * набор (drawImage, getImageData, putImageData, createImageData, fillRect,
 * градиенты) совпадает; отличий в поведении для наших вызовов нет.
 */
export function ctx2d(cv: HTMLCanvasElement | OffscreenCanvas): CanvasRenderingContext2D | null {
  return cv.getContext("2d") as CanvasRenderingContext2D | null;
}
