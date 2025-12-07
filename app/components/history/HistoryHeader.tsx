"use client";

import React from 'react';
import { RefreshCw, Search } from 'lucide-react';

interface Props {
  onRefresh: () => void;
}

export default function HistoryHeader({ onRefresh }: Props) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          Riwayat Simulasi
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Kelola status prospek dan pantau performa penjualan Anda.
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onRefresh} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 text-sm font-medium shadow-sm transition-all active:scale-95"
        >
            <RefreshCw className="w-4 h-4"/>
            <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}