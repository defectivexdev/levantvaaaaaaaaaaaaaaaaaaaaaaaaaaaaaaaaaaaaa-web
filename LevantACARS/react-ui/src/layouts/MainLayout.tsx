import ParticleBackground from '@/components/ui/ParticleBackground';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      <ParticleBackground />
      
      {/* Sidebar */}
      <Sidebar className="relative z-10" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-purple-600/5 pointer-events-none" />
          <div className="relative h-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="h-10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-xl border-t border-slate-800/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-xs text-slate-300 font-medium">System Ready</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-mono">v2.0.0</span>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs text-slate-500">Powered by React + Vite</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
