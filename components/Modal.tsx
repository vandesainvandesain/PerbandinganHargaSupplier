import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  type?: 'default' | 'danger';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, type = 'default' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-xl shadow-lg w-full max-w-lg flex flex-col max-h-[90vh] ${type === 'danger' ? 'border-2 border-red-500' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className={`text-lg font-bold ${type === 'danger' ? 'text-red-600' : 'text-slate-800'}`}>
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;