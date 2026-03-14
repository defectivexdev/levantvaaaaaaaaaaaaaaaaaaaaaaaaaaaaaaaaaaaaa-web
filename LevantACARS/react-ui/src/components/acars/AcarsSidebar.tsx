import { Plane, Activity, Radio, Map, Settings, Cloud, BarChart3, FileText, Wifi } from "lucide-react";
import { cn } from "./ui/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  altitude: number;
  speed: number;
  fuel: number;
  phase: string;
  unreadComms?: number;
}

const menuItems = [
  { id: "overview", label: "Overview", icon: BarChart3, shortLabel: "OVR" },
  { id: "instruments", label: "Instruments", icon: Activity, shortLabel: "INST" },
  { id: "communications", label: "Communications", icon: Radio, shortLabel: "COMM" },
  { id: "flightplan", label: "Flight Plan", icon: Map, shortLabel: "FPL" },
  { id: "weather", label: "Weather", icon: Cloud, shortLabel: "WX" },
  { id: "systems", label: "Systems", icon: Settings, shortLabel: "SYS" },
  { id: "reports", label: "Reports", icon: FileText, shortLabel: "REP" },
];

const phaseColors: Record<string, string> = {
  PREFLIGHT: "text-slate-400 bg-slate-700",
  TAXI: "text-yellow-400 bg-yellow-500/20",
  TAKEOFF: "text-orange-400 bg-orange-500/20",
  CLIMB: "text-blue-400 bg-blue-500/20",
  CRUISE: "text-green-400 bg-green-500/20",
  DESCENT: "text-purple-400 bg-purple-500/20",
  APPROACH: "text-amber-400 bg-amber-500/20",
  LANDED: "text-teal-400 bg-teal-500/20",
};

export function Sidebar({ activeTab, onTabChange, altitude, speed, fuel, phase, unreadComms = 0 }: SidebarProps) {
  const phaseColor = phaseColors[phase] || phaseColors.CRUISE;

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 min-h-screen sticky top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wider">VIRTUAL AIRLINES</h2>
            <p className="text-xs text-blue-400 font-mono tracking-widest">ACARS v4.0</p>
          </div>
        </div>
      </div>

      {/* Flight Info */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-slate-500">Flight</p>
            <p className="text-sm text-white font-mono font-bold">VA123</p>
          </div>
          <div className={cn("px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wider", phaseColor)}>
            {phase}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">KJFK → EGLL</span>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-mono">LINK</span>
          </div>
        </div>
      </div>

      {/* Live Mini Stats */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900 rounded-lg p-2 text-center border border-slate-800">
            <p className="text-xs text-slate-500 mb-0.5">ALT</p>
            <p className="text-xs text-white font-mono font-bold">{Math.round(altitude / 1000)}K</p>
            <p className="text-xs text-slate-600">ft</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 text-center border border-slate-800">
            <p className="text-xs text-slate-500 mb-0.5">GS</p>
            <p className="text-xs text-white font-mono font-bold">{Math.round(speed)}</p>
            <p className="text-xs text-slate-600">kts</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 text-center border border-slate-800">
            <p className="text-xs text-slate-500 mb-0.5">FUEL</p>
            <p className={cn("text-xs font-mono font-bold", fuel < 20 ? "text-red-400" : fuel < 35 ? "text-yellow-400" : "text-white")}>
              {Math.round(fuel)}%
            </p>
            <p className="text-xs text-slate-600">rem</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3">
        <p className="text-xs text-slate-600 font-mono px-2 mb-2 tracking-widest">NAVIGATION</p>
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasNotif = item.id === "communications" && unreadComms > 0;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative group",
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-full" />
                )}
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                <span className={cn("text-sm font-medium", isActive ? "text-blue-300" : "")}>{item.label}</span>
                {hasNotif && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadComms}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">ACARS Signal</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={cn("w-1.5 rounded-sm", i <= 4 ? "bg-green-400" : "bg-slate-700")}
                  style={{ height: `${i * 3 + 4}px` }} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Uptime</span>
            <span className="text-green-400 font-mono">02:23:47</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Messages</span>
            <span className="text-slate-400 font-mono">8 recv / 3 sent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
