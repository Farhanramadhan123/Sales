// app/hooks/useCreditSimulation.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppData, SimulationForm, CalculationResult, AttachmentItem } from '../types/simulation';

// --- DATABASE RATE KHUSUS WILAYAH 3 (HARDCODED RULE) ---
const WILAYAH_3_RATES = [
  { max: 125000000, rates: { 1: 0.0315, 2: 0.03978, 3: 0.04714, 4: 0.05358, 5: 0.06002 } },
  { max: 138888889, rates: { 1: 0.0278, 2: 0.03608, 3: 0.04344, 4: 0.04988, 5: 0.05632 } },
  { max: 156250000, rates: { 1: 0.0278, 2: 0.03554, 3: 0.04290, 4: 0.04934, 5: 0.05578 } },
  { max: 178571428, rates: { 1: 0.0278, 2: 0.03554, 3: 0.04242, 4: 0.04886, 5: 0.05530 } },
  { max: 200000000, rates: { 1: 0.0278, 2: 0.03554, 3: 0.04242, 4: 0.04844, 5: 0.05446 } },
  { max: 222222222, rates: { 1: 0.0234, 2: 0.03114, 3: 0.03802, 4: 0.04404, 5: 0.05006 } },
  { max: 250000000, rates: { 1: 0.0234, 2: 0.03096, 3: 0.03784, 4: 0.04386, 5: 0.04988 } },
  { max: Infinity,  rates: { 1: 0.0234, 2: 0.03096, 3: 0.03784, 4: 0.04386, 5: 0.04988 } }
];

const getWilayah3Rate = (price: number, tenorMonths: number) => {
  const tenorYear = Math.ceil(tenorMonths / 12);
  const found = WILAYAH_3_RATES.find(r => price <= r.max);
  if (found && found.rates[tenorYear as 1|2|3|4|5]) {
    return found.rates[tenorYear as 1|2|3|4|5];
  }
  return 0.0;
};

// --- HELPER: KOMPRESI GAMBAR ---
const compressImage = async (file: File, quality = 0.7, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = image;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } else {
        reject(new Error("Gagal membuat context canvas"));
      }
    };
    
    image.onerror = (error) => reject(error);
  });
};

export const useCreditSimulation = () => {
  const [dbData, setDbData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // --- STATE FORM ---
  const [form, setForm] = useState<SimulationForm>({
    mode: 'NORMAL',
    targetType: 'TDP',
    targetValue: 0,
    borrowerName: '',
    coBorrowerName: '',
    salesName: '',
    status: 'TODO',
    attachments: [], 
    unitName: '',
    nopol: '',
    category: 'PASSENGER',
    subCategory: 'PASSENGER', 
    isLoadingUnit: false,
    price: 0,
    dpPercent: 20, // Default DP
    tenor: 12,
    paymentType: 'ADDB',
    adminFee: 3000000, 
    selectedInsuranceLabel: ''
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const roundVal = (num: number, multiple: number, direction: 'round' | 'ceil' = 'round') => {
    if (direction === 'ceil') return Math.ceil(num / multiple) * multiple;
    return Math.round(num / multiple) * multiple;
  };

  // 1. Fetch Data Rate dari Database saat load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/rates'); 
        if (!res.ok) throw new Error('Gagal mengambil data dari Database');
        const data = await res.json();
        setDbData(data);
      } catch (err: Error | unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Tentukan Tenor yang tersedia berdasarkan kategori
  const availableTenors = useMemo(() => {
    if (form.category === 'COMMERCIAL') return [12, 24, 36, 48]; 
    return [12, 24, 36, 48, 60]; 
  }, [form.category]);

  // 3. Filter Opsi Asuransi berdasarkan harga & kategori
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

    const filtered = dbData.insuranceRates.filter(item => {
      const catMatch = item.category === targetDbCategory;
      const tenorMatch = item.tenor === tenorInYears;
      const priceMatch = form.price >= item.minPrice && form.price <= item.maxPrice;
      return catMatch && tenorMatch && priceMatch;
    });

    return filtered.sort((a, b) => a.rate - b.rate);
  }, [dbData, form.category, form.subCategory, form.tenor, form.price, form.isLoadingUnit]);

  // Auto-select asuransi pertama jika belum dipilih
  useEffect(() => {
    if (availableInsuranceOptions.length > 0) {
      const currentExists = availableInsuranceOptions.some(i => i.label === form.selectedInsuranceLabel);
      if (!currentExists) {
        setForm(prev => ({ ...prev, selectedInsuranceLabel: availableInsuranceOptions[0].label }));
      }
    } else {
      setForm(prev => ({ ...prev, selectedInsuranceLabel: '' }));
    }
  }, [availableInsuranceOptions, form.selectedInsuranceLabel]);

  // --- LOGIKA UTAMA PERHITUNGAN ---
  const calculateFinancials = useCallback((overrideDpPercent: number): CalculationResult | null => {
    if (!dbData) return null;
    const { price, tenor, category, paymentType, adminFee, selectedInsuranceLabel } = form;

    // 1. Tentukan STAR LEVEL berdasarkan DP (Aturan Bisnis)
    let starLevel = 1;
    if (overrideDpPercent >= 30) starLevel = 7;
    else if (overrideDpPercent >= 25) starLevel = 6;
    else if (overrideDpPercent >= 20) starLevel = 5;
    else if (overrideDpPercent >= 15) starLevel = 4;
    else if (overrideDpPercent >= 10) starLevel = 3;
    else if (overrideDpPercent >= 5)  starLevel = 2;

    // 2. Ambil Rate Asuransi
    const selectedIns = availableInsuranceOptions.find(i => i.label === selectedInsuranceLabel);
    const insuranceRatePct = selectedIns ? selectedIns.rate : 0.0;

    // 3. Ambil Rate Bunga DARI DATABASE berdasarkan Star Level yang sudah dihitung di atas
    const lookupStar = starLevel === 1 ? 1 : starLevel; 
    
    const foundInt = dbData.interestRates.find(item => 
      item.category === category &&
      item.paymentType === paymentType &&
      item.star === lookupStar &&
      item.tenor === tenor
    );
    const interestRatePct = foundInt ? foundInt.rate : 0.0885;

    // 4. Hitung Komponen
    let finalInsuranceRatePct = 0;
    const isSpecialScenario = (starLevel === 1);

    if (isSpecialScenario) {
        finalInsuranceRatePct = getWilayah3Rate(price, tenor);
    } else {
        finalInsuranceRatePct = insuranceRatePct;
    }

    let dpAmount = 0;
    let principalPure = 0;
    let insuranceAmount = 0;
    let totalLoan = 0;
    let monthlyInstallment = 0;
    let totalDownPayment = 0;
    let firstInstallment = 0;
    
    const policyFee = 100000;     
    const policyFeeTDP = 50000;   

    if (isSpecialScenario) {
        principalPure = price; 
        dpAmount = 0; 
        
        const insuranceBase = price + 2000000;
        insuranceAmount = insuranceBase * finalInsuranceRatePct;

        const totalAR = principalPure + insuranceAmount + policyFee;
        const rawInterest = totalAR * interestRatePct * (tenor / 12);
        const totalInterest = roundVal(rawInterest, 100, 'round');

        totalLoan = totalAR + totalInterest;

        const rawInstallment = totalLoan / tenor;
        monthlyInstallment = roundVal(rawInstallment, 10000, 'ceil');

        firstInstallment = 0; 
        totalDownPayment = (monthlyInstallment * 2) + adminFee + policyFeeTDP;

    } else {
        // Logika Normal
        dpAmount = price * (overrideDpPercent / 100);
        principalPure = price - dpAmount;
        insuranceAmount = price * finalInsuranceRatePct;
        
        const totalAR = principalPure + insuranceAmount + policyFee;
        const rawInterest = totalAR * interestRatePct * (tenor / 12);
        const totalInterest = roundVal(rawInterest, 100, 'round');
        
        totalLoan = totalAR + totalInterest;
        
        const rawInstallment = totalLoan / tenor;
        monthlyInstallment = roundVal(rawInstallment, 10000, 'ceil'); 

        if (paymentType === 'ADDM') {
            firstInstallment = monthlyInstallment;
        } else {
            firstInstallment = 0;
        }
        // Total Bayar Pertama (TDP)
        totalDownPayment = dpAmount + adminFee + policyFeeTDP + firstInstallment;
    }

    const nilaiAP = price - totalDownPayment;
    const installmentDivisor = isSpecialScenario ? tenor - 2 : tenor;

    return {
      starLevel, 
      interestRatePct, 
      insuranceRatePct: finalInsuranceRatePct, 
      vehiclePrice: price,
      dpAmount, 
      dpPercentCalc: overrideDpPercent, 
      principalPure, 
      insuranceAmount,
      policyFee, 
      totalAR: (principalPure + insuranceAmount + policyFee),
      totalInterest: (totalLoan - (principalPure + insuranceAmount + policyFee)),
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

  // --- SOLVER BUDGET (Binary Search) ---
  const solveBudget = () => {
     if (form.targetValue <= 0 || form.price <= 0) return;
     
     let low = 5, high = 90, bestResult = null, minDiff = Number.MAX_VALUE;

     for (let i = 0; i < 60; i++) {
         const midDp = (low + high) / 2;
         
         const res = calculateFinancials(midDp);
         if (!res) break;

         // Cek nilai saat ini (Entah TDP atau Angsuran)
         const currentVal = form.targetType === 'TDP' ? res.totalDownPayment : res.monthlyInstallment;
         const diff = Math.abs(currentVal - form.targetValue);

         // Simpan hasil terbaik jika selisihnya mengecil
         if (diff < minDiff) { minDiff = diff; bestResult = res; }

         if (form.targetType === 'TDP') {
             
             if (currentVal < form.targetValue) {
                 low = midDp;
             } else {
                 high = midDp;
             }
         } else {
             
             if (currentVal > form.targetValue) {
                 low = midDp; 
             } else {
                 high = midDp;
             }
         }
     }
     
     if (bestResult) {
         setResult(bestResult);
     } else {
         setValidationError("Tidak dapat menemukan rekomendasi DP yang sesuai dengan range harga & tenor ini.");
     }
  };

  // --- AUTO CALC (Mode Normal) ---
  useEffect(() => {
    if (form.mode === 'NORMAL' && dbData && form.price > 0) {
      // Di mode normal, kita pakai DP dari input user langsung
      const res = calculateFinancials(form.dpPercent);
      setResult(res);
    }
  }, [form.mode, form.price, form.dpPercent, form.tenor, form.category, form.subCategory, form.paymentType, form.isLoadingUnit, form.adminFee, form.selectedInsuranceLabel, calculateFinancials, dbData]);

  // --- HANDLER FILE, INPUT, SAVE (Tidak berubah) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const MAX_INPUT_SIZE = 15 * 1024 * 1024;
      const MAX_PDF_SIZE = 3 * 1024 * 1024;

      const validFiles = newFiles.filter(f => {
          if (f.type === 'application/pdf' && f.size > MAX_PDF_SIZE) {
              alert(`File PDF "${f.name}" terlalu besar (>3MB).`);
              return false;
          }
          if (f.size > MAX_INPUT_SIZE) {
              alert(`File "${f.name}" terlalu besar (>15MB).`);
              return false;
          }
          return true;
      });

      setIsSaving(true);
      const processedFiles: AttachmentItem[] = [];

      try {
        for (const file of validFiles) {
            const base64 = await compressImage(file, 0.6, 1024);
            processedFiles.push({
                name: file.name,
                type: file.type,
                size: Math.round(base64.length * 0.75), 
                base64: base64
            });
        }
        
        setForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...processedFiles]
        }));

      } catch (error) {
        console.error("Gagal memproses file:", error);
        alert("Gagal memproses file.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const removeAttachment = (index: number) => {
     setForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
     }));
  }

  const handleSave = async () => {
    setValidationError(null);
    setSaveSuccess(false);

    if (!result) return;
    
    if (!form.borrowerName || !form.salesName) { 
        setValidationError("Mohon lengkapi Nama Nasabah dan Nama Sales sebelum menyimpan simulasi."); 
        return; 
    }

    setIsSaving(true);
    try {
        const attachmentJson = JSON.stringify(form.attachments);
        const payloadSize = new Blob([attachmentJson]).size;

        if (payloadSize > 4.5 * 1024 * 1024) {
            throw new Error(`Total ukuran file terlalu besar. Batas maksimum upload sekitar 4.5MB total.`);
        }

        const payload = {
            ...form,
            attachments: attachmentJson, 
            ...result, // Spread result values
            interestRate: result.interestRatePct,
            insuranceRate: result.insuranceRatePct,
            monthlyPayment: result.monthlyInstallment,
            totalFirstPay: result.totalDownPayment
        };

        const res = await fetch('/api/simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Gagal menyimpan data");
        }
        
        setSaveSuccess(true);
    } catch (err) {
        console.error(err);
        setValidationError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: string | number | boolean = value;
    if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;
    else if (['price', 'dpPercent', 'tenor', 'adminFee', 'targetValue'].includes(name)) val = parseFloat(value) || 0;
    
    if (name === 'category' && val === 'PASSENGER') {
        setForm(prev => ({ ...prev, [name]: val, subCategory: 'PASSENGER' }));
    } else {
        setForm(prev => ({ ...prev, [name]: val }));
    }
  };

  return {
    form, setForm,
    result, setResult,
    isLoading, errorMsg, isSaving,
    saveSuccess, setSaveSuccess,
    validationError, setValidationError,
    availableTenors, availableInsuranceOptions,
    handleChange, handleSave, solveBudget,
    handleFileChange, removeAttachment
  };
};