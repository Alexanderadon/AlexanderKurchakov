import { test as base } from "@playwright/test";

/**
 * Общая основа для всех сквозных тестов: страница не издаёт ни звука.
 *
 * Три слоя защиты, потому что каждый по отдельности дырявый:
 *
 * 1. Медиафайлы не доезжают вовсе — route отбивает mp4/webm/mp3. Нет данных,
 *    нет дорожки. Ни один тест в наборе воспроизведение не проверяет.
 * 2. play() принудительно глушит элемент ДО запуска. Подменять геттер muted
 *    бесполезно: он лишь отражает внутреннее состояние и звук не выключает, а
 *    заглушённый сеттер вдобавок мешает самой странице приглушить видео. Здесь
 *    используется настоящий сеттер, поэтому глушение реальное.
 * 3. Периодический обход всех media-элементов — на случай, если элемент создан
 *    и запущен в обход play() (autoplay-атрибут, восстановление после сбоя).
 *
 * Флагами движка это не решается: --mute-audio понимает только Chromium, а
 * WebKit и Firefox его игнорируют.
 */
const MEDIA = /\.(mp4|webm|ogg|ogv|mp3|wav|m4a|aac)(\?.*)?$/i;

export const test = base.extend<{ silence: void }>({
  silence: [
    async ({ context }, use) => {
      await context.route(MEDIA, (route) => route.abort());
      await context.addInitScript(() => {
        const proto = HTMLMediaElement.prototype;
        const play = proto.play;
        proto.play = function (this: HTMLMediaElement) {
          this.muted = true;
          this.volume = 0;
          return play.apply(this);
        };
        const sweep = (): void => {
          for (const el of Array.from(document.querySelectorAll("video, audio"))) {
            const m = el as HTMLMediaElement;
            m.muted = true;
            m.volume = 0;
          }
        };
        document.addEventListener("DOMContentLoaded", sweep);
        setInterval(sweep, 400);
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect, devices, type Page } from "@playwright/test";
