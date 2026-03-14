import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'glow';
  pulse?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', pulse = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-700/80 text-slate-200 border border-slate-600/50 backdrop-blur-sm',
      success: 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20 shadow-lg',
      warning: 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-amber-500/20 shadow-lg',
      danger: 'bg-red-600/20 text-red-300 border border-red-500/40 shadow-red-500/20 shadow-lg',
      info: 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-blue-500/20 shadow-lg',
      glow: 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-300 border border-pink-500/40 shadow-pink-500/30 shadow-xl',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide transition-all duration-200 hover:scale-105',
          variants[variant],
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
