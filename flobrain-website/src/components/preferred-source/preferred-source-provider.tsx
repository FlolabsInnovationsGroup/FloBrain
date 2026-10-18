"use client";

import { useEffect, type ReactNode } from "react";
import { isPreferredSourceProductionHost, PREFERRED_SOURCE_SCRIPT_SRC } from "./preferred-source";

/**
 * Loads Google's preferred-source publisher script once, on the production host.
 * The queue is registered before the script is inserted so init runs on load.
 */
export function PreferredSourceProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isPreferredSourceProductionHost()) return;
    if (window.__flobrainPreferredSource) return;

    window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || [];
    window.PREFERRED_SOURCE.push((client) => {
      client.init({ theme: "dark", lang: "en" });
      window.__flobrainPreferredSource = client;
    });

    if (document.querySelector(`script[src="${PREFERRED_SOURCE_SCRIPT_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = PREFERRED_SOURCE_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return children;
}
