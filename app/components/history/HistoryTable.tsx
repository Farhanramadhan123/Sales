"use client";

import React from 'react';
import { User, Eye, Loader2 } from 'lucide-react';
import { HistoryItem } from '@/app/types/history';

interface Props {
  data: HistoryItem[];
  isLoading: boolean;
  updatingId: number | null;
  handleStatusChange: (id: number, status: string) => void;
  setSelectedItem: (item: HistoryItem) => void;
}

// --- Helpers Formatting ---
const toIDR = (num: number | null | undefined) => {
  if (num == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

const formatDate = (str: string) => new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DONE': return 'bg-green-100 text-green-700 border-green-200';
    case 'PROGRES': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'REJECT': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

export default function HistoryTable({ data, isLoading, updatingId, handleStatusChange, setSelectedItem }: Props) {
  
  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-blue-500"/></div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-20 text-slate-400 bg-white rounded shadow border border-dashed">Belum ada data tersimpan.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-center">Detail</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Nasabah</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3 text-right">Harga OTR</th>
              <th className="px-4 py-3 text-right">TDP</th>
              <th className="px-4 py-3 text-right">Angsuran</th>
              <th className="px-4 py-3 text-center w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition group">
                {/* Tombol Detail */}
                <td className="px-4 py-3 text-center">
                    <button 
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm border border-blue-100"
                        title="Lihat Rincian"
                    >
                        <Eye className="w-4 h-4"/>
                    </button>
                </td>
                
                {/* Tanggal */}
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>

                {/* Nasabah */}
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-800">{item.borrowerName}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3"/> Sales: {item.salesName || '-'}
                  </div>
                </td>

                {/* Unit */}
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-700">{item.unitName}</div>
                  <div className="text-[10px] text-slate-400">{item.tenor} Bulan • DP {item.dpPercent}%</div>
                </td>

                {/* Angka-angka */}
                <td className="px-4 py-3 text-right font-medium text-slate-600">{toIDR(item.vehiclePrice)}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600">{toIDR(item.totalFirstPay)}</td>
                <td className="px-4 py-3 text-right font-bold text-orange-600">{toIDR(item.monthlyPayment)}</td>

                {/* Status Dropdown */}
                <td className="px-4 py-3 text-center">
                  <div className="relative">
                    {updatingId === item.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded">
                            <Loader2 className="w-3 h-3 animate-spin text-slate-600"/>
                        </div>
                    )}
                    <select 
                        value={item.status} 
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`w-full text-[10px] font-bold py-1 px-2 rounded border appearance-none cursor-pointer text-center focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${getStatusColor(item.status)}`}
                    >
                        <option value="TODO">TODO</option>
                        <option value="PROGRES">PROGRES</option>
                        <option value="DONE">DONE</option>
                        <option value="REJECT">REJECT</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}