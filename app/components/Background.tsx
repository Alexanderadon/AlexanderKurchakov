// Свет собора: почти всё чёрное, 2-3 огромных источника падают сквозь «окна».
// Источник — не круг, а вытянутый скошенный шафт с большим размытием, поэтому
// границ и колец не видно, читается пространство, а не градиент.
// Только CSS/transform, без картинок, canvas и библиотек.
import type { CSSProperties } from "react";
import { Fog } from "./Fog";

export interface Light {
  x: string; // положение левого края, CSS-значение
  y: string;
  w: string; // размеры шафта (огромные — 1500-2500px)
  h: string;
  rot?: number; // наклон падения света, deg
  blur?: string; // радиус рассеивания, 400-700px
  opacity?: number; // не выше 0.04
  drift?: [string, string]; // куда медленно дышит
  seconds?: number;
}

export interface BackgroundProps {
  backgroundColor?: string;
  lightColor?: string;
  texture?: boolean;
  geometryOpacity?: number;
  vignetteOpacity?: number;
  lights?: Light[];
  animationSpeed?: number;
}

// высокое окно слева, встречный свет справа, отражение от «пола»
const DEFAULT_LIGHTS: Light[] = [
  {
    x: "-16%", y: "-38%", w: "clamp(850px,48vw,1900px)", h: "clamp(1500px,165vh,2500px)",
    rot: -21, blur: "540px", opacity: 0.1, drift: ["14px", "-10px"], seconds: 42,
  },
  {
    x: "68%", y: "-26%", w: "clamp(750px,36vw,1600px)", h: "clamp(1400px,140vh,2300px)",
    rot: 15, blur: "620px", opacity: 0.08, drift: ["-11px", "13px"], seconds: 34,
  },
  {
    x: "12%", y: "76%", w: "clamp(1200px,86vw,2500px)", h: "clamp(500px,46vh,900px)",
    rot: -5, blur: "460px", opacity: 0.05, drift: ["9px", "8px"], seconds: 50,
  },
];

export function Background({
  backgroundColor = "#0A0807",
  lightColor = "#EFECE6",
  texture = true,
  geometryOpacity = 0.11,
  vignetteOpacity = 0.8,
  lights = DEFAULT_LIGHTS,
  animationSpeed = 1,
}: BackgroundProps) {
  const vars = {
    "--cbg": backgroundColor,
    "--clight": lightColor,
    "--cgeo": geometryOpacity,
    "--cvig": vignetteOpacity,
  } as CSSProperties;

  return (
    <div className="cinebg" style={vars} aria-hidden="true">
      {texture && (
        <>
          <div className="cinebg-tex" />
          <div className="cinebg-tex2" />
          <div className="cinebg-tex3" />
          <div className="cinebg-geo">
            <i /><i /><i /><i /><i /><i /><i /><i /><i />
            <b /><b /><b /><b /><b /><b /><b /><b />
          </div>
          <div className="cinebg-fade" />
        </>
      )}
      <Fog />
      <div className="cinebg-vig" />
    </div>
  );
}
