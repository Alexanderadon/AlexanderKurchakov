// Мост готовности книги между Бестиарием и прелоадером.
//
// Bestiary готовит сцены (карты рельефа, геометрия, шейдеры) и по завершении
// зовёт markBookReady(); прелоадер ждёт whenBookReady() как один из сигналов
// загрузки. Модуль-синглтон: обе стороны видят одно и то же обещание.

let resolveFn: (() => void) | null = null;

const promise = new Promise<void>((res) => {
  resolveFn = res;
});

export function markBookReady(): void {
  resolveFn?.();
  resolveFn = null;
}

export function whenBookReady(): Promise<void> {
  return promise;
}
