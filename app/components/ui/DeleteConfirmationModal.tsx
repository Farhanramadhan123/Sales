"use client";

import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  description?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = "Hapus Data",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
}: DeleteConfirmationModalProps) {
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // Small delay to allow render before animating in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
        });
      });
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShow(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'
        }`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon Wrapper with Pulse Effect */}
            <div className="relative mb-6 group">
              <div className={`absolute inset-0 bg-red-100 rounded-full transform transition-transform duration-700 ${animate ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
              <div className="relative w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {title}
            </h3>
            
            <p className="text-slate-500 leading-relaxed mb-8">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="w-full px-5 py-3 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold rounded-xl transition-all focus:ring-4 focus:ring-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="w-full px-5 py-3 text-white bg-red-600 hover:bg-red-700 font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all transform active:scale-[0.98] focus:ring-4 focus:ring-red-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
