// Единый источник кадров рук — и путей, и самих объектов Image.
//
// Раньше список жил только внутри Hands.tsx, и прелоадер про эти 32 файла
// (≈1.1 МБ, самый тяжёлый ассет первого экрана) просто не знал: байты ехали
// вовремя, но декодирование заканчивалось уже после того, как оверлей снят —
// руки проявлялись на пустой странице через 3.4 с на канале 3 Мбит.
//
// Кэш объектов здесь не ради памяти: без него прелоадер декодировал свои копии,
// а Hands потом декодировал собственные, и работа делалась дважды. Теперь
// ожидание прогревает ровно те объекты, которые и будут рисоваться.

export const HAND_FRAMES_PER_SIDE = 16;

/** side: 0 — левая рука (L), 1 — правая (R). i отсчитывается от нуля. */
export function handFrameSrc(side: 0 | 1, i: number): string {
  return `/img/hands/${side ? "R" : "L"}${String(i + 1).padStart(2, "0")}.webp`;
}

/** Все кадры обеих рук в порядке L01..L16, R01..R16. */
export const HAND_FRAMES: readonly string[] = [0, 1].flatMap((s) =>
  Array.from({ length: HAND_FRAMES_PER_SIDE }, (_, i) => handFrameSrc(s as 0 | 1, i)),
);

let cache: HTMLImageElement[] | null = null;

/**
 * Объекты Image для всех кадров — по одному на файл за всё время жизни страницы.
 * Запрос стартует при первом обращении: кто первый позвал, тот и начал грузить.
 */
export function handImages(): HTMLImageElement[] {
  if (cache) return cache;
  cache = HAND_FRAMES.map((src) => {
    const im = new Image();
    im.decoding = "async";
    im.src = src;
    return im;
  });
  return cache;
}

/**
 * Ждёт, пока кадры не только приедут, но и раскодируются: до decode() первый
 * drawImage разбирает webp синхронно в главном потоке, и канвас до тех пор
 * пустой. Ошибку отдельного кадра глотаем — один не приехавший файл не повод
 * держать оверлей до жёсткого предела.
 */
export function whenHandsReady(): Promise<void> {
  const done = (im: HTMLImageElement): Promise<unknown> =>
    typeof im.decode === "function" ? im.decode().catch(() => undefined) : Promise.resolve();
  return Promise.all(handImages().map(done)).then(() => undefined);
}

/** Только для тестов: сбросить кэш между прогонами. */
export function resetHandImages(): void {
  cache = null;
}
