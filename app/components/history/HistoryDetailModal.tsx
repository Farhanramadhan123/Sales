// app/components/history/HistoryDetailModal.tsx
"use client";

import React, { useMemo } from 'react';
import { FileText, X, Paperclip, Download } from 'lucide-react';
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
      case 'DONE': return 'bg-green-100 text-green-700 border-green-200';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-200">
            
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

                        <tr className="border-b bg-yellow-50">
                            <td className="py-4 px-2 font-bold text-slate-800 text-lg">Angsuran per Bulan</td>
                            <td className="py-4 px-2 font-bold text-right text-orange-600 text-2xl">{toIDR(item.monthlyPayment)}</td>
                        </tr>

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

                        {/* LAMPIRAN DOKUMEN (FROM DB BASE64) */}
                        <tr><td colSpan={2} className="py-4"></td></tr>
                        <tr className="bg-blue-50 border-t border-blue-100">
                            <td colSpan={2} className="py-2 px-4 font-bold uppercase text-xs text-blue-800 flex items-center gap-1">
                                <Paperclip className="w-3 h-3"/> Lampiran Dokumen
                            </td>
                        </tr>
                        <tr className="bg-white">
                            <td colSpan={2} className="p-4">
                                {attachments.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {attachments.map((file, idx) => (
                                            <a 
                                                key={idx} 
                                                href={file.base64} // Link langsung ke Base64 Data URI
                                                download={file.name} // Browser akan download dengan nama ini
                                                className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded border border-slate-100 hover:bg-slate-100 transition group"
                                            >
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <FileText className="w-4 h-4 text-blue-500"/> 
                                                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                                                    <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                                                </div>
                                                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600"/>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-xs italic text-center">Tidak ada lampiran dokumen.</div>
                                )}
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}