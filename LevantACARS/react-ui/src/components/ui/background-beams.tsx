import { cn } from './utils';

// Disabled continuous animations to prevent Vulkan device loss in X-Plane
// Static background only to reduce GPU strain
export function BackgroundBeams({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Static gradient background - no animation */}
      <div 
        className="pointer-events-none absolute inset-0 z-0"
        style={{ 
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(197, 160, 89, 0.03) 0%, transparent 60%)'
        }}
      />
      {/* Static subtle beams */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-accent-gold/10 via-transparent to-transparent" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-accent-cyan/5 via-transparent to-transparent" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-accent-gold/8 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
}
