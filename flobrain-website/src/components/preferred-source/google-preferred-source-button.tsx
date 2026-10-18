"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { GoogleMark } from "./google-mark";
import { isPreferredSourceProductionHost, PREFERRED_SOURCE_DEEPLINK } from "./preferred-source";

const buttonClassName =
  "inline-flex items-center gap-2 rounded-md bg-[#333333] px-2.5 py-1.5 text-[13px] font-medium leading-none text-white transition-colors hover:bg-[#3f3f3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white light:bg-[#f1f3f4] light:text-[#202124] light:hover:bg-[#e8eaed] light:focus-visible:outline-[#610081]";

/**
 * Google's official preferred-source button on www.flobrain.ai.
 * On any other host, the same visual links to Google's documented deeplink
 * so the saved source is still www.flobrain.ai.
 */
export function GooglePreferredSourceButton({ className = "" }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";
  const [useOfficialButton, setUseOfficialButton] = useState(false);
  const [officialRendered, setOfficialRendered] = useState(false);

  useEffect(() => {
    setUseOfficialButton(isPreferredSourceProductionHost());
  }, []);

  useEffect(() => {
    if (!useOfficialButton) return;

    const host = document.getElementById("google-preferred-source-btn");
    if (!host) return;

    host.setAttribute("google-add-preferred-source-btn", "");
    host.setAttribute("data-theme", theme);
    host.setAttribute("data-lang", "en");
    window.__flobrainPreferredSource?.init({ theme, lang: "en" });

    const markRendered = () => setOfficialRendered(host.childElementCount > 0);
    markRendered();
    const observer = new MutationObserver(markRendered);
    observer.observe(host, { childList: true });
    return () => observer.disconnect();
  }, [theme, useOfficialButton]);

  return (
    <div className={className}>
      {useOfficialButton ? (
        <div id="google-preferred-source-btn" className={officialRendered ? "" : "hidden"} />
      ) : null}
      <a
        href={PREFERRED_SOURCE_DEEPLINK}
        target="_blank"
        rel="noopener noreferrer"
        className={officialRendered ? "hidden" : buttonClassName}
      >
        <GoogleMark />
        Add as preferred source on Google
      </a>
    </div>
  );
}
