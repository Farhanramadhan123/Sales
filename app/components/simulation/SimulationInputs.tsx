// app/components/simulation/SimulationInputs.tsx
"use client";

import React from 'react';
import { Car, User, Shield, Paperclip, X } from 'lucide-react';
import { SimulationForm, DbInsurance } from '@/app/types/simulation';

interface Props {
  form: SimulationForm;
  setForm: React.Dispatch<React.SetStateAction<SimulationForm>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  availableTenors: number[];
  availableInsuranceOptions: DbInsurance[];
  solveBudget: () => void;
  // Handler untuk file
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment?: (index: number) => void;
}

const toPct = (num: number) => (num * 100).toFixed(3) + '%';

export default function SimulationInputs({ 
  form, setForm, handleChange, availableTenors, availableInsuranceOptions, solveBudget,
  handleFileChange, removeAttachment
}: Props) {
  return (
    <div className="space-y-4">
      {/* --- PARAMETER UNIT --- */}
      <div className="bg-white p-5 rounded shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
          <Car className="w-4 h-4"/> Parameter Unit
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">HARGA OTR</label>
            <input type="number" name="price" value={form.price || ''} onChange={handleChange} className="w-full p-2 border rounded font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" />
          </div>

          {/* Mode Normal */}
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

          {/* Mode Budget */}
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
                          <button key={sub} onClick={() => setForm(f => ({...f, subCategory: sub as 'PASSENGER' | 'BUS' | 'TRUCK'}))} className={`flex-1 py-1 text-[10px] font-bold rounded border ${form.subCategory === sub ? 'bg-white border-blue-500 text-blue-600 shadow' : 'border-transparent text-slate-400'}`}>
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

          <div className="space-y-2 pt-2 border-t">
              <input type="text" name="unitName" value={form.unitName} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="Nama Unit" />
              <input type="text" name="nopol" value={form.nopol} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="No. Polisi" />
          </div>
        </div>
      </div>

      {/* --- DATA NASABAH (NEW UI) --- */}
      <div className="bg-white p-5 rounded shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><User className="w-4 h-4"/> Data Nasabah</h3>
          <div className="space-y-3">
            
            {/* Nama Nasabah & Co-Borrower */}
            <div className="space-y-2">
                <input type="text" name="borrowerName" value={form.borrowerName} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="Nama Nasabah (Borrower)" />
                <input type="text" name="coBorrowerName" value={form.coBorrowerName} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="Nama Pasangan (Co-Borrower)" />
            </div>

            {/* Status & Sales */}
            <div className="grid grid-cols-2 gap-2">
                <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 border rounded text-xs bg-white">
                      <option value="TODO">TODO</option>
                      <option value="PROGRES">PROGRES</option>
                      <option value="DONE">DONE</option>
                </select>
                <input type="text" name="salesName" value={form.salesName} onChange={handleChange} className="w-full p-2 border rounded text-xs" placeholder="Nama Sales" />
            </div>

            {/* Upload Attachments Area */}
            <div className="pt-2 border-t border-dashed">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <Paperclip className="w-3 h-3"/> DOKUMEN (KTP, KK, NPWP)
                </label>
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                {/* List Preview & Delete Button */}
                {form.attachments && form.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {form.attachments.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                <span className="truncate max-w-[200px] text-slate-600">{file.name}</span>
                                <button 
                                    onClick={() => removeAttachment && removeAttachment(idx)} 
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                    title="Hapus file"
                                >
                                    <X className="w-3 h-3"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </div>
      </div>
    </div>
  );
}