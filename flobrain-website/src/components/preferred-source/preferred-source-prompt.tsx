"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/layout/dialog";
import { GoogleMark } from "./google-mark";
import {
  openPreferredSourceFlow,
  readPreferredSourceChoice,
  rememberPreferredSourceChoice,
} from "./preferred-source";

export function PreferredSourcePrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readPreferredSourceChoice()) return;
    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = (choice: "accepted" | "dismissed") => {
    rememberPreferredSourceChoice(choice);
    setOpen(false);
  };

  const accept = () => {
    openPreferredSourceFlow();
    dismiss("accepted");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss("dismissed");
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[200] bg-black/60"
        className="z-[200] max-w-[420px] gap-5 border border-white/10 bg-[#12041c] p-6 text-white shadow-2xl light:border-[#610081]/25 light:bg-[#f6edff] light:text-[#1a1b25]"
      >
        <div className="flex flex-col gap-3">
          <DialogTitle className="flex items-center gap-2.5 text-left text-[18px] leading-snug font-semibold text-white light:text-[#1a1b25]">
            <GoogleMark className="h-5 w-5 shrink-0" />
            Add FloBrain as a preferred source?
          </DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed text-zinc-400 light:text-[#3f3f46]">
            Google can show FloBrain more often in Search. You can change this anytime in your
            Google preferences.
          </DialogDescription>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => dismiss("dismissed")}
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC34FF] light:text-[#3f3f46] light:hover:text-[#000000]"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-[#9333EA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a855f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC34FF]"
          >
            OK
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
