import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser auto-restoration (so SPA controls it)
    try {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
    } catch (err) {
      // ignore
    }

    // Scroll the window (fallback) and the app's main container + any nested scrollable elements
    if (typeof window !== "undefined") {
      try {
        // Window-level scroll
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        // Main app area (DashboardLayout main)
        const main = document.querySelector("main");
        if (main && typeof (main as HTMLElement).scrollTo === "function") {
          (main as HTMLElement).scrollTo({ top: 0, left: 0, behavior: "auto" });
        }

        // Reset any nested scrollable elements inside main (overflow:auto or scroll)
        if (main) {
          const nodes = Array.from(main.querySelectorAll("*")).filter((el) => {
            const cs = window.getComputedStyle(el as Element);
            return (
              cs.overflowY === "auto" ||
              cs.overflowY === "scroll" ||
              cs.overflow === "auto" ||
              cs.overflow === "scroll"
            );
          }) as HTMLElement[];

          nodes.forEach((el) => {
            try {
              el.scrollTop = 0;
            } catch (e) {
              // ignore individual element failures
            }
          });
        }
      } catch (e) {
        // ignore DOM errors
        // keep fallback behavior of window.scrollTo above
      }
    }
  }, [pathname]);

  return null;
}
