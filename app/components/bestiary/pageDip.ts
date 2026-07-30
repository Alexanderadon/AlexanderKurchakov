// Прогиб страницы в жёлоб.
//
// Открытая книга не состоит из двух плоских листов: у корешка страница ныряет
// вниз, а к внешнему обрезу выравнивается. Именно этот прогиб с мягкой тенью в
// жёлобе и читается как «разворот», а без него две страницы выглядят отдельными
// плитами, положенными рядом.
//
// Почему отдельно от изгиба листа. У переворачиваемого листа кривизна РАСТЁТ от
// петли к свободному краю — его поднимают за угол. У лежащей страницы всё
// наоборот: круче всего у корешка, и дальше плоско. Это разные формы, и попытка
// описать их одной формулой давала либо жестяную дугу, либо лист, задранный не
// тем концом.
//
// Отсчёт идёт ОТ УРОВНЯ СТОПКИ, а не вниз от него: z = depth·(1 - exp(-k·s)).
// У корешка страница лежит ровно на стопке, а к внешнему обрезу поднимается —
// получается та самая долина в жёлобе. Считать вниз нельзя: блок у нас плоская
// коробка, долины под ним нет, и страница просто утопала внутрь стопки, оставаясь
// видимой лишь с трёх четвертей ширины.
//
// Показательный спад даёт бесконечно гладкий переход в плоскость, поэтому шва
// между поднятой и плоской частью не видно.

import { MeshStandardMaterial, type IUniform, type Texture, Vector2 } from "three";

export interface DipMaterial {
  material: MeshStandardMaterial;
  /** Глубина падения у самого корешка, в единицах сцены. */
  dip: IUniform<number>;
}

/**
 * Материал страницы с прогибом в жёлоб.
 *
 * side: +1 — страница уходит вправо от корешка, -1 — влево. Зеркалить поворотом
 * нельзя: у плоскости повёрнутой на 180° к зрителю оказывается изнанка, которой
 * нет, и страница пропадает — на эти грабли я уже наступил.
 */
export function pageMaterial(
  map: Texture,
  normalMap: Texture,
  side: 1 | -1,
): DipMaterial {
  const dip: IUniform<number> = { value: 0 };
  const material = new MeshStandardMaterial({
    map,
    normalMap,
    normalScale: new Vector2(0.7, 0.7),
    roughness: 0.95,
    metalness: 0,
    alphaTest: 0.5,
  });
  material.alphaToCoverage = true;

  // Крутизна спада. При 5.2 прогиб заканчивается примерно на трети ширины
  // страницы — так и лежит бумага в толстом томе.
  const K = 5.2;
  const HALF = 0.5; // половина ширины страницы в единицах геометрии
  const s = side > 0 ? `(position.x + ${HALF.toFixed(2)})` : `(${HALF.toFixed(2)} - position.x)`;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDip = dip;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uDip;")
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
    if (uDip > 0.0001) {
      // Наклон поверхности — производная спада. Без правки нормали прогиб был бы
      // виден только по силуэту, а свет ложился бы как на плоскость.
      float d = uDip * ${K.toFixed(1)} * exp(-${s} * ${K.toFixed(1)});
      objectNormal = normalize(vec3(${side > 0 ? "-d" : "d"}, 0.0, 1.0));
    }`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
    if (uDip > 0.0001) {
      transformed.z += uDip * (1.0 - exp(-${s} * ${K.toFixed(1)}));
    }`,
      );
  };

  return { material, dip };
}
