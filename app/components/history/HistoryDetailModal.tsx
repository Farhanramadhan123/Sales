"use client";

import React from 'react';
import { FileText, X } from 'lucide-react';
import { HistoryItem } from '@/app/types/history';

interface Props {
  item: HistoryItem | null;
  onClose: () => void;
}

// Helper Formatters
const toIDR = (num: number | null | undefined) => {
  if (num == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};
const toPct = (num: number | null | undefined) => num ? (num * 100).toFixed(3) + '%' : '0%';

const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-700 border-green-200';
      case 'PROGRES': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJECT': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
};

export default function HistoryDetailModal({ item, onClose }: Props) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-200">
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600"/> Rincian Simulasi
                    </h3>
                    <p className="text-xs text-slate-500">{item.unitName} - {item.borrowerName}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
                >
                    <X className="w-6 h-6"/>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <div className={`px-4 py-2 rounded text-center text-xs font-bold border ${getStatusColor(item.status)}`}>
                    STATUS: {item.status}
                </div>

                <table className="w-full text-sm border-collapse">
                    <tbody>
                        <tr className="border-b bg-slate-50">
                            <td className="py-3 px-2 font-bold text-slate-700">Harga Kendaraan</td>
                            <td className="py-3 px-2 font-bold text-right text-slate-900">{toIDR(item.vehiclePrice)}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-2 pl-4 text-slate-500">Uang Muka ({item.dpPercent}%)</td>
                            <td className="py-2 px-2 text-right font-bold text-slate-700">{toIDR(item.dpAmount)}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-2 font-bold text-slate-700">Pokok Hutang Murni</td>
                            <td className="py-3 px-2 font-bold text-right text-slate-900">{toIDR(item.principalPure)}</td>
                        </tr>

                        {/* Asuransi & AR */}
                        <tr className="border-b">
                            <td className="py-2 px-2 pl-4 text-slate-500 flex flex-col">
                                <span>Premi Asuransi ({toPct(item.insuranceRate)})</span>
                                <span className="text-[10px] text-blue-600 font-bold uppercase">{item.insuranceLabel || '-'}</span>
                            </td>
                            <td className="py-2 px-2 text-right text-slate-500">{toIDR(item.insuranceAmount)}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-2 pl-4 text-slate-500">+ Biaya Polis (AR)</td>
                            <td className="py-2 px-2 text-right text-slate-500">{toIDR(item.policyFee)}</td>
                        </tr>
                        <tr className="border-b-2 border-blue-200 bg-blue-50">
                            <td className="py-3 px-2 font-bold text-blue-800">Total AR (Awal)</td>
                            <td className="py-3 px-2 font-bold text-right text-blue-800 text-lg">{toIDR(item.totalAR)}</td>
                        </tr>

                        {/* Bunga & PH */}
                        <tr className="border-b">
                            <td className="py-2 px-2 pl-4 text-slate-500">Bunga Flat ({toPct(item.interestRate)}/thn)</td>
                            <td className="py-2 px-2 text-right text-slate-500">x {item.tenor} Bulan</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-2 pl-4 text-slate-500">Total Bunga</td>
                            <td className="py-2 px-2 text-right font-medium">{toIDR(item.totalInterest)}</td>
                        </tr>
                        <tr className="border-b bg-slate-50">
                            <td className="py-3 px-2 font-bold text-slate-700">Jumlah Hutang</td>
                            <td className="py-3 px-2 font-bold text-right text-slate-900">{toIDR(item.totalLoan)}</td>
                        </tr>
                        <tr className="border-b bg-gray-50 border-gray-200">
                            <td className="py-3 px-2 font-bold text-slate-600 italic">Nilai AP (Price - TDP)</td>
                            <td className="py-3 px-2 font-bold text-right text-slate-600 italic">{toIDR(item.nilaiAP)}</td>
                        </tr>

                        {/* Angsuran */}
                        <tr className="border-b bg-yellow-50">
                            <td className="py-4 px-2 font-bold text-slate-800 text-lg">Angsuran per Bulan</td>
                            <td className="py-4 px-2 font-bold text-right text-orange-600 text-2xl">{toIDR(item.monthlyPayment)}</td>
                        </tr>

                        {/* TDP */}
                        <tr><td colSpan={2} className="py-4"></td></tr>
                        <tr className="bg-slate-800 text-white">
                            <td colSpan={2} className="py-2 px-4 font-bold uppercase text-xs">Rincian Pembayaran Pertama (TDP)</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-4 text-slate-500">Uang Muka (DP)</td>
                            <td className="py-2 px-4 text-right font-medium">{toIDR(item.dpAmount)}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-4 text-slate-500">Biaya Admin</td>
                            <td className="py-2 px-4 text-right font-medium">{toIDR(item.adminFee)}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2 px-4 text-slate-500">Biaya Polis (TDP)</td>
                            <td className="py-2 px-4 text-right font-medium">{toIDR(item.policyFeeTDP)}</td>
                        </tr>
                        {item.paymentType === 'ADDM' && (
                            <tr className="border-b bg-yellow-50/50">
                                <td className="py-2 px-4 text-slate-500">Angsuran Pertama</td>
                                <td className="py-2 px-4 text-right font-medium">{toIDR(item.firstInstallment)}</td>
                            </tr>
                        )}
                        <tr className="bg-slate-100">
                            <td className="py-3 px-4 font-bold text-slate-800">TOTAL BAYAR (TDP)</td>
                            <td className="py-3 px-4 font-bold text-right text-slate-900 text-xl">{toIDR(item.totalFirstPay)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}