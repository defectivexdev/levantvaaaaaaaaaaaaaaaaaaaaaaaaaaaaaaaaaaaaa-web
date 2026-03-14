import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500' : 'border-slate-700',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
