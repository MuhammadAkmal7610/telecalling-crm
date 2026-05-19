import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function UiModal({ isOpen, onClose, title, children }) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#020408]/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Perfect vertical and horizontal centering flex container */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        
        {/* Modal Container */}
        <div className="relative w-full max-w-lg glass-panel text-brand-text border-brand-border rounded-xl shadow-2xl z-10 overflow-hidden text-left align-middle inline-block animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border/60 bg-[#161c2c]/50">
            <h3 className="text-lg font-semibold text-brand-text-bright font-sans tracking-wide">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-brand-text hover:bg-brand-border hover:text-brand-text-bright transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}
