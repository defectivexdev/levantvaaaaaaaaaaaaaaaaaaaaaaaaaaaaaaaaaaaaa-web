'use client';

import dynamic from 'next/dynamic';
import { Globe } from 'lucide-react';

const LiveMapClient = dynamic(() => import('@/components/LiveMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-200px)] bg-panel rounded-2xl border border-white/10 flex items-center justify-center">
      <div className="text-center">
        <Globe className="w-12 h-12 text-accent-gold mx-auto mb-4 animate-pulse" />
        <p className="text-gray-400 text-sm">Loading Live Map...</p>
      </div>
    </div>
  )
});

export default function LiveMapPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tighter text-white mb-2">
            Live Flight Tracker
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time aircraft positions and flight status updates
          </p>
        </div>
      </div>

      <div className="w-full h-[calc(100vh-200px)]">
        <LiveMapClient />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/40" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Boarding/Preflight</span>
          </div>
          <p className="text-white text-xs">Aircraft preparing for departure</p>
        </div>

        <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Taxi</span>
          </div>
          <p className="text-white text-xs">Moving to/from runway</p>
        </div>

        <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cruise</span>
          </div>
          <p className="text-white text-xs">En-route at cruise altitude</p>
        </div>

        <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/40" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descent/Approach</span>
          </div>
          <p className="text-white text-xs">Approaching destination</p>
        </div>
      </div>
    </div>
  );
}
