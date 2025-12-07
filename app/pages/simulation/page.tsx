// app/simulation/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Search, ChevronRight } from 'lucide-react';
import { useCreditSimulation } from '../../hooks/useCreditSimulation';
import SimulationInputs from '../../components/simulation/SimulationInputs';
import SimulationResult from '../../components/simulation/SimulationResult';
import Modal from '../../components/ui/Modal';

export default function CreditSimulationPage() {
  const router = useRouter();
  const {
    form, setForm,
    result,
    isLoading, errorMsg, isSaving,
    saveSuccess, setSaveSuccess,
    validationError, setValidationError,
    availableTenors, availableInsuranceOptions,
    handleChange, handleSave, solveBudget, 
    handleFileChange, removeAttachment 
  } = useCreditSimulation();

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
      <Loader2 className="animate-spin w-10 h-10 mb-4 text-blue-600"/> 
      <p className="font-medium">Memuat Database...</p>
    </div>
  );
  
  if (errorMsg) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-red-500 p-6 text-center">
      <AlertCircle className="w-12 h-12 mb-4"/> 
      <p className="font-bold text-lg">Terjadi Kesalahan</p>
      <p className="text-sm mt-2">{errorMsg}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20 lg:pb-8">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Simulasi Kredit</h1>
              <p className="text-slate-500 mt-2 text-sm md:text-base">GASPOL SYSTEM</p>
            </div>
          </div>

          {/* Mode Switcher - Desktop & Mobile Optimized */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setForm(f => ({...f, mode: 'NORMAL'}))} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${form.mode === 'NORMAL' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Normal
             </button>
             <button 
                onClick={() => setForm(f => ({...f, mode: 'BUDGET'}))} 
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${form.mode === 'BUDGET' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Search className="w-3 h-3"/> Budget
             </button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* KOLOM KIRI: INPUT */}
          <div className="lg:col-span-4 space-y-6">
            <SimulationInputs 
              form={form} 
              setForm={setForm}
              handleChange={handleChange}
              availableTenors={availableTenors}
              availableInsuranceOptions={availableInsuranceOptions}
              solveBudget={solveBudget}
              handleFileChange={handleFileChange}
              removeAttachment={removeAttachment}
            />
          </div>

          {/* KOLOM KANAN: HASIL */}
          <div className="lg:col-span-8">
            <div className="sticky top-24">
              <SimulationResult 
                result={result}
                form={form}
                handleSave={handleSave}
                isSaving={isSaving}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={!!validationError} 
        onClose={() => setValidationError(null)} 
        title="Validasi Gagal" 
        type="error"
      >
        <p>{validationError}</p>
      </Modal>

      <Modal 
        isOpen={saveSuccess} 
        onClose={() => {
            setSaveSuccess(false);
            router.push('/pages/history');
        }} 
        title="Berhasil Disimpan" 
        type="success"
      >
        <p>Simulasi kredit berhasil disimpan ke dalam riwayat.</p>
      </Modal>
    </div>
  );
}
