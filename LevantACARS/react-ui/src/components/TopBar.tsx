import { Bell, Search, User, Wifi } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TopBarProps {
  className?: string;
}

export default function TopBar({ className }: TopBarProps) {
  return (
    <header
      className={cn(
        'h-16 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950',
        'border-b border-slate-800/50 backdrop-blur-xl',
        'flex items-center justify-between px-6',
        className
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
          <input
            type="text"
            placeholder="Search flights, pilots..."
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-xl',
              'bg-slate-800/50 border border-slate-700/50',
              'text-sm text-slate-200 placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50',
              'transition-all duration-200',
              'hover:bg-slate-800/70 hover:border-slate-600/50'
            )}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-300">Connected</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700/30 transition-all duration-200 group">
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/30 transition-all duration-200 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
              Pilot
            </p>
            <p className="text-[10px] text-slate-500 font-medium">LVT001</p>
          </div>
        </button>
      </div>
    </header>
  );
}
