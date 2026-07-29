// Минимальная матричная арифметика для сцены книги. Своя, а не библиотека:
// нужны ровно перспектива, сдвиг и два поворота — тянуть ради этого зависимость
// в проект, где весь WebGL написан руками, смысла нет.
//
// Порядок — столбцовый, как ждёт uniformMatrix4fv без транспонирования.

export type Mat4 = Float32Array;

export function identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/** out = a · b. Отдельный буфер обязателен: писать в один из входов нельзя. */
export function multiply(a: Mat4, b: Mat4): Mat4 {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

export function translation(x: number, y: number, z: number): Mat4 {
  const m = identity();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

export function rotationX(rad: number): Mat4 {
  const m = identity();
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

export function rotationY(rad: number): Mat4 {
  const m = identity();
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

/**
 * Перспектива. fov — вертикальный угол в радианах.
 * Именно она отличает книгу от развёртки: без деления на глубину дальний край
 * крышки не сужается, и поворот читается плоской картинкой.
 */
export function perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fov / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}
