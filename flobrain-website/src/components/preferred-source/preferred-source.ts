export const PREFERRED_SOURCE_SCRIPT_SRC = "https://news.google.com/swg/js/v1/publisher.js";

/** Production host Google should save. Preview and local hosts must not be registered. */
export const PREFERRED_SOURCE_HOST = "www.flobrain.ai";

export const PREFERRED_SOURCE_DEEPLINK = `https://www.google.com/preferences/source?q=${PREFERRED_SOURCE_HOST}`;

export const PREFERRED_SOURCE_PROMPT_KEY = "flobrain-preferred-source-prompt";

export type PreferredSourceChoice = "accepted" | "dismissed";

export type PreferredSourceClient = {
  init: (options?: { theme?: "light" | "dark"; lang?: string }) => void;
  addPreferredSource: () => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: Array<(client: PreferredSourceClient) => void>;
    __flobrainPreferredSource?: PreferredSourceClient;
  }
}

export function isPreferredSourceProductionHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "flobrain.ai" || host === PREFERRED_SOURCE_HOST;
}

export function readPreferredSourceChoice(): PreferredSourceChoice | null {
  try {
    const value = localStorage.getItem(PREFERRED_SOURCE_PROMPT_KEY);
    return value === "accepted" || value === "dismissed" ? value : null;
  } catch {
    return "dismissed";
  }
}

export function rememberPreferredSourceChoice(choice: PreferredSourceChoice): void {
  try {
    localStorage.setItem(PREFERRED_SOURCE_PROMPT_KEY, choice);
  } catch {
    // Storage can be blocked; the prompt simply will not persist.
  }
}

/**
 * Opens Google's preferred-source flow for www.flobrain.ai.
 * On the production host this uses Google's publisher script so the reader
 * returns to the page. Everywhere else it uses Google's documented deeplink.
 */
export function openPreferredSourceFlow(): void {
  if (typeof window === "undefined") return;

  const client = window.__flobrainPreferredSource;
  if (isPreferredSourceProductionHost() && client) {
    client.addPreferredSource();
    return;
  }

  window.open(PREFERRED_SOURCE_DEEPLINK, "_blank", "noopener,noreferrer");
}
