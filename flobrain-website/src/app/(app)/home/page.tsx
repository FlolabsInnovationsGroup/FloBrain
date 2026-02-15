"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Layers, ChevronLeft, ChevronRight, Sparkles, Terminal } from 'lucide-react';

// --- SUB-COMPONENT: STREAMING TEXT (GPT-STYLE) ---

const StreamingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    setDisplayedText(""); 
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 30); 
    
    return () => {
      clearInterval(interval);
    };
  }, [text]);

  return (
    <p className="text-xs leading-relaxed text-blue-100/80 font-mono italic">
      {displayedText}
      <motion.span 
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-1.5 h-3 ml-1 bg-blue-500 shadow-[0_0_8px_#3b82f6]" 
      />
    </p>
  );
};

export default function Brain() {
  const [brainState, setBrainState] = useState<'idle' | 'processing'>('idle');
  
  
  const [rightPanelView, setRightPanelView] = useState<'context' | 'activity'>('context');
  
  
  const [leftPanelExpanded, setLeftPanelExpanded] = useState(true);
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      {/* 1. HEADER: STATUS INDICATORS */}
      <nav className="border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-xl bg-slate-950/40 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Cpu size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">System.Core</h2>
            <p className="text-xs font-mono text-white tracking-widest uppercase">CAIPO_BRAIN_V1.0.4</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 shadow-inner">
            <div className={`w-2 h-2 rounded-full ${brainState === 'processing' ? 'bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-200">Model: GPT-4o</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. LEFT PANEL: WORKFLOW PROGRESSION */}
        <motion.aside 
          initial={false}
          animate={{ width: leftPanelExpanded ? "22rem" : "4.5rem" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="border-r border-white/5 bg-slate-900/10 relative backdrop-blur-sm"
        >
          <button 
            onClick={() => setLeftPanelExpanded(!leftPanelExpanded)}
            className="absolute -right-3 top-12 z-20 bg-slate-800 border border-slate-700 rounded-full p-1.5 hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-lg"
          >
            {leftPanelExpanded ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
          </button>

          <div className={`p-8 ${!leftPanelExpanded && "opacity-0 invisible"} transition-all duration-300`}>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-10 flex items-center gap-2 font-semibold">
              <Layers size={14} className="text-blue-500/70" /> Workflow Progression
            </h3>
            
            <div className="space-y-10 relative border-l border-slate-800/50 ml-2">
              {['Initialize Core', 'Load Memory Context', 'Neural Path Sync'].map((step, i) => {
                const isLast = i === 2;
                return (
                  <div key={step} className="pl-8 relative group">
                    <div className={`absolute -left-[6px] top-1 w-3 h-3 rounded-full border-2 transition-all duration-700 ${
                      isLast && brainState === 'processing' 
                        ? "bg-blue-500 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.9)] animate-pulse" 
                        : "bg-slate-950 border-slate-700"
                    }`} />
                    <p className={`text-xs font-mono transition-colors duration-500 ${
                      isLast && brainState === 'processing' ? "text-blue-400" : "text-slate-400"
                    }`}>
                      {step}
                    </p>
                    <p className="text-[9px] text-slate-600 uppercase mt-1 tracking-widest">
                      Status: {isLast && brainState === 'processing' ? "Active" : "Complete"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.aside>

        {/* 3. CENTRAL PANEL: ANIMATED PULSE & WAVEFORM */}
        <section className="flex-1 relative flex flex-col items-center justify-center">
          <motion.div
            animate={{
              scale: brainState === 'processing' ? [1, 1.2, 1] : [1, 1.05, 1],
              opacity: brainState === 'processing' ? [0.4, 0.7, 0.4] : 0.25,
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-[140px]"
          />

          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative z-10 cursor-pointer"
            onClick={() => setBrainState(brainState === 'idle' ? 'processing' : 'idle')}
          >
             <div className="w-80 h-80 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-2xl bg-white/[0.03] shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] hover:border-blue-500/30 transition-colors duration-700">
                <div className="text-center">
                  <motion.div
                    animate={brainState === 'processing' ? { 
                      y: [0, -6, 0],
                      scaleY: [1, 1.3, 1],
                      filter: ["drop-shadow(0 0 10px #3b82f688)", "drop-shadow(0 0 0px #3b82f600)"]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Activity 
                      className={`mx-auto mb-8 transition-colors duration-1000 ${
                        brainState === 'processing' ? 'text-blue-400' : 'text-slate-700'
                      }`} 
                      size={44} 
                    />
                  </motion.div>
                  <span className="text-[12px] tracking-[0.7em] uppercase text-white font-extralight block ml-2">
                    {brainState === 'processing' ? 'Synthesizing' : 'Core Idle'}
                  </span>
                </div>
             </div>
          </motion.div>
        </section>

        {/* 4. RIGHT PANEL: CONTEXT SUMMARY & VIEW SWITCHING */}
        <motion.aside 
          initial={false}
          animate={{ width: rightPanelExpanded ? "22rem" : "4.5rem" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="border-l border-white/5 bg-slate-900/20 relative backdrop-blur-sm"
        >
          <button 
            onClick={() => setRightPanelExpanded(!rightPanelExpanded)}
            className="absolute -left-3 top-12 z-20 bg-slate-800 border border-slate-700 rounded-full p-1.5 hover:text-blue-400 hover:border-blue-500/50 transition-all shadow-lg"
          >
            {rightPanelExpanded ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
          </button>

          <div className={`p-8 ${!rightPanelExpanded && "opacity-0 invisible"} transition-all duration-300`}>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-10 flex items-center gap-2 font-semibold">
              {rightPanelView === 'context' ? <Sparkles size={14} className="text-blue-400/70" /> : <Terminal size={14} className="text-emerald-400/70" />}
              {rightPanelView === 'context' ? "Neural Context" : "System Activity"}
            </h3>
            
            {/* View Switching Container */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[220px] shadow-inner relative overflow-hidden group hover:border-blue-500/20 transition-colors">
              <AnimatePresence mode="wait">
                {rightPanelView === 'context' ? (
                  <motion.div 
                    key="context"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="min-h-[140px]"
                  >
                    <p className="text-[10px] font-mono text-blue-500/60 mb-4 tracking-widest uppercase">{"\u002F\u002F"}Live_Stream</p>
                    {brainState === 'processing' ? (
                      <StreamingText text="Interpreting local hardware signals... Synchronizing with caipo-robotics module... Context window expanding to include environmental variables... Neural pathways optimized." />
                    ) : (
                      <p className="text-xs italic opacity-50 font-light font-mono text-slate-500">{"\u002F\u002F"}Waiting for system trigger...</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="activity"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="min-h-[140px]"
                  >
                    <p className="text-[10px] font-mono text-emerald-500/60 mb-4 tracking-widest uppercase">{"\u002F\u002F"}System_Logs</p>
                    <div className="space-y-3 text-[10px] font-mono text-slate-500 uppercase">
                      <p className="flex justify-between"><span>CPU_Usage</span> <span className="text-slate-300">12.4%</span></p>
                      <p className="flex justify-between"><span>Memory_Link</span> <span className="text-emerald-400">Stable</span></p>
                      <p className="flex justify-between"><span>Latency</span> <span className="text-slate-300">4ms</span></p>
                      <p className="flex justify-between"><span>Uptime</span> <span className="text-slate-300">00:42:12</span></p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Switching Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setRightPanelView('context')}
                className={`text-[9px] font-bold tracking-widest border p-2.5 rounded-lg transition-all ${
                  rightPanelView === 'context' ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]" : "border-slate-800 hover:bg-slate-800 text-slate-500"
                }`}
              >
                CONTEXT
              </button>
              <button 
                onClick={() => setRightPanelView('activity')}
                className={`text-[9px] font-bold tracking-widest border p-2.5 rounded-lg transition-all ${
                  rightPanelView === 'activity' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "border-slate-800 hover:bg-slate-800 text-slate-500"
                }`}
              >
                ACTIVITY
              </button>
            </div>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}