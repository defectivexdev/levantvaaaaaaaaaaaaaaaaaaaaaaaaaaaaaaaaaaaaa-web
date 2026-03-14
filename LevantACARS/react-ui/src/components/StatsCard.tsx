import { LucideIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'amber' | 'emerald' | 'blue' | 'purple' | 'red';
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'amber',
}: StatsCardProps) {
  const colorClasses = {
    amber: {
      bg: 'from-amber-600/20 via-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      text: 'text-amber-300',
      glow: 'shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40',
      iconBg: 'from-amber-600/30 to-amber-500/20',
    },
    emerald: {
      bg: 'from-emerald-600/20 via-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      text: 'text-emerald-300',
      glow: 'shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40',
      iconBg: 'from-emerald-600/30 to-emerald-500/20',
    },
    blue: {
      bg: 'from-blue-600/20 via-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      text: 'text-blue-300',
      glow: 'shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40',
      iconBg: 'from-blue-600/30 to-blue-500/20',
    },
    purple: {
      bg: 'from-purple-600/20 via-purple-500/10 to-purple-600/5',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      text: 'text-purple-300',
      glow: 'shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40',
      iconBg: 'from-purple-600/30 to-purple-500/20',
    },
    red: {
      bg: 'from-red-600/20 via-red-500/10 to-red-600/5',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      text: 'text-red-300',
      glow: 'shadow-lg shadow-red-500/20 hover:shadow-red-500/40',
      iconBg: 'from-red-600/30 to-red-500/20',
    },
  };

  const colors = colorClasses[color];

  return (
    <Card
      variant="glass"
      className={cn(
        'group relative p-6 bg-gradient-to-br border backdrop-blur-xl',
        'hover:scale-[1.03] hover:-translate-y-1',
        'transition-all duration-300 ease-out',
        'animate-slide-up overflow-hidden',
        colors.bg,
        colors.border,
        colors.glow
      )}
    >
      {/* Animated gradient overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10',
        'transition-opacity duration-500',
        colors.bg
      )} style={{ backgroundSize: '200% 200%' }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'p-3 rounded-xl bg-gradient-to-br border',
            'transform group-hover:scale-110 group-hover:rotate-3',
            'transition-all duration-300',
            colors.iconBg,
            colors.border
          )}>
            <Icon className={cn('w-6 h-6', colors.icon)} />
          </div>
          {trend && (
            <div
              className={cn(
                'px-2 py-1 rounded-full text-xs font-bold',
                'backdrop-blur-sm border animate-pulse-slow',
                trend.isPositive 
                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' 
                  : 'text-red-300 bg-red-500/10 border-red-500/30'
              )}
            >
              {trend.isPositive ? '↗' : '↘'} {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2 opacity-80">
            {title}
          </p>
          <p className={cn(
            'text-4xl font-bold font-mono tracking-tight',
            'bg-gradient-to-r bg-clip-text text-transparent',
            'from-white via-slate-100 to-slate-300',
            'group-hover:scale-105 transition-transform duration-300'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Bottom glow effect */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-px',
        'bg-gradient-to-r from-transparent via-current to-transparent',
        'opacity-20 group-hover:opacity-40 transition-opacity',
        colors.icon
      )} />
    </Card>
  );
}
