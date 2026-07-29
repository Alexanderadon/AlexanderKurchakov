import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { Preloader } from "./components/preloader/Preloader";
import { BOOT_SCRIPT } from "./lib/boot";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preload", href: "/fonts/unbounded-800-cyrillic.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/onest-400-cyrillic.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  // Прелоадер рисуется первым, поэтому его шрифты и собор идут в предзагрузку
  // раньше остальных. Собор — fetchPriority high: он крупнее всего на экране.
  { rel: "preload", href: "/fonts/cinzel-normal-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/oldstandardtt-normal-cyrillic.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/img/cathedral.webp", as: "image", type: "image/webp", fetchPriority: "high" },
  { rel: "preload", href: "/img/paper.webp", as: "image", type: "image/webp" },
];

// Восстанавливает выбор палитры/шрифтов/языка из localStorage и ставит класс .js
// на <html> ДО отрисовки — чтобы не мигало и чтобы сработал reveal-гейт.
// Язык: RU → lang="ru" (дефолт в разметке), KZ → "kk", EN → "en".
// Сам скрипт — типизированная функция в ~/lib/boot: см. пояснение там.

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0D0D0F" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Preloader />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
