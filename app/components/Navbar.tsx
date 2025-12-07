// app/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, History, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Jangan tampilkan navbar di halaman login
  if (pathname === '/pages/login') {
    return null;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      {/* Desktop Navbar (Hidden on Mobile) */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#020c20] border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="/GASPOL.png?v=3" 
                  alt="Gaspol Logo" 
                  className="relative w-12 h-12 object-contain" 
                />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                GASPOL System
              </span>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <div className="flex items-center bg-blue-950/30 p-1.5 rounded-full border border-blue-900/20">
                <Link 
                  href="/pages/simulation" 
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive('/pages/simulation') 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  Simulasi
                </Link>
                <Link 
                  href="/pages/history" 
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive('/pages/history') 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </Link>
              </div>

              {/* User Profile */}
              {user && (
                <div className="flex items-center gap-5 pl-5 border-l border-blue-900/30">
                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{user.role}</div>
                    <div className="text-sm text-blue-100 font-medium">{user.name}</div>
                  </div>
                  <button 
                    onClick={logout}
                    className="group p-2.5 bg-blue-950/30 rounded-full border border-blue-900/20 hover:border-red-500/50 hover:bg-red-950/30 transition-all duration-300"
                    title="Keluar"
                  >
                    <LogOut className="w-5 h-5 text-blue-300 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar (Logo Only) */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#020c20] border-b border-blue-900/20 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/GASPOL.png?v=3" 
            alt="Gaspol Logo" 
            className="w-8 h-8 object-contain" 
          />
          <span className="font-bold text-lg tracking-tight text-white">GASPOL!</span>
        </div>
        {user && (
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-800">
                <span className="text-xs font-bold text-blue-400">{user.name.charAt(0)}</span>
             </div>
           </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          <Link 
            href="/pages/simulation" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/pages/simulation') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive('/pages/simulation') ? 'bg-blue-50' : ''}`}>
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Simulasi</span>
          </Link>

          <Link 
            href="/pages/history" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/pages/history') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive('/pages/history') ? 'bg-blue-50' : ''}`}>
              <History className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">History</span>
          </Link>

          <button 
            onClick={logout}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-red-500"
          >
            <div className="p-1.5 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Keluar</span>
          </button>
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden behind fixed navbars */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}