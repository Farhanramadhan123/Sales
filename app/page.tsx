"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, Car, Calculator, FileText, CheckCircle, 
  AlertCircle, Loader2, RefreshCw, Shield, Truck, Bus, Search 
} from 'lucide-react';

// ============================================================================
// 1. TIPE DATA
// ============================================================================

interface DbInterest {
  id: number;
  category: string;
  paymentType: string;
  star: number;
  tenor: number; 
  rate: number;
}

interface DbInsurance {
  id: number;
  category: string;
  tenor: number; 
  label: string;
  minPrice: number;
  maxPrice: number;
  rate: number;
}

interface AppData {
  interestRates: DbInterest[];
  insuranceRates: DbInsurance[];
}

interface SimulationForm {
  // Mode
  mode: 'NORMAL' | 'BUDGET';
  targetType: 'TDP' | 'INSTALLMENT';
  targetValue: number;

  // Nasabah
  borrowerName: string;
  coBorrowerName: string;
  salesName: string;
  status: string; 

  // Unit
  unitName: string;
  nopol: string;
  category: 'PASSENGER' | 'COMMERCIAL';
  subCategory: 'PASSENGER' | 'TRUCK' | 'BUS'; 
  isLoadingUnit: boolean; 
  price: number;
  
  // Kredit
  dpPercent: number;
  tenor: number;
  paymentType: 'ADDB' | 'ADDM';
  adminFee: number;
  selectedInsuranceLabel: string;
}

interface CalculationResult {
  starLevel: number;
  interestRatePct: number;
  insuranceRatePct: number;
  
  vehiclePrice: number;
  dpAmount: number;
  dpPercentCalc: number; // Hasil DP (bisa beda dgn input di mode budget)
  principalPure: number;
  insuranceAmount: number;
  policyFee: number;
  
  totalAR: number;
  totalInterest: number;
  totalLoan: number;
  monthlyInstallment: number;
  
  adminFee: number;
  policyFeeTDP: number;
  firstInstallment: number;
  totalDownPayment: number;
  
  nilaiAP: number;
  installmentDivisor: number;
  isSpecialScenario: boolean;
}

// ============================================================================
// 2. KOMPONEN UTAMA
// ============================================================================

export default function CreditSimulation() {
  
  const [dbData, setDbData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<SimulationForm>({
    mode: 'NORMAL',
    targetType: 'TDP',
    targetValue: 0,
    borrowerName: '',
    coBorrowerName: '',
    salesName: '',
    status: 'TODO', 
    unitName: '',
    nopol: '',
    category: 'PASSENGER',
    subCategory: 'PASSENGER', 
    isLoadingUnit: false,
    price: 0,
    dpPercent: 20,
    tenor: 12,
    paymentType: 'ADDB',
    adminFee: 3000000, 
    selectedInsuranceLabel: ''
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  // Helper Pembulatan
  const roundVal = (num: number, multiple: number, direction: 'round' | 'ceil' = 'round') => {
    if (direction === 'ceil') return Math.ceil(num / multiple) * multiple;
    return Math.round(num / multiple) * multiple;
  };

  const toIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  const toPct = (num: number) => (num * 100).toFixed(3) + '%';

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/rates'); 
        if (!res.ok) throw new Error('Gagal mengambil data dari Database');
        const data = await res.json();
        setDbData(data);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. LOGIKA PILIHAN & FILTER ---
  const availableTenors = useMemo(() => {
    if (form.category === 'COMMERCIAL') return [12, 24, 36, 48]; 
    return [12, 24, 36, 48, 60]; 
  }, [form.category]);

  const availableInsuranceOptions = useMemo(() => {
    if (!dbData || form.price <= 0) return [];
    const tenorInYears = form.tenor / 12;
    let targetDbCategory = '';
    
    if (form.category === 'PASSENGER') {
        targetDbCategory = 'PASSENGER'; 
    } else {
        if (form.subCategory === 'PASSENGER') targetDbCategory = form.isLoadingUnit ? 'COMMERCIAL_LOADING' : 'COMMERCIAL_USED';
        else if (form.subCategory === 'TRUCK') targetDbCategory = form.isLoadingUnit ? 'COMMERCIAL_LOADING_TRUCK' : 'COMMERCIAL_USED_TRUCK';
        else if (form.subCategory === 'BUS') targetDbCategory = form.isLoadingUnit ? 'COMMERCIAL_LOADING_BUS' : 'COMMERCIAL_USED_BUS';
    }

    const validInsurances = dbData.insuranceRates.filter(item => {
      const catMatch = item.category === targetDbCategory;
      const tenorMatch = item.tenor === tenorInYears;
      const priceMatch = form.price >= item.minPrice && form.price <= item.maxPrice;
      return catMatch && tenorMatch && priceMatch;
    });

    return validInsurances;
  }, [dbData, form.category, form.subCategory, form.tenor, form.price, form.isLoadingUnit]);

  // Auto-Select Insurance
  useEffect(() => {
    if (availableInsuranceOptions.length > 0) {
      const currentExists = availableInsuranceOptions.some(i => i.label === form.selectedInsuranceLabel);
      if (!currentExists) {
        setForm(prev => ({ ...prev, selectedInsuranceLabel: availableInsuranceOptions[0].label }));
      }
    } else {
      setForm(prev => ({ ...prev, selectedInsuranceLabel: '' }));
    }
  }, [availableInsuranceOptions]);

  // --- 3. FUNGSI HITUNG INTI (CORE CALCULATION) ---
  // Dipisahkan agar bisa dipanggil berulang-ulang oleh Solver Budget
  const calculateFinancials = useCallback((
     overrideDpPercent: number
  ): CalculationResult | null => {
    if (!dbData) return null;
    const { price, tenor, category, paymentType, isLoadingUnit, adminFee, selectedInsuranceLabel } = form;

    // A. Star Level
    let starLevel = 1;
    if (overrideDpPercent >= 30) starLevel = 7;
    else if (overrideDpPercent >= 25) starLevel = 6;
    else if (overrideDpPercent >= 20) starLevel = 5;
    else if (overrideDpPercent >= 15) starLevel = 4;
    else if (overrideDpPercent >= 10) starLevel = 3;
    else if (overrideDpPercent >= 5)  starLevel = 2;
    else starLevel = 1; 

    // B. Rates
    const selectedIns = availableInsuranceOptions.find(i => i.label === selectedInsuranceLabel);
    const insuranceRatePct = selectedIns ? selectedIns.rate : 0.0;

    const foundInt = dbData.interestRates.find(item => 
      item.category === category &&
      item.paymentType === paymentType &&
      item.star === starLevel &&
      item.tenor === tenor
    );
    let interestRatePct = foundInt ? foundInt.rate : 0.0; 

    // C. Skenario Khusus
    const isSpecialScenario = (category === 'PASSENGER' && paymentType === 'ADDB' && starLevel === 1);
    if (isSpecialScenario) interestRatePct = 0;

    // --- MATH ---
    const dpAmount = price * (overrideDpPercent / 100);
    const principalPure = price - dpAmount;
    const insuranceAmount = price * insuranceRatePct;
    const policyFee = 100000;
    
    const totalAR = principalPure + insuranceAmount + policyFee;
    const rawInterest = totalAR * interestRatePct * (tenor / 12);
    const totalInterest = roundVal(rawInterest, 100, 'round');
    const totalLoan = totalAR + totalInterest;

    let installmentDivisor = tenor;
    if (isSpecialScenario) installmentDivisor = tenor - 2;
    
    const rawInstallment = totalLoan / installmentDivisor;
    const monthlyInstallment = roundVal(rawInstallment, 10000, 'ceil');

    const policyFeeTDP = 50000;
    let firstInstallment = 0;
    if (paymentType === 'ADDM') firstInstallment = monthlyInstallment;
    
    const totalDownPayment = dpAmount + adminFee + policyFeeTDP + firstInstallment;
    const nilaiAP = price - totalDownPayment;

    return {
      starLevel,
      interestRatePct,
      insuranceRatePct,
      vehiclePrice: price,
      dpAmount,
      dpPercentCalc: overrideDpPercent,
      principalPure,
      insuranceAmount,
      policyFee,
      totalAR,
      totalInterest,
      totalLoan,
      monthlyInstallment,
      adminFee,
      policyFeeTDP,
      firstInstallment,
      totalDownPayment,
      nilaiAP,
      installmentDivisor,
      isSpecialScenario
    };
  }, [dbData, form, availableInsuranceOptions]);


  // --- 4. SOLVER BUDGET (REVERSE CALCULATOR) ---
  const solveBudget = () => {
     if (form.targetValue <= 0 || form.price <= 0) return;

     // Binary Search untuk mencari DP% yang menghasilkan Target TDP / Angsuran
     let low = 0;
     let high = 99; // Max DP 99%
     let bestResult = null;
     let minDiff = Number.MAX_VALUE;

     // Iterasi pencarian (presisi 2 desimal)
     for (let i = 0; i < 50; i++) {
         const mid = (low + high) / 2;
         const res = calculateFinancials(mid);
         if (!res) break;

         const currentVal = form.targetType === 'TDP' ? res.totalDownPayment : res.monthlyInstallment;
         const diff = Math.abs(currentVal - form.targetValue);

         if (diff < minDiff) {
             minDiff = diff;
             bestResult = res;
         }

         if (form.targetType === 'TDP') {
             // ADDB: TDP naik seiring DP naik
             // ADDM: TDP naik seiring DP naik (umumnya)
             if (currentVal < form.targetValue) low = mid;
             else high = mid;
         } else {
             // Target Angsuran
             // Angsuran TURUN seiring DP NAIK
             if (currentVal > form.targetValue) low = mid; // Perlu DP lebih besar
             else high = mid;
         }
     }
     
     if (bestResult) setResult(bestResult);
  };

  // --- 5. HANDLER PERUBAHAN ---
  useEffect(() => {
    // Mode Normal: Hitung otomatis saat form berubah
    if (form.mode === 'NORMAL' && dbData && form.price > 0) {
      const res = calculateFinancials(form.dpPercent);
      setResult(res);
    }
  }, [form.mode, form.price, form.dpPercent, form.tenor, form.category, form.subCategory, form.paymentType, form.isLoadingUnit, form.adminFee, form.selectedInsuranceLabel, calculateFinancials]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;
    else if (['price', 'dpPercent', 'tenor', 'adminFee', 'targetValue'].includes(name)) val = parseFloat(value) || 0;
    
    if (name === 'category' && val === 'PASSENGER') {
        setForm(prev => ({ ...prev, [name]: val, subCategory: 'PASSENGER' }));
    } else {
        setForm(prev => ({ ...prev, [name]: val }));
    }
  };

  // --- RENDER ---
  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Memuat Database...</div>;
  if (errorMsg) return <div className="h-screen flex items-center justify-center text-red-500"><AlertCircle className="mr-2"/> {errorMsg}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded shadow-sm border border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Simulasi Kredit PSST1</h1>
            <p className="text-xs text-slate-500">Live Database • Excel Precision • Budget Solver</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
                onClick={() => setForm(f => ({...f, mode: 'NORMAL'}))} 
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${form.mode === 'NORMAL' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
                KALKULATOR
             </button>
             <button 
                onClick={() => setForm(f => ({...f, mode: 'BUDGET'}))} 
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${form.mode === 'BUDGET' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Search className="w-3 h-3"/> CARI BUDGET
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* KOLOM KIRI: INPUT */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white p-5 rounded shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Car className="w-4 h-4"/> Parameter Unit</h3>
              
              <div className="space-y-4">
                {/* HARGA OTR */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">HARGA OTR</label>
                  <input type="number" name="price" value={form.price || ''} onChange={handleChange} className="w-full p-2 border rounded font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
                </div>

                {/* MODE NORMAL: INPUT DP MANUAL */}
                {form.mode === 'NORMAL' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">DP (%)</label>
                            <input type="number" name="dpPercent" value={form.dpPercent} onChange={handleChange} className="w-full p-2 border rounded text-center font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">TENOR</label>
                            <select name="tenor" value={form.tenor} onChange={handleChange} className="w-full p-2 border rounded font-semibold bg-white">
                                {availableTenors.map(t => <option key={t} value={t}>{t/12} Tahun ({t} Bln)</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* MODE BUDGET: INPUT TARGET */}
                {form.mode === 'BUDGET' && (
                    <div className="bg-purple-50 p-3 rounded border border-purple-100 space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-purple-700 mb-1">TARGET PENCARIAN</label>
                            <div className="flex gap-2">
                                <button onClick={() => setForm(f => ({...f, targetType: 'TDP'}))} className={`flex-1 py-1.5 text-[10px] font-bold border rounded ${form.targetType === 'TDP' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500'}`}>Max TDP</button>
                                <button onClick={() => setForm(f => ({...f, targetType: 'INSTALLMENT'}))} className={`flex-1 py-1.5 text-[10px] font-bold border rounded ${form.targetType === 'INSTALLMENT' ? 'bg-purple-600 text-white' : 'bg-white text-slate-500'}`}>Max Angsuran</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">NOMINAL TARGET</label>
                                <input type="number" name="targetValue" value={form.targetValue || ''} onChange={handleChange} className="w-full p-2 border border-purple-300 rounded text-sm font-bold text-purple-800" placeholder="0" />
                             </div>
                             <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">TENOR</label>
                                <select name="tenor" value={form.tenor} onChange={handleChange} className="w-full p-2 border rounded text-xs font-semibold bg-white">
                                    {availableTenors.map(t => <option key={t} value={t}>{t/12} Thn</option>)}
                                </select>
                             </div>
                        </div>
                        <button onClick={solveBudget} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold shadow-sm transition">
                            HITUNG REKOMENDASI DP
                        </button>
                    </div>
                )}

                {/* KATEGORI & SUB KATEGORI */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">KATEGORI</label>
                   <div className="grid grid-cols-2 gap-2 mb-2">
                      <button onClick={() => setForm(f => ({...f, category: 'PASSENGER'}))} className={`p-2 text-xs font-bold border rounded ${form.category === 'PASSENGER' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`}>PASSENGER</button>
                      <button onClick={() => setForm(f => ({...f, category: 'COMMERCIAL'}))} className={`p-2 text-xs font-bold border rounded ${form.category === 'COMMERCIAL' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`}>KOMERSIL</button>
                   </div>
                   
                   {form.category === 'COMMERCIAL' && (
                     <div className="p-2 bg-slate-50 rounded border border-slate-200 mt-2 space-y-2">
                        <div className="flex gap-1">
                            {['PASSENGER', 'BUS', 'TRUCK'].map(sub => (
                                <button key={sub} onClick={() => setForm(f => ({...f, subCategory: sub as any}))} className={`flex-1 py-1 text-[10px] font-bold rounded border ${form.subCategory === sub ? 'bg-white border-blue-500 text-blue-600 shadow' : 'border-transparent text-slate-400'}`}>
                                    {sub === 'PASSENGER' ? 'PENUMPANG' : sub}
                                </button>
                            ))}
                        </div>
                        <label className={`flex items-center gap-2 p-1.5 rounded cursor-pointer ${form.isLoadingUnit ? 'text-orange-700 bg-orange-50' : 'text-slate-500'}`}>
                            <input type="checkbox" name="isLoadingUnit" checked={form.isLoadingUnit} onChange={handleChange} className="w-3 h-3 text-orange-600"/>
                            <span className="text-[10px] font-bold">Unit Loading ({'>'} 5 Thn)</span>
                        </label>
                     </div>
                   )}
                </div>

                {/* ASURANSI & TIPE */}
                <div className="bg-blue-50 p-3 rounded border border-blue-100 space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-blue-800 mb-1 flex items-center gap-1"><Shield className="w-3 h-3"/> JENIS ASURANSI</label>
                        {availableInsuranceOptions.length > 0 ? (
                            <select name="selectedInsuranceLabel" value={form.selectedInsuranceLabel} onChange={handleChange} className="w-full p-2 border rounded text-xs font-bold uppercase bg-white">
                                {availableInsuranceOptions.map((opt, idx) => (
                                    <option key={idx} value={opt.label}>{opt.label} ({toPct(opt.rate)})</option>
                                ))}
                            </select>
                        ) : <div className="text-[10px] text-red-500 italic">Rate tidak ditemukan.</div>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">TIPE BAYAR</label>
                            <select name="paymentType" value={form.paymentType} onChange={handleChange} className="w-full p-2 border rounded font-semibold bg-white text-xs">
                                <option value="ADDB">ADDB</option>
                                <option value="ADDM">ADDM</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">ADMIN</label>
                            <input type="number" name="adminFee" value={form.adminFee} onChange={handleChange} className="w-full p-2 border rounded text-right text-xs" />
                        </div>
                    </div>
                </div>

                {/* INPUT LAINNYA */}
                <div className="space-y-2 pt-2 border-t">
                    <input type="text" name="unitName" value={form.unitName} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="Nama Unit" />
                    <input type="text" name="nopol" value={form.nopol} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="No. Polisi" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded shadow-sm border border-slate-200">
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><User className="w-4 h-4"/> Data Nasabah</h3>
               <div className="space-y-2">
                  <input type="text" name="borrowerName" value={form.borrowerName} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="Nama Lengkap" />
                  <div className="grid grid-cols-2 gap-2">
                      <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded text-xs bg-white">
                            <option value="TODO">TODO</option>
                            <option value="PROGRES">PROGRES</option>
                            <option value="DONE">DONE</option>
                      </select>
                      <input type="text" name="salesName" value={form.salesName} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="Nama Sales" />
                  </div>
               </div>
            </div>
          </div>

          {/* KOLOM KANAN: HASIL */}
          <div className="lg:col-span-8">
            <div className={`bg-white p-6 rounded shadow-lg border h-full flex flex-col ${form.mode === 'BUDGET' ? 'border-purple-200 ring-1 ring-purple-100' : 'border-slate-200'}`}>
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
                      <div className={`px-3 py-1 rounded text-xs font-bold ${result.isSpecialScenario ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                          STAR {result.starLevel}
                      </div>
                  )}
              </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}