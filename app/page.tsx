// app/page.tsx
"use client";

import React from 'react';
import { Loader2, AlertCircle, Search } from 'lucide-react';
import { useCreditSimulation } from './hooks/useCreditSimulation';
import SimulationInputs from './components/simulation/SimulationInputs';
import SimulationResult from './components/simulation/SimulationResult';

export default function CreditSimulationPage() {
  const {
    form, setForm,
    result,
    isLoading, errorMsg, isSaving,
    availableTenors, availableInsuranceOptions,
    // Kita ambil fungsi baru ini dari hook:
    handleChange, handleSave, solveBudget, 
    handleFileChange, removeAttachment 
  } = useCreditSimulation();

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
          <div className="lg:col-span-4">
            <SimulationInputs 
              form={form} 
              setForm={setForm}
              handleChange={handleChange}
              availableTenors={availableTenors}
              availableInsuranceOptions={availableInsuranceOptions}
              solveBudget={solveBudget}
              
              // PERBAIKAN: Sambungkan fungsi file ke komponen input
              handleFileChange={handleFileChange}
              removeAttachment={removeAttachment}
            />
          </div>

          {/* KOLOM KANAN: HASIL */}
          <div className="lg:col-span-8">
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
  );
}