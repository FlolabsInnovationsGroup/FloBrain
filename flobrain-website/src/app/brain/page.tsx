'use client';


import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Header';

export default function BrainPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] text-white">
      <Sidebar 
        // Essential Props
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        
        // Dummy Props to fix the TypeScript error
        chatHistory={[]} 
        folders={[]} 
        currentChatId={null}
        onNewChat={() => {}} 
        onLoadChat={() => {}}
        onDeleteChat={() => {}}
        onRenameChat={() => {}}
        onClearAllChats={() => {}}
        onMoveToFolder={() => {}}
        onCreateFolder={() => {}}
        onDeleteFolder={() => {}}
        onRenameFolder={() => {}}
        onExportChat={() => {}}
      />

      <div className="flex flex-1 flex-col">
        <Navbar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Brain Page</h1>
            <p className="text-lg text-white/80 border-l-4 border-purple-500 pl-4 bg-white/5 py-4 rounded-lg">
              Brain Page content initialized. This page is now integrated with the project layout.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}