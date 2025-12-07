// app/components/simulation/SimulationInputs.tsx
"use client";

import React from 'react';
import { Car, User, Shield, Paperclip, X, ChevronDown, UploadCloud } from 'lucide-react';
import { SimulationForm, DbInsurance } from '@/app/types/simulation';

interface Props {
  form: SimulationForm;
  setForm: React.Dispatch<React.SetStateAction<SimulationForm>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  availableTenors: number[];
  availableInsuranceOptions: DbInsurance[];
  solveBudget: () => void;
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment?: (index: number) => void;
}

const toPct = (num: number) => (num * 100).toFixed(3) + '%';

export default function SimulationInputs({ 
  form, setForm, handleChange, availableTenors, availableInsuranceOptions, solveBudget,
  handleFileChange, removeAttachment
}: Props) {
  return (
    <div className="space-y-6">
      {/* --- DATA NASABAH CARD --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500"/> Data Nasabah
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA PEMOHON</label>
                  <input type="text" name="borrowerName" value={form.borrowerName} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-400 outline-none transition-all" placeholder="Nama Lengkap" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">PASANGAN / PENJAMIN</label>
                  <input type="text" name="coBorrowerName" value={form.coBorrowerName} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-400 outline-none transition-all" placeholder="Nama Pasangan" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">STATUS</label>
                  <div className="relative">
                    <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:bg-white focus:ring-2 focus:ring-slate-400 outline-none">
                          <option value="TODO">TODO</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-400 pointer-events-none"/>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">SALES</label>
                  <input type="text" name="salesName" value={form.salesName} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-400 outline-none" placeholder="Nama Sales" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA UNIT</label>
                  <input type="text" name="unitName" value={form.unitName} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-400 outline-none transition-all" placeholder="Nama Unit" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">NO. POLISI</label>
                  <input type="text" name="nopol" value={form.nopol} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-400 outline-none transition-all" placeholder="No. Polisi" />
                </div>
            </div>

            {/* Upload Attachments Area */}
            <div className="pt-4 mt-2 border-t border-dashed border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1">
                    <Paperclip className="w-3 h-3"/> DOKUMEN PENDUKUNG
                </label>
                
                <div className="relative group">
                  <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-500 transition-all">
                    <UploadCloud className="w-4 h-4"/>
                    <span className="text-xs font-medium">Klik untuk upload dokumen</span>
                  </div>
                </div>
                
                {/* List Preview */}
                {form.attachments && form.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {form.attachments.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-[10px] font-bold">DOC</div>
                                  <span className="truncate text-xs text-slate-600 font-medium">{file.name}</span>
                                </div>
                                <button 
                                    onClick={() => removeAttachment && removeAttachment(idx)} 
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                >
                                    <X className="w-3.5 h-3.5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </div>
      </div>

      {/* --- PARAMETER UNIT CARD --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Car className="w-4 h-4 text-blue-500"/> Parameter Unit
        </h3>
        
        <div className="space-y-5">
          {/* Harga OTR */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Harga OTR</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-bold text-sm">Rp</span>
              <input 
                type="number" 
                name="price" 
                value={form.price || ''} 
                onChange={handleChange} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-slate-300" 
                placeholder="0" 
              />
            </div>
          </div>

          {/* Mode Normal Inputs */}
          {form.mode === 'NORMAL' && (
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">DP (%)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          name="dpPercent" 
                          value={form.dpPercent} 
                          onChange={handleChange} 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                      </div>
                  </div>
                  <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tenor</label>
                      <div className="relative">
                        <select 
                          name="tenor" 
                          value={form.tenor} 
                          onChange={handleChange} 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 appearance-none focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
                        >
                            {availableTenors.map(t => <option key={t} value={t}>{t/12} Tahun ({t} Bln)</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none"/>
                      </div>
                  </div>
              </div>
          )}

          {/* Mode Budget Inputs */}
          {form.mode === 'BUDGET' && (
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-4">
                  <div>
                      <label className="block text-[10px] font-bold text-purple-700 uppercase tracking-wide mb-2">Target Pencarian</label>
                      <div className="flex bg-white p-1 rounded-lg border border-purple-100 shadow-sm">
                          <button onClick={() => setForm(f => ({...f, targetType: 'TDP'}))} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${form.targetType === 'TDP' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Max TDP</button>
                          <button onClick={() => setForm(f => ({...f, targetType: 'INSTALLMENT'}))} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${form.targetType === 'INSTALLMENT' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Max Angsuran</button>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">NOMINAL TARGET</label>
                          <input type="number" name="targetValue" value={form.targetValue || ''} onChange={handleChange} className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm font-bold text-purple-800 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="0" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">TENOR</label>
                          <select name="tenor" value={form.tenor} onChange={handleChange} className="w-full px-3 py-2 border border-purple-200 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                              {availableTenors.map(t => <option key={t} value={t}>{t/12} Thn</option>)}
                          </select>
                        </div>
                  </div>
                  <button onClick={solveBudget} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98]">
                      HITUNG REKOMENDASI DP
                  </button>
              </div>
          )}

          {/* Kategori & Sub */}
          <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Kategori Kendaraan</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => setForm(f => ({...f, category: 'PASSENGER'}))} 
                  className={`py-2.5 px-4 text-xs font-bold border rounded-xl transition-all ${form.category === 'PASSENGER' ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  PASSENGER
                </button>
                <button 
                  onClick={() => setForm(f => ({...f, category: 'COMMERCIAL'}))} 
                  className={`py-2.5 px-4 text-xs font-bold border rounded-xl transition-all ${form.category === 'COMMERCIAL' ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  KOMERSIL
                </button>
              </div>
              
              {form.category === 'COMMERCIAL' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2">
                      {['PASSENGER', 'BUS', 'TRUCK'].map(sub => (
                          <button key={sub} onClick={() => setForm(f => ({...f, subCategory: sub as 'PASSENGER' | 'BUS' | 'TRUCK'}))} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${form.subCategory === sub ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'border-transparent text-slate-400 hover:bg-slate-100'}`}>
                              {sub === 'PASSENGER' ? 'PENUMPANG' : sub}
                          </button>
                      ))}
                  </div>
                  <label className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${form.isLoadingUnit ? 'bg-orange-50 border border-orange-100' : 'hover:bg-slate-100'}`}>
                      <input type="checkbox" name="isLoadingUnit" checked={form.isLoadingUnit} onChange={handleChange} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"/>
                      <span className={`text-xs font-bold ${form.isLoadingUnit ? 'text-orange-700' : 'text-slate-600'}`}>Unit Loading ({'>'} 5 Thn)</span>
                  </label>
                </div>
              )}
          </div>

          {/* Asuransi Section */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
              <div>
                  <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5"/> Konfigurasi Asuransi
                  </label>
                  {availableInsuranceOptions.length > 0 ? (
                      <div className="relative">
                        <select name="selectedInsuranceLabel" value={form.selectedInsuranceLabel} onChange={handleChange} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-xs font-bold uppercase bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                            {availableInsuranceOptions.map((opt, idx) => (
                                <option key={idx} value={opt.label}>{opt.label} ({toPct(opt.rate)})</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-3 h-3 text-slate-400 pointer-events-none"/>
                      </div>
                  ) : <div className="text-[10px] text-red-500 italic bg-red-50 p-2 rounded border border-red-100">Rate asuransi tidak ditemukan.</div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">TIPE BAYAR</label>
                      <div className="relative">
                        <select name="paymentType" value={form.paymentType} onChange={handleChange} className="w-full px-3 py-2 border border-blue-200 rounded-lg font-semibold bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                            <option value="ADDB">ADDB</option>
                            <option value="ADDM">ADDM</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-3 h-3 text-slate-400 pointer-events-none"/>
                      </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">BIAYA ADMIN</label>
                      <input type="number" name="adminFee" value={form.adminFee} readOnly className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-right text-xs font-semibold outline-none cursor-not-allowed" />
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}