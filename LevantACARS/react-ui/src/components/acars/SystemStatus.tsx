import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertCircle, CheckCircle2, Settings, Wifi, Database, Activity, Zap, Wind, Cpu, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SystemItem {
  name: string;
  status: "OPERATIONAL" | "WARNING" | "OFFLINE" | "STANDBY";
  value?: string;
  health?: number;
  subsystem?: string;
}

interface SystemStatusProps {
  systems: SystemItem[];
}

// Performance history data (simulated)
const perfHistory = Array.from({ length: 20 }, (_, i) => ({
  t: i,
  cpu: Math.round(45 + Math.sin(i * 0.4) * 15 + Math.random() * 10),
  mem: Math.round(62 + Math.sin(i * 0.3) * 8 + Math.random() * 5),
  link: Math.round(88 + Math.sin(i * 0.5) * 8 + Math.random() * 4),
}));

const subsystemGroups = [
  {
    name: "Avionics",
    icon: Cpu,
    color: "text-blue-400",
    borderColor: "border-blue-500/20",
    systems: [
      { name: "FMS / FMGEC", status: "OPERATIONAL", value: "DB: 2401", health: 100 },
      { name: "ACARS Datalink", status: "OPERATIONAL", value: "Signal: Strong", health: 96 },
      { name: "GPS / IRS", status: "OPERATIONAL", value: "Acc: ±3m", health: 100 },
      { name: "TCAS II", status: "OPERATIONAL", value: "Mode: TA/RA", health: 100 },
    ],
  },
  {
    name: "Propulsion",
    icon: Wind,
    color: "text-orange-400",
    borderColor: "border-orange-500/20",
    systems: [
      { name: "Engine 1 — GEnx", status: "OPERATIONAL", value: "N1: 88% N2: 92%", health: 98 },
      { name: "Engine 2 — GEnx", status: "OPERATIONAL", value: "N1: 88% N2: 92%", health: 99 },
      { name: "APU", status: "STANDBY", value: "Ready", health: 100 },
      { name: "Fuel System", status: "OPERATIONAL", value: "Crossfeed: NORM", health: 100 },
    ],
  },
  {
    name: "Flight Controls",
    icon: Activity,
    color: "text-green-400",
    borderColor: "border-green-500/20",
    systems: [
      { name: "Autopilot", status: "OPERATIONAL", value: "Mode: NAV/VNAV", health: 100 },
      { name: "Autothrottle", status: "OPERATIONAL", value: "Mode: SPD", health: 100 },
      { name: "Primary FCS", status: "OPERATIONAL", value: "Active: NORMAL", health: 100 },
      { name: "Weather Radar", status: "OPERATIONAL", value: "Rng: 320NM", health: 100 },
    ],
  },
  {
    name: "Hydraulics & Elec",
    icon: Zap,
    color: "text-purple-400",
    borderColor: "border-purple-500/20",
    systems: [
      { name: "Hydraulics — SYS 1", status: "OPERATIONAL", value: "3000 psi", health: 100 },
      { name: "Hydraulics — SYS 2", status: "OPERATIONAL", value: "3000 psi", health: 100 },
      { name: "AC Bus 1 / 2", status: "OPERATIONAL", value: "115V / 400Hz", health: 100 },
      { name: "Pressurization", status: "OPERATIONAL", value: "Cabin: 8000ft", health: 100 },
    ],
  },
];

const statusConfig = {
  OPERATIONAL: {
    icon: CheckCircle2,
    badge: "bg-green-500/20 text-green-400 border-green-500/40",
    dot: "bg-green-400",
    label: "OPER",
  },
  WARNING: {
    icon: AlertCircle,
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    dot: "bg-yellow-400",
    label: "WARN",
  },
  OFFLINE: {
    icon: AlertCircle,
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
    dot: "bg-red-400",
    label: "OFFL",
  },
  STANDBY: {
    icon: CheckCircle2,
    badge: "bg-slate-500/20 text-slate-400 border-slate-500/40",
    dot: "bg-slate-500",
    label: "STBY",
  },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}%</p>
        ))}
      </div>
    );
  }
  return null;
};

export function SystemStatus({ systems }: SystemStatusProps) {
  const allOk = subsystemGroups.every((g) => g.systems.every((s) => s.status !== "OFFLINE"));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <Settings className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold">Systems Status</h2>
        <div className="ml-auto flex items-center gap-2">
          {allOk ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-mono">ALL SYSTEMS NOMINAL</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-mono">ADVISORY ACTIVE</span>
            </>
          )}
        </div>
      </div>

      {/* ACARS Performance */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
            ACARS Link Performance — Last 40 seconds
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perfHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="CPU" />
                <Line type="monotone" dataKey="link" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Link" />
                <Line type="monotone" dataKey="mem" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Mem" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {[
              { label: "CPU Load", value: `${perfHistory[perfHistory.length - 1].cpu}%`, color: "text-blue-400" },
              { label: "ACARS Link", value: `${perfHistory[perfHistory.length - 1].link}%`, color: "text-green-400" },
              { label: "Memory", value: `${perfHistory[perfHistory.length - 1].mem}%`, color: "text-purple-400" },
              { label: "Uplink Rate", value: "2.4 KB/s", color: "text-teal-400" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Operational", count: 15, color: "text-green-400", border: "border-green-500/20 bg-green-500/5" },
          { label: "Standby", count: 1, color: "text-slate-400", border: "border-slate-500/20 bg-slate-800/50" },
          { label: "Warnings", count: 0, color: "text-yellow-400", border: "border-yellow-500/20 bg-yellow-500/5" },
          { label: "Offline", count: 0, color: "text-red-400", border: "border-red-500/20 bg-red-500/5" },
        ].map((cat) => (
          <div key={cat.label} className={`rounded-lg p-3 border ${cat.border} flex items-center justify-between`}>
            <span className="text-xs text-slate-400">{cat.label}</span>
            <span className={`font-mono font-bold text-lg ${cat.color}`}>{cat.count}</span>
          </div>
        ))}
      </div>

      {/* Subsystem Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subsystemGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.name} className={`bg-slate-900/80 border ${group.borderColor}`}>
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${group.color}`} />
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-3">
                  {group.systems.map((sys, idx) => {
                    const cfg = statusConfig[sys.status as keyof typeof statusConfig] || statusConfig.OPERATIONAL;
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-slate-950/50 rounded-lg p-2.5 border border-slate-800">
                        <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.badge.split(" ")[1]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-300 font-medium truncate">{sys.name}</span>
                            <Badge className={`text-xs border ml-2 flex-shrink-0 ${cfg.badge}`}>
                              {cfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${sys.health ?? 100}%`,
                                  backgroundColor: sys.status === "OPERATIONAL" ? "#22c55e" : sys.status === "WARNING" ? "#f59e0b" : "#ef4444",
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-mono flex-shrink-0">{sys.value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fault History */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-yellow-500 rounded-full inline-block" />
            Maintenance & Fault Log
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="space-y-2">
            {[
              { time: "Pre-flight", code: "INFO-001", msg: "Weight & Balance loaded, OFP accepted", level: "INFO" },
              { time: "14:23Z", code: "INFO-002", msg: "ACARS initialized, datalink established", level: "INFO" },
              { time: "14:35Z", code: "INFO-003", msg: "Autoflight engaged: AP1 CMD, AT SPD", level: "INFO" },
              { time: "14:48Z", code: "WARN-001", msg: "Weather Radar: Minor clutter detected, adjusted tilt", level: "WARN" },
            ].map((fault, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-lg p-2.5 border ${
                fault.level === "WARN" ? "bg-yellow-500/5 border-yellow-500/20" : "bg-slate-800/30 border-slate-800"
              }`}>
                <span className="text-xs font-mono text-slate-600 w-14 flex-shrink-0">{fault.time}</span>
                <span className={`text-xs font-mono flex-shrink-0 ${fault.level === "WARN" ? "text-yellow-400" : "text-blue-400"}`}>{fault.code}</span>
                <span className="text-xs text-slate-400">{fault.msg}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
