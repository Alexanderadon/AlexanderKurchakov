// Кинематографичный CSS-фон: тёмная база + огромные мягкие радиальные
// градиенты + нейтральные глоу-пятна с едва заметным «дыханием» + зерно +
// виньетка. Слои независимы (отдельные элементы), всё настраивается пропсами.
// Только CSS/transform — без картинок, canvas, filter:blur и层аутов.
import type { CSSProperties } from "react";

export interface GlowPos {
  x: string; // CSS-позиция центра, напр. "80%" или "1200px"
  y: string;
  size?: string; // диаметр пятна, напр. "60vw"
}

export interface BackgroundProps {
  backgroundColor?: string;
  lightColor?: string;
  glowOpacity?: number;
  noiseOpacity?: number;
  vignetteOpacity?: number;
  gradientIntensity?: number;
  glowPositions?: GlowPos[];
  animationSpeed?: number; // множитель скорости дыхания (1 = базовая)
}

const DEFAULT_GLOWS: GlowPos[] = [
  { x: "78%", y: "12%", size: "58vw" },
  { x: "8%", y: "62%", size: "52vw" },
  { x: "55%", y: "108%", size: "64vw" },
];

export function Background({
  backgroundColor = "#0A0A0C",
  lightColor = "#E8E8EA",
  glowOpacity = 0.1,
  noiseOpacity = 0.045,
  vignetteOpacity = 0.55,
  gradientIntensity = 0.9,
  glowPositions = DEFAULT_GLOWS,
  animationSpeed = 1,
}: BackgroundProps) {
  const vars = {
    "--cbg": backgroundColor,
    "--clight": lightColor,
    "--cglow": glowOpacity,
    "--cnoise": noiseOpacity,
    "--cvig": vignetteOpacity,
    "--cgrad": gradientIntensity,
    "--cspd": 1 / Math.max(0.1, animationSpeed),
  } as CSSProperties;

  return (
    <div className="cinebg" style={vars} aria-hidden="true">
      <div className="cinebg-grad" />
      {glowPositions.map((g, i) => (
        <i
          key={i}
          className="cinebg-glow"
          style={{
            left: g.x,
            top: g.y,
            width: g.size ?? "56vw",
            animationName: `cine-b${(i % 3) + 1}`,
          }}
        />
      ))}
      <div className="cinebg-noise" />
      <div className="cinebg-vig" />
    </div>
  );
}
