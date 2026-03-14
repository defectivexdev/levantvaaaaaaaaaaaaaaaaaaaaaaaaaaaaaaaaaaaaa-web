import { ZoomIn, ZoomOut, Maximize2, Layers, Filter } from 'lucide-react';
import { Button } from './ui/button';

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitBounds?: () => void;
  onToggleLayers?: () => void;
  onToggleFilters?: () => void;
  showLayersButton?: boolean;
  showFiltersButton?: boolean;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onFitBounds,
  onToggleLayers,
  onToggleFilters,
  showLayersButton = true,
  showFiltersButton = true,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 shadow-2xl">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            className="w-10 h-10 p-0"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            className="w-10 h-10 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onFitBounds}
            className="w-10 h-10 p-0"
            title="Fit All Pilots"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showLayersButton && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 shadow-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLayers}
            className="w-10 h-10 p-0"
            title="Toggle Layers"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </div>
      )}

      {showFiltersButton && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-2 shadow-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFilters}
            className="w-10 h-10 p-0"
            title="Toggle Filters"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
