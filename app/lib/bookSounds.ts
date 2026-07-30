// Звуки книги, собранные кодом: скрип кожи на открытии и шелест листа.
//
// Файлов нет намеренно: пара фильтрованных всплесков шума весит ноль байт и не
// тянет ни загрузки, ни лицензий. Контекст создаётся лениво и только из
// обработчика клика — политика автозапуска браузеров этого требует; вызывающая
// сторона сама решает, звать ли нас (reduced motion — не звать).

type AC = typeof AudioContext;

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: AC | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    const len = Math.floor(ctx.sampleRate * 0.7);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Всплеск шума через фильтр с уводом частоты и короткой огибающей. */
function burst(
  type: BiquadFilterType,
  f0: number,
  f1: number,
  q: number,
  dur: number,
  peak: number,
): void {
  const c = ensure();
  if (!c || !noise) return;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.85 + Math.random() * 0.3;
  const filt = c.createBiquadFilter();
  filt.type = type;
  filt.frequency.setValueAtTime(f0, c.currentTime);
  filt.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur);
  filt.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(peak, c.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(c.destination);
  src.start();
  src.stop(c.currentTime + dur + 0.05);
}

/** Тяжёлая кожа и вес тома: низкий глухой сдвиг при открытии и закрытии. */
export function bookCreak(): void {
  burst("lowpass", 320, 110, 1.4, 0.55, 0.09);
}

/** Шелест перелистываемого листа: короткий, каждый раз чуть другой. */
export function bookRustle(): void {
  burst("bandpass", 2400 - Math.random() * 800, 900, 0.9, 0.16, 0.05);
}
