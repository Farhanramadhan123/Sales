// app/components/simulation/SimulationResult.tsx
"use client";

import React from 'react';
import { FileText, Calculator, Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CalculationResult, SimulationForm } from '@/app/types/simulation';

interface Props {
  result: CalculationResult | null;
  form: SimulationForm;
  handleSave: () => void;
  isSaving: boolean;
}

const toIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
const toPct = (num: number) => (num * 100).toFixed(3) + '%';

export default function SimulationResult({ result, form, handleSave, isSaving }: Props) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col transition-all duration-300 ${form.mode === 'BUDGET' ? 'border-purple-100 shadow-purple-100' : 'border-slate-100 shadow-slate-200/50'}`}>
      
      {/* Header Result */}
      <div className={`px-6 py-5 border-b flex justify-between items-start ${form.mode === 'BUDGET' ? 'bg-purple-50/30 border-purple-100' : 'bg-slate-50/50 border-slate-100'}`}>
          <div>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${form.mode === 'BUDGET' ? 'text-purple-700' : 'text-slate-800'}`}>
                <FileText className="w-5 h-5"/> {form.mode === 'BUDGET' ? 'Hasil Simulasi Budget' : 'Hasil Simulasi Kredit'}
              </h3>
              {form.mode === 'BUDGET' && result ? (
                  <p className="text-xs text-purple-600 mt-1.5 bg-purple-100 px-2 py-1 rounded-md inline-block font-medium">
                      Rekomendasi DP: <b>{toIDR(result.dpAmount)} ({result.dpPercentCalc.toFixed(2)}%)</b>
                  </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Rincian perhitungan kredit kendaraan</p>
              )}
          </div>
          {result && (
              <div className="flex flex-col items-end gap-2">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${result.isSpecialScenario ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                      {result.isSpecialScenario && <AlertTriangle className="w-3 h-3"/>}
                      STAR {result.starLevel}
                  </div>
              </div>
          )}
      </div>

      {/* Content Result */}
      {!result ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-300 min-h-[400px]">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Calculator className="w-10 h-10 text-slate-300"/>
            </div>
            <p className="text-slate-400 font-medium text-center max-w-xs">
              {form.mode === 'BUDGET' ? 'Masukkan target budget Anda dan tekan tombol hitung' : 'Masukkan Harga OTR dan parameter lainnya untuk melihat hasil'}
            </p>
        </div>
      ) : (
        <div className="flex flex-col">
          
          {/* Detail Table */}
          <div className="p-6">
            <div className="border rounded-none overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 px-4 text-slate-700 font-bold">Harga Kendaraan</td>
                    <td className="py-3 px-4 font-bold text-right text-slate-800">{toIDR(result.vehiclePrice)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-500">Uang Muka ({result.dpPercentCalc.toFixed(2)}%)</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">{toIDR(result.dpAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 font-bold">Pokok Hutang Murni</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">{toIDR(result.principalPure)}</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 text-slate-500">
                        <div className="flex flex-col">
                          <span>Premi Asuransi ({toPct(result.insuranceRatePct)})</span>
                          <span className="text-[10px] text-blue-600 font-bold uppercase mt-0.5">{form.selectedInsuranceLabel}</span>
                        </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">{toIDR(result.insuranceAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-500">+ Biaya Polis (AR)</td>
                    <td className="py-3 px-4 text-right text-slate-600">{toIDR(result.policyFee)}</td>
                  </tr>

                  {/* Total AR Row - Blue Highlight */}
                  <tr className="bg-blue-50/50 border-t-2 border-blue-100">
                    <td className="py-3 px-4 text-blue-800 font-bold">Total AR (Awal)</td>
                    <td className="py-3 px-4 text-right text-blue-800 font-bold text-lg">{toIDR(result.totalAR)}</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-4 text-slate-500">Bunga Flat ({toPct(result.interestRatePct)}/thn)</td>
                    <td className="py-3 px-4 text-right text-slate-600">x {form.tenor} Bulan</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-500">Total Bunga</td>
                    <td className="py-3 px-4 text-right text-slate-600">{toIDR(result.totalInterest)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-700 font-bold">Jumlah Hutang</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">{toIDR(result.totalLoan)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-500 italic">Nilai AP (Price - TDP)</td>
                    <td className="py-3 px-4 text-right text-slate-500 italic">{toIDR(result.nilaiAP)}</td>
                  </tr>

                  {/* Angsuran Highlight */}
                  <tr className="bg-orange-50 border-y-2 border-orange-100">
                    <td className="py-3 px-3 lg:py-4 lg:px-4 text-slate-800 font-bold text-sm lg:text-lg">Angsuran per Bulan</td>
                    <td className="py-3 px-3 lg:py-4 lg:px-4 text-right text-orange-600 font-bold text-lg lg:text-2xl">{toIDR(result.monthlyInstallment)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-1 px-4 text-right text-[10px] text-red-500 font-medium">*Promo: Tenor dibagi 10</td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* TDP Section - Separated */}
            <div className="mt-8 border rounded-none overflow-hidden">
                <div className="bg-slate-800 text-white py-2 px-4 text-xs font-bold uppercase tracking-wider">
                    RINCIAN PEMBAYARAN PERTAMA (TDP)
                </div>
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-200">
                        <tr>
                            <td className="py-3 px-4 text-slate-500">Uang Muka (DP)</td>
                            <td className="py-3 px-4 text-right font-medium text-slate-700">{toIDR(result.dpAmount)}</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 text-slate-500">Biaya Admin</td>
                            <td className="py-3 px-4 text-right font-medium text-slate-700">{toIDR(result.adminFee)}</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 text-slate-500">Biaya Polis (TDP)</td>
                            <td className="py-3 px-4 text-right font-medium text-slate-700">{toIDR(result.policyFeeTDP)}</td>
                        </tr>
                        {form.paymentType === 'ADDM' && (
                            <tr>
                                <td className="py-3 px-4 text-slate-500">Angsuran Pertama (ADDM)</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-700">{toIDR(result.firstInstallment)}</td>
                            </tr>
                        )}
                        <tr className="bg-green-100">
                            <td className="py-4 px-4 text-green-800 font-bold">TOTAL BAYAR (TDP)</td>
                            <td className="py-4 px-4 text-right text-green-900 font-bold text-xl">{toIDR(result.totalDownPayment)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4"/>}
              {isSaving ? 'Menyimpan...' : 'Simpan Simulasi'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}