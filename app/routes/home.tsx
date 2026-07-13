import { useEffect } from "react";
import type { Route } from "./+types/home";
import { SITE_MARKUP } from "../site-markup";
import { initSite } from "../site-script";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Александр Курчаков — портфолио" },
    {
      name: "description",
      content:
        "Александр Курчаков — frontend-разработчик и дизайнер из Алматы. React, Next.js, TypeScript, Web3 — плюс айдентика, игры и видео.",
    },
    { property: "og:title", content: "Александр Курчаков — портфолио" },
    {
      property: "og:description",
      content:
        "Frontend-разработчик и дизайнер из Алматы. Сайты, игры, айдентика и видео.",
    },
    { property: "og:type", content: "website" },
  ];
}

export default function Home() {
  useEffect(() => initSite(), []);
  return <div dangerouslySetInnerHTML={{ __html: SITE_MARKUP }} />;
}
