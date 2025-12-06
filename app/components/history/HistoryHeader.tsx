"use client";

import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

interface Props {
  onRefresh: () => void;
}

export default function HistoryHeader({ onRefresh }: Props) {
  return (
    <div className="mb-6 flex justify-between items-end">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600"/> Riwayat Simulasi
        </h1>
        <p className="text-slate-500 text-sm">
          Kelola status prospek dan lihat rincian hitungan.
        </p>
      </div>
      <button 
        onClick={onRefresh} 
        className="p-2 bg-white border rounded hover:bg-slate-50 text-slate-500 shadow-sm transition-all active:scale-95"
        title="Refresh Data"
      >
          <RefreshCw className="w-4 h-4"/>
      </button>
    </div>
  );
}