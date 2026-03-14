import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg hover:shadow-2xl overflow-hidden group';
    
    const variants = {
      primary: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-[length:200%_100%] text-white hover:bg-right-top focus:ring-amber-500 shadow-amber-500/30 hover:shadow-amber-500/60 animate-gradient-shift',
      secondary: 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] text-white hover:bg-right-top focus:ring-slate-500 shadow-slate-500/30',
      outline: 'border-2 border-amber-600/50 text-amber-400 hover:bg-amber-600/20 hover:border-amber-400 focus:ring-amber-500 backdrop-blur-sm shadow-none hover:shadow-amber-500/30',
      ghost: 'text-slate-300 hover:bg-white/10 hover:text-white focus:ring-slate-500 shadow-none backdrop-blur-sm',
      danger: 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-[length:200%_100%] text-white hover:bg-right-top focus:ring-red-500 shadow-red-500/30 hover:shadow-red-500/60',
      gradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-[length:200%_100%] text-white hover:bg-right-top focus:ring-pink-500 shadow-pink-500/40 hover:shadow-pink-500/70 animate-gradient-shift',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2.5',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        {/* Shine effect on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
