export default function LiveMapPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-amber-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Live Map View</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Ready for implementation. This will display live pilot positions, 
          VATSIM-style aircraft icons, flight routes, and real-time tracking.
        </p>
      </div>
    </div>
  );
}
