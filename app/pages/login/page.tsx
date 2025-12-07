// app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login gagal');

      // Refresh halaman agar middleware mendeteksi sesi baru
      window.location.href = '/'; 
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row bg-white min-h-screen">
      {/* Brand Section - Top on Mobile, Left on Desktop */}
      <div className="lg:w-[45%] bg-[#0B1120] relative overflow-hidden flex flex-col justify-center items-center py-8 px-6 lg:p-16 text-white shrink-0">
        {/* Background Pattern - Minimalist Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        
        {/* Gradient Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 lg:w-48 lg:h-48 relative mb-4 lg:mb-6">
             <img 
              src="/GASPOL.png?v=3" 
              alt="Gaspol Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-2xl lg:text-5xl font-bold mb-2 lg:mb-4 tracking-tight">
            GASPOL
          </h1>
          <p className="text-slate-400 text-sm lg:text-lg leading-relaxed max-w-xs lg:max-w-md font-medium mb-2">
            (Growth Accelerator System for Performance Optimization & Leads)
          </p>
          <p className="text-slate-300 text-sm lg:text-xl leading-relaxed max-w-xs lg:max-w-md italic">
            “Let’s GASPOL the Sales Performance!”
          </p>
        </div>
        
        <div className="absolute bottom-8 text-slate-600 text-xs hidden lg:block">
          © 2025 Gaspol System v2.0
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center px-6 pt-8 pb-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-sm lg:max-w-md space-y-6 lg:space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-slate-500 mt-2 text-sm lg:text-base">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm lg:text-base font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 lg:w-6 lg:h-6 absolute left-3 top-2.5 lg:top-3 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm lg:text-base focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm lg:text-base font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 lg:w-6 lg:h-6 absolute left-3 top-2.5 lg:top-3 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm lg:text-base focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                  />
                </div>
              </div>
            </div>


            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 lg:py-3 lg:text-lg rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}