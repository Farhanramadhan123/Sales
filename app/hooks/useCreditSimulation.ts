// app/hooks/useCreditSimulation.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppData, SimulationForm, CalculationResult } from '../types/simulation';

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

  // --- Helpers ---
  const roundVal = (num: number, multiple: number, direction: 'round' | 'ceil' = 'round') => {
    if (direction === 'ceil') return Math.ceil(num / multiple) * multiple;
    return Math.round(num / multiple) * multiple;
  };

  // --- Fetch Data ---
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

  // --- Logic Options ---
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

    return dbData.insuranceRates.filter(item => {
      const catMatch = item.category === targetDbCategory;
      const tenorMatch = item.tenor === tenorInYears;
      const priceMatch = form.price >= item.minPrice && form.price <= item.maxPrice;
      return catMatch && tenorMatch && priceMatch;
    });
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
  }, [availableInsuranceOptions, form.selectedInsuranceLabel]);

  // --- Calculation Logic ---
  const calculateFinancials = useCallback((overrideDpPercent: number): CalculationResult | null => {
    if (!dbData) return null;
    const { price, tenor, category, paymentType, adminFee, selectedInsuranceLabel } = form;

    // Star Level
    let starLevel = 1;
    if (overrideDpPercent >= 30) starLevel = 7;
    else if (overrideDpPercent >= 25) starLevel = 6;
    else if (overrideDpPercent >= 20) starLevel = 5;
    else if (overrideDpPercent >= 15) starLevel = 4;
    else if (overrideDpPercent >= 10) starLevel = 3;
    else if (overrideDpPercent >= 5)  starLevel = 2;

    // Rates
    const selectedIns = availableInsuranceOptions.find(i => i.label === selectedInsuranceLabel);
    const insuranceRatePct = selectedIns ? selectedIns.rate : 0.0;

    const foundInt = dbData.interestRates.find(item => 
      item.category === category &&
      item.paymentType === paymentType &&
      item.star === starLevel &&
      item.tenor === tenor
    );
    let interestRatePct = foundInt ? foundInt.rate : 0.0; 

    // Special Scenario
    const isSpecialScenario = (category === 'PASSENGER' && paymentType === 'ADDB' && starLevel === 1);
    if (isSpecialScenario) interestRatePct = 0;

    // Math
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
      starLevel, interestRatePct, insuranceRatePct, vehiclePrice: price,
      dpAmount, dpPercentCalc: overrideDpPercent, principalPure, insuranceAmount,
      policyFee, totalAR, totalInterest, totalLoan, monthlyInstallment,
      adminFee, policyFeeTDP, firstInstallment, totalDownPayment, nilaiAP,
      installmentDivisor, isSpecialScenario
    };
  }, [dbData, form, availableInsuranceOptions]);

  // --- Solver Logic ---
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

  // --- Handlers ---
  const handleSave = async () => {
    if (!result) return;
    if (!form.borrowerName) { alert("Mohon isi Nama Nasabah sebelum menyimpan."); return; }

    setIsSaving(true);
    try {
        const payload = {
            ...form,
            // Result mapping
            dpAmount: result.dpAmount,
            monthlyInstallment: result.monthlyInstallment,
            totalDownPayment: result.totalDownPayment,
            interestRatePct: result.interestRatePct,
            insuranceRatePct: result.insuranceRatePct,
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

        const res = await fetch('/api/simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Gagal menyimpan");
        alert("Simulasi berhasil disimpan!");
        router.push('/history'); 
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan data.");
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

  // Auto Calculation Effect
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
    handleChange, handleSave, solveBudget
  };
};