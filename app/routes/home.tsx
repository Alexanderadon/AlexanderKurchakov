// Композиция страницы: провайдеры UI-префов/маскота/фильтра + секции.
// Разметка — настоящий JSX (без dangerouslySetInnerHTML), интерактивность — типизированные хуки.
import { useRef } from "react";
import type { Route } from "./+types/home";
import { LangProvider } from "~/lib/i18n";
import { PrefsProvider } from "~/lib/prefs";
import { MascotProvider } from "~/lib/mascot";
import { WorksProvider } from "~/lib/works-context";
import { useReveal } from "~/hooks/useReveal";
import { useCustomCursor } from "~/hooks/useCustomCursor";
import { useMagneticLinks } from "~/hooks/useMagneticLinks";
import { Background } from "~/components/Background";
import { Header } from "~/components/Header";
import { Hero } from "~/components/Hero";
import { Marquee } from "~/components/Marquee";
import { Works } from "~/components/Works";
import { About } from "~/components/About";
import { SiteFooter } from "~/components/SiteFooter";
import { Mascot } from "~/components/Mascot";
import { Hands } from "~/components/Hands";
import { InkTrail } from "~/components/InkTrail";
import { ExperimentPanel } from "~/components/ExperimentPanel";

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

function Page() {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);
  useCustomCursor(rootRef);
  useMagneticLinks(rootRef);

  return (
    <div ref={rootRef}>
      <Background />
      <Header />
      <main id="top">
        <Hero />
        <Marquee />
        <Works />
        <About />
      </main>
      <SiteFooter />
      <Mascot />
      <Hands />
      <InkTrail />
      <ExperimentPanel />
    </div>
  );
}

export default function Home() {
  return (
    <LangProvider>
      <PrefsProvider>
        <MascotProvider>
          <WorksProvider>
            <Page />
          </WorksProvider>
        </MascotProvider>
      </PrefsProvider>
    </LangProvider>
  );
}
