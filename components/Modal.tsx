
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  cancelText?: string | null;
  onConfirm: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, confirmText = 'Confirm', confirmDisabled = false, cancelText, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-2xl font-bold leading-none">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh] text-gray-700 dark:text-gray-300 custom-scrollbar">
          {children}
        </div>
        
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50">
          {cancelText !== null && (
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
              {cancelText ?? 'Cancel'}
            </button>
          )}
          <button 
            onClick={onConfirm} 
            disabled={confirmDisabled} 
            className="px-8 py-2 bg-brand-cyan text-white font-bold text-sm rounded-lg hover:bg-cyan-600 transition-all disabled:opacity-50"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
