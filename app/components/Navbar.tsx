// app/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { Calculator, History, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg tracking-tight">Setir Kanan Assist</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex space-x-2">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition"
              >
                <Calculator className="w-4 h-4" />
                Simulasi
              </Link>
              <Link 
                href="/history" 
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition"
              >
                <History className="w-4 h-4" />
                History
              </Link>
            </div>

            {user && (
              <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-blue-400">{user.role}</div>
                  <div className="text-xs text-slate-300">{user.name}</div>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 bg-slate-800 rounded-full hover:bg-red-900/50 hover:text-red-400 transition"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}