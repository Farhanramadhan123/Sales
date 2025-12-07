// app/hooks/useCreditSimulation.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppData, SimulationForm, CalculationResult, AttachmentItem } from '../types/simulation';

// --- DATABASE RATE KHUSUS WILAYAH 3 ---
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
    console.log(`[Compress] Memulai proses untuk: ${file.name} (${file.type})`);

    // Jika bukan gambar (misal PDF), langsung convert Base64 biasa
    if (!file.type.startsWith('image/')) {
        console.log(`[Compress] File bukan gambar, skip resize.`);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    
    image.onload = () => {
      console.log(`[Compress] Gambar dimuat. Dimensi asli: ${image.width}x${image.height}`);
      const canvas = document.createElement('canvas');
      let { width, height } = image;

      // Resize jika terlalu besar
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
        console.log(`[Compress] Resize menjadi: ${width}x${height}`);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0, width, height);
        // Kompresi ke JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log(`[Compress] Selesai. Panjang string: ${compressedDataUrl.length}`);
        resolve(compressedDataUrl);
      } else {
        reject(new Error("Gagal membuat context canvas"));
      }
    };
    
    image.onerror = (error) => {
        console.error("[Compress] Error saat load image:", error);
        reject(error);
    };
  });
};

export const useCreditSimulation = () => {
  const router = useRouter();
  
  const [dbData, setDbData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
    dpPercent: 20,
    tenor: 12,
    paymentType: 'ADDB',
    adminFee: 3000000, 
    selectedInsuranceLabel: ''
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const roundVal = (num: number, multiple: number, direction: 'round' | 'ceil' = 'round') => {
    if (direction === 'ceil') return Math.ceil(num / multiple) * multiple;
    return Math.round(num / multiple) * multiple;
  };

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

    const filtered = dbData.insuranceRates.filter(item => {
      const catMatch = item.category === targetDbCategory;
      const tenorMatch = item.tenor === tenorInYears;
      const priceMatch = form.price >= item.minPrice && form.price <= item.maxPrice;
      return catMatch && tenorMatch && priceMatch;
    });

    return filtered.sort((a, b) => a.rate - b.rate);
  }, [dbData, form.category, form.subCategory, form.tenor, form.price, form.isLoadingUnit]);

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

  const calculateFinancials = useCallback((overrideDpPercent: number): CalculationResult | null => {
    if (!dbData) return null;
    const { price, tenor, category, paymentType, adminFee, selectedInsuranceLabel } = form;

    let starLevel = 1;
    if (overrideDpPercent >= 30) starLevel = 7;
    else if (overrideDpPercent >= 25) starLevel = 6;
    else if (overrideDpPercent >= 20) starLevel = 5;
    else if (overrideDpPercent >= 15) starLevel = 4;
    else if (overrideDpPercent >= 10) starLevel = 3;
    else if (overrideDpPercent >= 5)  starLevel = 2;

    const selectedIns = availableInsuranceOptions.find(i => i.label === selectedInsuranceLabel);
    const insuranceRatePct = selectedIns ? selectedIns.rate : 0.0;

    const lookupStar = starLevel === 1 ? 1 : starLevel; 
    
    const foundInt = dbData.interestRates.find(item => 
      item.category === category &&
      item.paymentType === paymentType &&
      item.star === lookupStar &&
      item.tenor === tenor
    );
    let interestRatePct = foundInt ? foundInt.rate : 0.0885; 

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

  const solveBudget = () => {
     if (form.targetValue <= 0 || form.price <= 0) return;
     let low = 0, high = 99, bestResult = null, minDiff = Number.MAX_VALUE;

     for (let i = 0; i < 50; i++) {
         const mid = (low + high) / 2;
         const res = calculateFinancials(mid);
         if (!res) break;

         const currentVal = form.targetType === 'TDP' ? res.totalDownPayment : res.monthlyInstallment;
         const diff = Math.abs(currentVal - form.targetValue);

         if (diff < minDiff) { minDiff = diff; bestResult = res; }

         if (form.targetType === 'TDP') {
             if (currentVal < form.targetValue) low = mid; else high = mid;
         } else {
             if (currentVal > form.targetValue) low = mid; else high = mid;
         }
     }
     if (bestResult) setResult(bestResult);
  };

  // --- HANDLER FILE DENGAN DEBUG LOG ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("--> handleFileChange dipicu");
    
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      console.log(`--> Menerima ${newFiles.length} file:`, newFiles.map(f => f.name));
      
      const MAX_INPUT_SIZE = 15 * 1024 * 1024; // 15 MB
      const MAX_PDF_SIZE = 3 * 1024 * 1024;    // 3 MB

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

      console.log(`--> File valid yang akan diproses: ${validFiles.length}`);

      setIsSaving(true); // Indikator loading
      const processedFiles: AttachmentItem[] = [];

      try {
        for (const file of validFiles) {
            console.log(`--> Memproses: ${file.name}`);
            const base64 = await compressImage(file, 0.6, 1024);
            
            processedFiles.push({
                name: file.name,
                type: file.type,
                size: Math.round(base64.length * 0.75), 
                base64: base64
            });
            console.log(`--> Berhasil proses: ${file.name}`);
        }
        
        console.log("--> Semua file selesai diproses. Update state form...");
        setForm(prev => {
            const newState = {
                ...prev,
                attachments: [...prev.attachments, ...processedFiles]
            };
            console.log("--> New State Attachments Length:", newState.attachments.length);
            return newState;
        });

      } catch (error) {
        console.error("--> ERROR Gagal memproses file:", error);
        alert("Gagal memproses file gambar.");
      } finally {
        setIsSaving(false);
      }
    } else {
        console.log("--> Tidak ada file yang dipilih (e.target.files kosong)");
    }
  };

  const removeAttachment = (index: number) => {
     setForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
     }));
  }

  const handleSave = async () => {
    console.log("--> Tombol Simpan Ditekan");
    console.log("--> Jumlah File di State Form:", form.attachments.length);
    console.log("--> Detail File:", form.attachments);

    if (!result) return;
    if (!form.borrowerName) { alert("Mohon isi Nama Nasabah sebelum menyimpan."); return; }

    setIsSaving(true);
    try {
        const attachmentJson = JSON.stringify(form.attachments);
        
        // Cek Payload
        const payloadSize = new Blob([attachmentJson]).size;
        console.log(`--> Ukuran Payload Attachments: ${(payloadSize/1024).toFixed(2)} KB`);

        if (payloadSize > 4.5 * 1024 * 1024) {
            throw new Error(`Total ukuran file terlalu besar (${(payloadSize/1024/1024).toFixed(1)}MB). Vercel limit 4.5MB.`);
        }

        const payload = {
            ...form,
            attachments: attachmentJson, 

            dpAmount: result.dpAmount,
            monthlyPayment: result.monthlyInstallment,
            totalFirstPay: result.totalDownPayment,
            interestRate: result.interestRatePct,
            insuranceRate: result.insuranceRatePct,
            insuranceAmount: result.insuranceAmount,
            principalPure: result.principalPure,
            policyFee: result.policyFee,
            totalAR: result.totalAR,
            totalInterest: result.totalInterest,
            totalLoan: result.totalLoan,
            policyFeeTDP: result.policyFeeTDP,
            firstInstallment: result.firstInstallment,
            nilaiAP: result.nilaiAP
        };

        console.log("--> Mengirim ke API...");
        const res = await fetch('/api/simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Gagal menyimpan data");
        }
        
        console.log("--> Berhasil Simpan!");
        alert("Simulasi berhasil disimpan!");
        router.push('/history'); 
    } catch (err) {
        console.error("--> ERROR SAVE:", err);
        alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.");
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

  useEffect(() => {
    if (form.mode === 'NORMAL' && dbData && form.price > 0) {
      const res = calculateFinancials(form.dpPercent);
      setResult(res);
    }
  }, [form.mode, form.price, form.dpPercent, form.tenor, form.category, form.subCategory, form.paymentType, form.isLoadingUnit, form.adminFee, form.selectedInsuranceLabel, calculateFinancials, dbData]);

  return {
    form, setForm,
    result, setResult,
    isLoading, errorMsg, isSaving,
    availableTenors, availableInsuranceOptions,
    handleChange, handleSave, solveBudget,
    handleFileChange, removeAttachment
  };
};