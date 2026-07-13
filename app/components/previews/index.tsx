// Резолвер инлайн-SVG-превью карточек + клон превью для .fly / .row-pre.
import type { ComponentType } from "react";
import type { PreviewKey, WorkItem } from "~/data/works";
import { KidoPreview } from "./KidoPreview";
import { LogofolioPreview } from "./LogofolioPreview";
import { CanvasPreview } from "./CanvasPreview";
import { SneakersPreview } from "./SneakersPreview";
import { MucklikerPreview } from "./MucklikerPreview";

const PREVIEWS: Record<PreviewKey, ComponentType> = {
  kido: KidoPreview,
  logofolio: LogofolioPreview,
  canvas: CanvasPreview,
  sneakers: SneakersPreview,
  muckliker: MucklikerPreview,
};

export function PreviewArt({ preview }: { preview: PreviewKey }) {
  const Art = PREVIEWS[preview];
  return <Art />;
}

// Клон превью для плавающего окна и раскрытой строки списка:
// видео → постер <img>, картинка → та же <img>, svg → компонент-арт.
export function PreviewClone({ item }: { item: WorkItem }) {
  if (item.kind === "video") return <img src={item.poster} alt="" />;
  if (item.kind === "img") return <img src={item.imgSrc} alt="" />;
  if (item.preview) return <PreviewArt preview={item.preview} />;
  return null;
}
