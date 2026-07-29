import { describe, expect, it } from "vitest";
import { HAND_FRAMES, HAND_FRAMES_PER_SIDE, handFrameSrc } from "./handFrames";

describe("кадры рук", () => {
  it("обе руки целиком, без пропусков", () => {
    expect(HAND_FRAMES).toHaveLength(HAND_FRAMES_PER_SIDE * 2);
    expect(new Set(HAND_FRAMES).size).toBe(HAND_FRAMES.length);
  });

  it("номер всегда двузначный", () => {
    // Файлы на диске называются L01, а не L1: без padStart прелоадер молча
    // ждал бы 404, а руки грузились бы своим путём — расхождение мы бы увидели
    // только глазами и не сразу.
    expect(handFrameSrc(0, 0)).toBe("/img/hands/L01.webp");
    expect(handFrameSrc(1, 15)).toBe("/img/hands/R16.webp");
    for (const src of HAND_FRAMES) expect(src).toMatch(/^\/img\/hands\/[LR]\d{2}\.webp$/);
  });

  it("порядок: сначала левая, потом правая", () => {
    expect(HAND_FRAMES[0]).toContain("L01");
    expect(HAND_FRAMES[HAND_FRAMES_PER_SIDE]).toContain("R01");
  });
});
