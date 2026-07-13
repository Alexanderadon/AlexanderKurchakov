import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// Без StrictMode: страница инициализируется императивно (initSite в useEffect),
// а StrictMode-double-invoke в dev рвёт reveal-observer до первого срабатывания.
// В production StrictMode и так не применяется.
startTransition(() => {
  hydrateRoot(document, <HydratedRouter />);
});
