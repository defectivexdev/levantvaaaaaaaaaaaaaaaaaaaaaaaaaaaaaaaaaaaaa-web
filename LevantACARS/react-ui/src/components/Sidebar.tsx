import { useState } from 'react';
import { 
  Plane, 
  Map, 
  BarChart3, 
  Settings, 
  Users, 
  Radio,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  icon: typeof Plane;
  label: string;
  badge?: number;
  active?: boolean;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('live-map');

  const navItems: (NavItem & { id: string })[] = [
    { id: 'live-map', icon: Map, label: 'Live Map', active: true },
    { id: 'flights', icon: Plane, label: 'Flights', badge: 3 },
    { id: 'pilots', icon: Users, label: 'Pilots' },
    { id: 'telemetry', icon: Activity, label: 'Telemetry' },
    { id: 'stats', icon: BarChart3, label: 'Statistics' },
    { id: 'radio', icon: Radio, label: 'Radio' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      className={cn(
        'relative h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950',
        'border-r border-slate-800/50 backdrop-blur-xl',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-slide-up">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 shadow-lg shadow-amber-500/30">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Levant ACARS
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Flight Tracking</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            'hover:bg-slate-800/50 text-slate-400 hover:text-white',
            'border border-slate-700/30 hover:border-slate-600/50',
            isCollapsed && 'mx-auto'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'transition-all duration-200',
                'hover:scale-[1.02]',
                isActive
                  ? 'bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border border-amber-500/30 shadow-lg shadow-amber-500/20'
                  : 'hover:bg-slate-800/50 border border-transparent hover:border-slate-700/30',
                isCollapsed && 'justify-center'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-r-full" />
              )}

              <div className={cn(
                'p-2 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-gradient-to-br from-amber-600/30 to-amber-500/20 text-amber-400'
                  : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700/30'
              )}>
                <Icon className="w-5 h-5" />
              </div>

              {!isCollapsed && (
                <>
                  <span className={cn(
                    'flex-1 text-sm font-semibold text-left transition-colors',
                    isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                  )}>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      'bg-gradient-to-r from-emerald-600 to-emerald-500',
                      'text-white shadow-lg shadow-emerald-500/30',
                      'animate-pulse-slow'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 p-4',
        'border-t border-slate-800/50'
      )}>
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">System Online</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              All systems operational. Real-time tracking active.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
