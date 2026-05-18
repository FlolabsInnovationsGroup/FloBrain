"use client";

import { useCallback, useState } from "react";
import { BrainActivity } from "./components/brain-activity";
import { LeftPanel } from "./components/left-panel";
import { RightPanel } from "./components/right-panel";
import type { SystemModuleId } from "./components/left-panel";

export function HomeDashboard() {
  const [activeModuleId, setActiveModuleId] = useState<SystemModuleId>("brain-activity");

  const handleModuleSelect = useCallback((id: SystemModuleId) => {
    setActiveModuleId(id);
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
    <main className="home-dashboard mx-auto mt-3 flex h-[100vh] w-[92%] flex-col overflow-hidden bg-[linear-gradient(90deg,#290036_0%,#070014_100%)] font-[Inter] text-slate-300">
      <div className="relative flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div className="home-dash-left flex h-full w-[20%] shrink-0 self-stretch">
          <LeftPanel
            variant="modules"
            className="h-full w-full min-h-0"
            activeModuleId={activeModuleId}
            onModuleSelect={handleModuleSelect}
            onNewChat={handleNewChat}
            onSearch={handleSearch}
            onPreferences={handlePreferences}
            onSettings={handleSettings}
          />
        </div>
        <section className="home-dash-main relative flex min-h-0 min-w-0 flex-1 flex-col">
          <BrainActivity />
        </section>
        <div className="home-dash-right flex h-full shrink-0 self-stretch">
          <RightPanel />
        </div>
      </div>
    </main>
  );
}
