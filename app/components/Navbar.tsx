import Link from 'next/link';
import { Calculator, History } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg tracking-tight">Setir Kanan Assist</span>
          </div>
          <div className="flex space-x-4">
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
        </div>
      </div>
    </nav>
  );
}