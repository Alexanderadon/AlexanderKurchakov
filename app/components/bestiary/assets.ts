// Текстуры книги: ИМЯ → адрес.
//
// Раньше список жил безымянным массивом в Bestiary, а собирался в объект
// деструктуризацией из шестнадцати переменных подряд — сдвиг на одну строку
// поменял бы карту нормалей местами с цветной текстурой, не потревожив ни
// типы, ни тесты. Теперь имена сшиты с адресами в одном месте.
//
// Модуль нарочно без импортов и без DOM: его тянет и главный поток (запасной
// путь), и воркер — грузит эти адреса сам, через fetch + createImageBitmap,
// не касаясь главного потока ни сетью, ни декодом.

import type { BookTextures } from "./threeBook";

export const BOOK_TEXTURE_SRC: Record<keyof BookTextures, string> = {
  coverFront: "/img/bestiary/cover-front.webp",
  endpaper: "/img/bestiary/endpaper.webp",
  pageLeft: "/img/bestiary/page-left.webp",
  pageRight: "/img/bestiary/page-right.webp",
  spine: "/img/bestiary/spine.webp",
  strap: "/img/bestiary/strap.webp",
  plate: "/img/bestiary/plate.webp",
  nCover: "/img/bestiary/normal-cover.webp",
  nPage: "/img/bestiary/normal-page.webp",
  nPlate: "/img/bestiary/normal-plate.webp",
  foredge: "/img/bestiary/foredge.webp",
  nForedge: "/img/bestiary/foredge-normal.webp",
  headband: "/img/bestiary/headband.webp",
  nStrap: "/img/bestiary/strap-normal.webp",
  catchPlate: "/img/bestiary/catch.webp",
  nCatch: "/img/bestiary/catch-normal.webp",
};

export const BOOK_TEXTURE_KEYS = Object.keys(BOOK_TEXTURE_SRC) as Array<keyof BookTextures>;
