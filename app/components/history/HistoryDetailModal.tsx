"use client";

import React, { useMemo } from 'react';
import { FileText, X, Paperclip, Download, ChevronDown } from 'lucide-react';
import { HistoryItem } from '@/app/types/history';
import { AttachmentItem } from '@/app/types/simulation';

interface Props {
  item: HistoryItem | null;
  onClose: () => void;
}

const toIDR = (num: number | null | undefined) => {
  if (num == null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};
const toPct = (num: number | null | undefined) => num ? (num * 100).toFixed(3) + '%' : '0%';

const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PROGRES': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJECT': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
};

export default function HistoryDetailModal({ item, onClose }: Props) {
  // Parse attachment string (JSON) menjadi array object
  const attachments: AttachmentItem[] = useMemo(() => {
    if (!item || !item.attachments) return [];
    try {
        return JSON.parse(item.attachments);
    } catch (e) {
        console.error("Gagal parse attachments", e);
        return [];
    }
  }, [item]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Modal Container */}
        <div className="bg-white w-full md:w-full md:max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl md:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-3xl md:rounded-t-2xl sticky top-0 z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600"/> Rincian Simulasi
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.unitName} - {item.borrowerName}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-500"
                >
                    <X className="w-5 h-5"/>
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* Status Badge */}
                <div className="flex justify-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(item.status)}`}>
                        STATUS: {item.status}
                    </span>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Harga Kendaraan</div>
                        <div className="font-bold text-slate-900 text-lg">{toIDR(item.vehiclePrice)}</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-xs text-emerald-600 mb-1">Total Bayar (TDP)</div>
                        <div className="font-bold text-emerald-800 text-lg">{toIDR(item.totalFirstPay)}</div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-100">
                            <tr className="bg-slate-50/50">
                                <td className="py-3 px-4 text-slate-600">Uang Muka ({item.dpPercent}%)</td>
                                <td className="py-3 px-4 text-right font-semibold text-slate-900">{toIDR(item.dpAmount)}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-slate-600">Pokok Hutang</td>
                                <td className="py-3 px-4 text-right font-semibold text-slate-900">{toIDR(item.principalPure)}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-slate-600">
                                    <div className="flex flex-col">
                                        <span>Asuransi ({toPct(item.insuranceRate)})</span>
                                        <span className="text-[10px] text-blue-500 font-bold uppercase">{item.insuranceLabel || '-'}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right text-slate-600">{toIDR(item.insuranceAmount)}</td>
                            </tr>
                            <tr className="bg-blue-50/30">
                                <td className="py-3 px-4 font-medium text-blue-800">Total AR</td>
                                <td className="py-3 px-4 text-right font-bold text-blue-800">{toIDR(item.totalAR)}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-slate-600">Bunga Flat ({toPct(item.interestRate)})</td>
                                <td className="py-3 px-4 text-right text-slate-600">x {item.tenor} Bulan</td>
                            </tr>
                            <tr className="bg-yellow-50">
                                <td className="py-4 px-4 font-bold text-slate-800">Angsuran per Bulan</td>
                                <td className="py-4 px-4 text-right font-bold text-orange-600 text-xl">{toIDR(item.monthlyPayment)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* TDP Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rincian Pembayaran Pertama</h4>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Uang Muka (DP)</span>
                            <span className="font-medium text-slate-700">{toIDR(item.dpAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Biaya Admin</span>
                            <span className="font-medium text-slate-700">{toIDR(item.adminFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Biaya Polis</span>
                            <span className="font-medium text-slate-700">{toIDR(item.policyFeeTDP)}</span>
                        </div>
                        {item.paymentType === 'ADDM' && (
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                                <span className="text-slate-500">Angsuran Pertama</span>
                                <span className="font-medium text-slate-700">{toIDR(item.firstInstallment)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base pt-2 border-t border-slate-200 mt-2">
                            <span className="font-bold text-slate-800">Total Bayar</span>
                            <span className="font-bold text-emerald-600">{toIDR(item.totalFirstPay)}</span>
                        </div>
                    </div>
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Paperclip className="w-3 h-3"/> Lampiran
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {attachments.map((file, idx) => (
                                <a 
                                    key={idx} 
                                    href={file.base64} 
                                    download={file.name}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText className="w-4 h-4"/> 
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                                            <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition"/>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer (Close Button for Mobile) */}
            <div className="p-4 border-t border-slate-100 md:hidden">
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold active:scale-[0.98] transition"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
  );
}