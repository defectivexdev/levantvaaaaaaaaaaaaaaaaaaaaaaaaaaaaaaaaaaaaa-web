import { Wifi, WifiOff, Database } from 'lucide-react';
import Badge from './ui/Badge';

interface ConnectionStatusProps {
  isConnected: boolean;
  useMockData?: boolean;
  lastUpdate?: Date;
}

export default function ConnectionStatus({ 
  isConnected, 
  useMockData = false,
  lastUpdate 
}: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <Badge variant="success" className="text-[10px]">
            Connected
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-400" />
          <Badge variant="danger" className="text-[10px]">
            Offline
          </Badge>
        </div>
      )}

      {useMockData && (
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          <Badge variant="warning" className="text-[10px]">
            Mock Data
          </Badge>
        </div>
      )}

      {lastUpdate && (
        <span className="text-[10px] text-slate-500 font-mono">
          Updated {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
