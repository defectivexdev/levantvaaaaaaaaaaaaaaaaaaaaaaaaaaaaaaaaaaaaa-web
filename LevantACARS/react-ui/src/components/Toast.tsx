import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export default function Toast({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const variants = {
    success: 'bg-emerald-600/20 border-emerald-500/40 shadow-emerald-500/20',
    error: 'bg-red-600/20 border-red-500/40 shadow-red-500/20',
    warning: 'bg-amber-600/20 border-amber-500/40 shadow-amber-500/20',
    info: 'bg-blue-600/20 border-blue-500/40 shadow-blue-500/20',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.02]',
        variants[type],
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        {message && <p className="text-xs text-slate-300">{message}</p>}
      </div>

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
