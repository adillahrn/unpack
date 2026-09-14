import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-midnight/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-cream rounded-3xl shadow-xl p-6 mx-4 max-w-md w-full animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-bold text-midnight">{title}</h2>}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-peach/30 transition-colors ml-auto"
            aria-label="Close modal"
          >
            <X size={20} className="text-bark" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
