// app/components/simulation/SimulationResult.tsx
"use client";

import React from 'react';
import { FileText, Calculator, Save, Loader2 } from 'lucide-react';
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
    <div className={`bg-white p-6 rounded shadow-lg border h-full flex flex-col ${form.mode === 'BUDGET' ? 'border-purple-200 ring-1 ring-purple-100' : 'border-slate-200'}`}>
      
      {/* Header Result */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${form.mode === 'BUDGET' ? 'text-purple-700' : 'text-slate-800'}`}>
                <FileText className="w-5 h-5"/> {form.mode === 'BUDGET' ? 'Hasil Simulasi Budget' : 'Hasil Simulasi Kredit'}
              </h3>
              {form.mode === 'BUDGET' && result && (
                  <p className="text-xs text-purple-500 mt-1">
                      *Rekomendasi DP: <b>{toIDR(result.dpAmount)} ({result.dpPercentCalc.toFixed(2)}%)</b> untuk mencapai target.
                  </p>
              )}
          </div>
          {result && (
              <div className="flex gap-2 items-center">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4"/>}
                    {isSaving ? 'Menyimpan...' : 'SIMPAN HASIL'}
                  </button>
                  
                  <div className={`px-3 py-1 rounded text-xs font-bold ${result.isSpecialScenario ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                      STAR {result.starLevel}
                  </div>
              </div>
          )}
      </div>

      {/* Content Result */}
      {!result ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
            <Calculator className="w-16 h-16 mb-4"/>
            <p>{form.mode === 'BUDGET' ? 'Masukkan Target & Tekan Hitung' : 'Masukkan Harga OTR'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b bg-slate-50">
                <td className="py-3 px-2 font-bold text-slate-700">Harga Kendaraan</td>
                <td className="py-3 px-2 font-bold text-right text-slate-900">{toIDR(result.vehiclePrice)}</td>
              </tr>
              <tr className={`border-b ${form.mode === 'BUDGET' ? 'bg-purple-50' : ''}`}>
                <td className="py-2 px-2 pl-4 text-slate-500">Uang Muka ({result.dpPercentCalc.toFixed(2)}%)</td>
                <td className="py-2 px-2 text-right font-bold text-slate-700">{toIDR(result.dpAmount)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-bold text-slate-700">Pokok Hutang Murni</td>
                <td className="py-3 px-2 font-bold text-right text-slate-900">{toIDR(result.principalPure)}</td>
              </tr>

              {/* AR */}
              <tr className="border-b">
                <td className="py-2 px-2 pl-4 text-slate-500 flex flex-col">
                    <span>Premi Asuransi ({toPct(result.insuranceRatePct)})</span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase">{form.selectedInsuranceLabel}</span>
                </td>
                <td className="py-2 px-2 text-right text-slate-500">{toIDR(result.insuranceAmount)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-2 pl-4 text-slate-500">+ Biaya Polis (AR)</td>
                <td className="py-2 px-2 text-right text-slate-500">{toIDR(result.policyFee)}</td>
              </tr>
              <tr className="border-b-2 border-blue-200 bg-blue-50">
                <td className="py-3 px-2 font-bold text-blue-800">Total AR (Awal)</td>
                <td className="py-3 px-2 font-bold text-right text-blue-800 text-lg">{toIDR(result.totalAR)}</td>
              </tr>

              {/* BUNGA */}
              <tr className="border-b">
                <td className="py-2 px-2 pl-4 text-slate-500">Bunga Flat ({toPct(result.interestRatePct)}/thn)</td>
                <td className="py-2 px-2 text-right text-slate-500">x {form.tenor} Bulan</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-2 pl-4 text-slate-500">Total Bunga</td>
                <td className="py-2 px-2 text-right font-medium">{toIDR(result.totalInterest)}</td>
              </tr>
              <tr className="border-b bg-slate-50">
                <td className="py-3 px-2 font-bold text-slate-700">Jumlah Hutang</td>
                <td className="py-3 px-2 font-bold text-right text-slate-900">{toIDR(result.totalLoan)}</td>
              </tr>
              <tr className="border-b bg-gray-50 border-gray-200">
                <td className="py-3 px-2 font-bold text-slate-600 italic">Nilai AP (Price - TDP)</td>
                <td className="py-3 px-2 font-bold text-right text-slate-600 italic">{toIDR(result.nilaiAP)}</td>
              </tr>

              {/* ANGSURAN */}
              <tr className={`border-b ${form.mode === 'BUDGET' && form.targetType === 'INSTALLMENT' ? 'bg-green-100' : 'bg-yellow-50'}`}>
                <td className="py-4 px-2 font-bold text-slate-800 text-lg">Angsuran per Bulan</td>
                <td className="py-4 px-2 font-bold text-right text-orange-600 text-2xl">{toIDR(result.monthlyInstallment)}</td>
              </tr>
              {result.isSpecialScenario && (
                 <tr><td colSpan={2} className="text-xs text-red-500 text-right font-bold pr-2">*Promo: Tenor dibagi {result.installmentDivisor}</td></tr>
              )}

              {/* TDP */}
              <tr><td colSpan={2} className="py-4"></td></tr>
              <tr className="bg-slate-800 text-white">
                <td colSpan={2} className="py-2 px-4 font-bold uppercase text-xs">Rincian Pembayaran Pertama (TDP)</td>
              </tr>
              <tr className="border-b">
                 <td className="py-2 px-4 text-slate-500">Uang Muka (DP)</td>
                 <td className="py-2 px-4 text-right font-medium">{toIDR(result.dpAmount)}</td>
              </tr>
              <tr className="border-b">
                 <td className="py-2 px-4 text-slate-500">Biaya Admin</td>
                 <td className="py-2 px-4 text-right font-medium">{toIDR(result.adminFee)}</td>
              </tr>
              <tr className="border-b">
                 <td className="py-2 px-4 text-slate-500">Biaya Polis (TDP)</td>
                 <td className="py-2 px-4 text-right font-medium">{toIDR(result.policyFeeTDP)}</td>
              </tr>
              {form.paymentType === 'ADDM' && (
                <tr className="border-b bg-yellow-50/50">
                   <td className="py-2 px-4 text-slate-500">Angsuran Pertama</td>
                   <td className="py-2 px-4 text-right font-medium">{toIDR(result.firstInstallment)}</td>
                </tr>
              )}
              <tr className={`bg-slate-100 ${form.mode === 'BUDGET' && form.targetType === 'TDP' ? 'bg-green-100' : ''}`}>
                 <td className="py-3 px-4 font-bold text-slate-800">TOTAL BAYAR (TDP)</td>
                 <td className="py-3 px-4 font-bold text-right text-slate-900 text-xl">{toIDR(result.totalDownPayment)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}