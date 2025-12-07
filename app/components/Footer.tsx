"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Sembunyikan footer di halaman login
  if (pathname === '/pages/login') {
    return null;
  }

  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-center items-center">
        <div className="text-slate-500 text-sm text-center">
          &copy; {new Date().getFullYear()} Gaspol System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}