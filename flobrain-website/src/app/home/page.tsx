"use client";

import React, { useState, useCallback } from "react";
import { BrainActivity } from "./components/brain-activity";
import { LeftPanel } from "./components/left-panel";
import { RightPanel } from "./components/right-panel";
import type { SystemModuleId } from "./components/left-panel";

export default function Brain() {
  const [activeModuleId, setActiveModuleId] = useState<SystemModuleId>("brain-activity");

  const handleModuleSelect = useCallback((id: SystemModuleId) => {
    setActiveModuleId(id);
    // Wire module-specific logic here when defined (e.g. navigate, open view)
  }, []);
  const handleNewChat = useCallback(() => {
    // TODO: implement new chat action
  }, []);
  const handleSearch = useCallback((_query: string) => {
    // TODO: implement search action
  }, []);
  const handlePreferences = useCallback(() => {
    // TODO: implement preferences action
  }, []);
  const handleSettings = useCallback(() => {
    // TODO: implement settings action
  }, []);

  return (
    <main className="mt-3 h-[100vh] w-[92%] mx-auto fb-page text-slate-300 font-[Inter] overflow-hidden flex flex-col dark:text-slate-300 light:text-[#2d1b4e]">
      <div className="flex flex-1 min-h-0 gap-3 overflow-hidden relative">
        <LeftPanel
          variant="modules"
          activeModuleId={activeModuleId}
          onModuleSelect={handleModuleSelect}
          onNewChat={handleNewChat}
          onSearch={handleSearch}
          onPreferences={handlePreferences}
          onSettings={handleSettings}
        />
        <section className="flex-1 relative flex flex-col min-h-0">
        <BrainActivity />
        </section>
        <RightPanel />
      </div>
    </main>
  );
}
