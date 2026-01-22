"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, BrainCircuit } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <BrainCircuit className="text-[var(--color-brain)]" />
              <span className="text-white">CAIPO</span>
            </Link>
          </div>
          
          {/* Desktop Navigation + Auth */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-baseline space-x-4">
              <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
              <Link href="/brain" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Brain</Link>
              <Link href="/memory" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Memory</Link>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Link 
                href="/signin" 
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors border border-zinc-700 hover:border-zinc-600 rounded-md"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 text-sm font-medium bg-[var(--color-brain)] text-black hover:bg-[var(--color-brain)]/90 transition-colors rounded-md font-semibold"
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
            <Link href="/dashboard" className="block px-3 py-2 text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link href="/brain" className="block px-3 py-2 text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>Brain</Link>
            <Link href="/memory" className="block px-3 py-2 text-zinc-300 hover:text-white" onClick={() => setIsOpen(false)}>Memory</Link>
            
            {/* Mobile Auth Links */}
            <div className="border-t border-zinc-700 pt-2 mt-2">
              <Link href="/signin" className="block px-3 py-2 text-zinc-300 hover:text-white text-sm" onClick={() => setIsOpen(false)}>Sign In</Link>
              <Link href="/register" className="block px-3 py-2 text-sm font-semibold bg-[var(--color-brain)] text-black hover:bg-[var(--color-brain)]/90 transition-colors rounded-md mx-3 mt-1" onClick={() => setIsOpen(false)}>Register</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
