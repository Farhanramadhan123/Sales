// app/components/ui/Modal.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'info',
  actionLabel,
  onAction
}: ModalProps) {
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300);
    }
  }, [isOpen]);

  if (!show) return null;

  const getIcon = () => {
    if (type === 'success') return <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>;
    if (type === 'error') return <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertCircle className="w-6 h-6 text-red-600" /></div>;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {getIcon()}
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {title}
          </h3>
          
          <div className="text-slate-500 text-sm leading-relaxed mb-6">
            {children}
          </div>

          <div className="flex gap-3 w-full">
            {onAction && (
              <button 
                onClick={onAction}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
              >
                {actionLabel || 'OK'}
              </button>
            )}
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
