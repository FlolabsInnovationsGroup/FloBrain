"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { Menu, X } from "lucide-react";
import FlolabsLogo from "@/assets/images/flolabs-logo.svg"; 
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Logic: Are we inside the app or on the landing page?
  const isAppRoute = pathname.startsWith("/home") || 
                     pathname.startsWith("/dashboard") || 
                     pathname.startsWith("/brain") || 
                     pathname.startsWith("/memory");

  return (
    <nav className="w-full backdrop-blur-md sticky top-0 z-50 border-b border-zinc-800/50 bg-[#020617]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Logo (Always visible) */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-4">
              <Image 
                src={FlolabsLogo} 
                alt="Logo" 
                className="h-8 w-auto" 
                priority 
              />
              <span className="bg-gradient-to-r from-[#610081] to-[#702ACD] bg-clip-text text-transparent text-[28px] font-bold tracking-tighter">
                FLOBRAIN
              </span>
            </Link>
          </div>
          
          {/* RIGHT: Conditional Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* LOGGED IN VIEW: Only show Home, Dashboard, Brain if inside the app */}
            {isAppRoute ? (
              <div className="flex items-baseline space-x-6 text-zinc-400">
                <Link href="/home" className="hover:text-white transition-colors text-sm font-medium">Home</Link>
                <Link href="/dashboard" className="hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
                <Link href="/brain" className="hover:text-white transition-colors text-sm font-medium">Brain</Link>
                {/* You could add a 'Sign Out' button here later */}
              </div>
            ) : (
              /* LOGGED OUT VIEW: Only show Sign In and Register on the landing page */
              <div className="flex items-center gap-4">
                <Link href="/signin" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2.5 text-sm font-semibold bg-[#9333ea] text-white rounded-xl hover:bg-[#a855f7] transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Same logic as Desktop) */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-zinc-800 p-4 space-y-4">
          {isAppRoute ? (
            <>
              <Link href="/home" className="block text-zinc-300" onClick={() => setIsOpen(false)}>Home</Link>
              <Link href="/dashboard" className="block text-zinc-300" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link href="/brain" className="block text-zinc-300" onClick={() => setIsOpen(false)}>Brain</Link>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/signin" className="text-zinc-300" onClick={() => setIsOpen(false)}>Sign In</Link>
              <Link href="/register" className="bg-[#9333ea] text-white p-3 rounded-lg text-center" onClick={() => setIsOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}