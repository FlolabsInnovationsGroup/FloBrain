"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Navbar({ isSidebarOpen, onToggleSidebar }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Chat Sidebar Toggle (Only shows when sidebar is closed) */}
          {!isSidebarOpen && onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="p-2 hover:bg-white/5 rounded-md transition-colors mr-2"
            >
              <Menu size={20} className="text-white" />
            </button>
          )}

          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-8 font-bold text-xl tracking-tighter">
              <img 
                src="/images/FloLabs_logo.svg" 
                alt="FloLabs' logo" 
                className="h-8 w-auto"
              />
              <span className="bg-gradient-to-r from-[#610081] to-[#702ACD] bg-clip-text text-transparent text-[35px]">FLOBRAIN</span>
            </Link>
          </div>
          
          {/* Desktop Navigation + Auth */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-4">
              <Link to="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Home</Link>
              <Link to="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
              <Link to="/brain" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Brain</Link>
              <Link to="/memory" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Memory</Link>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Link 
                to="/signin" 
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors border border-zinc-700 hover:border-zinc-600 rounded-md"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium bg-[#702ACD] text-white hover:bg-[#702ACD]/90 transition-colors rounded-md font-semibold"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link to="/" className="block px-3 py-2 text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/dashboard" className="block px-3 py-2 text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/brain" className="block px-3 py-2 text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>Brain</Link>
            <Link to="/memory" className="block px-3 py-2 text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>Memory</Link>
            
            {/* Mobile Auth Links */}
            <div className="border-t border-zinc-700 pt-2 mt-2">
              <Link to="/signin" className="block px-3 py-2 text-zinc-300 hover:text-white text-sm" onClick={() => setIsOpen(false)}>Sign In</Link>
              <Link to="/register" className="block px-3 py-2 text-sm font-semibold bg-[#702ACD] text-white hover:bg-[#702ACD]/90 transition-colors rounded-md mx-3 mt-1" onClick={() => setIsOpen(false)}>Register</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}