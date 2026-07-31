// Один кадровый цикл на всех.
//
// Заводился он в восьми местах почти дословно — и в каждой копии свой набор
// пропущенных условий. Замер это показал прямо: холст тумана и руки крутили
// requestAnimationFrame постоянно, включая время, когда их элемент давно уехал
// за экран; кто-то проверял document.hidden внутри кадра (то есть кадр всё
// равно запрашивался), кто-то не проверял вовсе.
//
// Здесь собрано то, что обязано быть в каждом:
//  • пауза, когда вкладка скрыта — не «выйти из колбэка», а вообще не просить
//    кадр: в скрытой вкладке rAF всё равно не вызовут, но при возврате цикл
//    поднимется с честным dt, а не с накопленным простоем;
//  • пауза, когда наблюдаемый элемент вне экрана;
//  • ограничение частоты, если рисовать 60 раз в секунду незачем;
//  • сон по требованию: колбэк возвращает false, и цикл засыпает до wake().
//
// dt приходит в СЕКУНДАХ и зажат сверху: после паузы или тяжёлой задачи
// нельзя отдавать колбэку скачок в полсекунды — анимации от этого прыгают.

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export interface RafLoopHandle {
  /** Разбудить цикл, если он спит (после false из колбэка). */
  wake(): void;
  /** Усыпить до следующего wake(). */
  sleep(): void;
}

export interface RafLoopOptions {
  /** Верхний предел частоты. По умолчанию — частота экрана. */
  fps?: number;
  /** Пока этот элемент вне экрана, цикл спит. */
  watch?: RefObject<Element | null>;
  /** Запас вокруг элемента, при котором он ещё считается видимым. */
  rootMargin?: string;
  /** Не заводить цикл вовсе (например, при prefers-reduced-motion). */
  enabled?: boolean;
  /** Начать спящим — до первого wake(). */
  asleep?: boolean;
}

/**
 * Колбэк получает (now, dt). Вернув false, он усыпляет цикл: так работает
 * след от курсора, которому нечего рисовать, пока мышь стоит.
 */
export type RafLoopCallback = (now: number, dt: number) => void | false;

export function useRafLoop(cb: RafLoopCallback, opts: RafLoopOptions = {}): RafLoopHandle {
  const { fps, watch, rootMargin = "200px", enabled = true, asleep = false } = opts;
  // Колбэк держим в ref: иначе цикл пересобирался бы на каждый рендер
  // родителя, а вместе с ним терялись бы накопленные last/dt.
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const handle = useRef<RafLoopHandle>({ wake: () => {}, sleep: () => {} });

  useEffect(() => {
    if (!enabled) return;
    const minGap = fps ? 1000 / fps - 1 : 0; // −1 мс: иначе кадр на границе пропускается
    let raf = 0;
    let last = 0;
    let paint = 0;
    let sleeping = asleep;
    let hidden = document.hidden;
    let offscreen = false;

    const step = (now: number): void => {
      raf = 0;
      if (minGap && now - paint < minGap) {
        raf = requestAnimationFrame(step);
        return;
      }
      paint = now;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const keep = cbRef.current(now, dt);
      if (keep === false) {
        sleeping = true;
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const run = (): void => {
      if (raf || sleeping || hidden || offscreen) return;
      last = 0; // после паузы первый dt считается заново, а не как простой
      raf = requestAnimationFrame(step);
    };
    const halt = (): void => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    handle.current = {
      wake: () => {
        sleeping = false;
        run();
      },
      sleep: () => {
        sleeping = true;
        halt();
      },
    };

    const onVis = (): void => {
      hidden = document.hidden;
      if (hidden) halt();
      else run();
    };
    document.addEventListener("visibilitychange", onVis);

    let io: IntersectionObserver | null = null;
    const el = watch?.current;
    if (el && "IntersectionObserver" in window) {
      offscreen = true; // до первого ответа наблюдателя не крутим впустую
      io = new IntersectionObserver(
        (entries) => {
          offscreen = !entries.some((e) => e.isIntersecting);
          if (offscreen) halt();
          else run();
        },
        { rootMargin },
      );
      io.observe(el);
    }

    run();
    return () => {
      halt();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      handle.current = { wake: () => {}, sleep: () => {} };
    };
  }, [fps, watch, rootMargin, enabled, asleep]);

  // Стабильная обёртка: сам объект handle.current пересоздаётся эффектом, а
  // наружу отдаётся неизменная пара функций — её можно класть в зависимости.
  const stable = useRef<RafLoopHandle>({
    wake: () => handle.current.wake(),
    sleep: () => handle.current.sleep(),
  });
  return stable.current;
}
