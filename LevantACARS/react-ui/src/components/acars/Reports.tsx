import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileText, Download, Clock, BarChart2, Fuel, Navigation, CheckCircle2, Send, RefreshCw } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, BarChart, Bar,
} from "recharts";

interface Report {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: "COMPLETED" | "PENDING" | "PROCESSING";
  details?: string;
}

const mockReports: Report[] = [
  { id: "REP001", type: "Position Report", title: "Position Report — DIETZ", timestamp: "14:38 UTC", status: "COMPLETED", details: "FL350 / N47.4 W052.3 / GS485 / STAFA ETA 15:12Z" },
  { id: "REP002", type: "Departure Report", title: "Off-Block — KJFK", timestamp: "14:23 UTC", status: "COMPLETED", details: "RWY 22L / Winds 240@12 / TOW 245,800 kg / FOB 72,800 kg" },
  { id: "REP003", type: "Fuel Report", title: "Fuel Status — Midpoint", timestamp: "14:45 UTC", status: "COMPLETED", details: "Actual: 65.2% / Plan: 66.1% / Delta: -0.9% — NOMINAL" },
  { id: "REP004", type: "Weather Brief", title: "En-route Weather Update", timestamp: "14:30 UTC", status: "COMPLETED", details: "EGLL -RA BKN015 12/10 Q1008. Holding fuel onboard." },
  { id: "REP005", type: "Arrival Report", title: "Arrival at EGLL", timestamp: "Pending", status: "PENDING", details: "ETA 20:42 UTC — not yet generated" },
];

// Fuel burn chart data
const fuelBurnData = [
  { time: "14:23", planned: 72800, actual: 72800 },
  { time: "14:30", planned: 71200, actual: 71100 },
  { time: "14:38", planned: 69800, actual: 69750 },
  { time: "14:45", planned: 68600, actual: 68550 },
  { time: "14:52", planned: 67200, actual: 67100 },
  { time: "15:00", planned: 65800, actual: 65700 },
];

// Altitude/Speed profile over time
const performanceData = [
  { time: "14:23", altitude: 0, speed: 0 },
  { time: "14:28", altitude: 8000, speed: 280 },
  { time: "14:33", altitude: 18000, speed: 380 },
  { time: "14:38", altitude: 35000, speed: 480 },
  { time: "14:45", altitude: 35000, speed: 485 },
  { time: "15:00", altitude: 35000, speed: 485 },
];

// Fuel flow per engine
const fuelFlowData = [
  { time: "14:23", eng1: 4200, eng2: 4180 },
  { time: "14:30", eng1: 3600, eng2: 3580 },
  { time: "14:38", eng1: 2860, eng2: 2840 },
  { time: "14:45", eng1: 2850, eng2: 2835 },
  { time: "15:00", eng1: 2850, eng2: 2840 },
];

const statusConfig = {
  COMPLETED: { badge: "bg-green-500/20 text-green-400 border-green-500/40", icon: CheckCircle2, iconColor: "text-green-400" },
  PROCESSING: { badge: "bg-blue-500/20 text-blue-400 border-blue-500/40", icon: RefreshCw, iconColor: "text-blue-400" },
  PENDING: { badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", icon: Clock, iconColor: "text-yellow-400" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Reports() {
  const [pirep, setPirep] = useState("");
  const [pirepSent, setPirepSent] = useState(false);

  const sendPirep = () => {
    if (pirep.trim()) {
      setPirepSent(true);
      setTimeout(() => setPirepSent(false), 3000);
      setPirep("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <FileText className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold">Flight Reports & Analytics</h2>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg px-3 py-1.5 transition-colors">
            <Download className="w-3 h-3" />
            Export All Reports
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Reports Filed", value: "4", icon: FileText, color: "text-blue-400", border: "border-blue-500/20 bg-blue-500/5" },
          { label: "Pending", value: "1", icon: Clock, color: "text-yellow-400", border: "border-yellow-500/20 bg-yellow-500/5" },
          { label: "Fuel Delta", value: "-0.9%", icon: Fuel, color: "text-green-400", border: "border-green-500/20 bg-green-500/5" },
          { label: "Compliance", value: "100%", icon: CheckCircle2, color: "text-teal-400", border: "border-teal-500/20 bg-teal-500/5" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`border ${stat.border} bg-transparent`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fuel Burn Chart */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Fuel className="w-4 h-4 text-orange-400" />
              Fuel Burn — Planned vs Actual (kg)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelBurnData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="planned" stroke="#6b7280" strokeWidth={1.5} fill="url(#plannedGrad)" name="Planned" />
                  <Area type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2} fill="url(#actualGrad)" name="Actual" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Altitude / Speed Profile */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              Performance Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={40}
                    tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 10 }}>{v}</span>} />
                  <Line yAxisId="left" type="monotone" dataKey="altitude" stroke="#3b82f6" strokeWidth={2} dot={false} name="Altitude (ft)" />
                  <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#22c55e" strokeWidth={2} dot={false} name="Speed (kts)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Flow per Engine */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-yellow-400" />
            Engine Fuel Flow (kg/hr)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 10 }}>{v}</span>} />
                <Bar dataKey="eng1" fill="#f59e0b" name="Engine 1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="eng2" fill="#ef4444" name="Engine 2" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
            Flight Report Log
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="space-y-2">
            {mockReports.map((report) => {
              const cfg = statusConfig[report.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={report.id}
                  className="bg-slate-800/40 p-4 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800/60 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg mt-0.5">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-slate-500">{report.type}</span>
                          <span className="text-xs text-slate-600 font-mono">{report.id}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{report.title}</p>
                        {report.details && (
                          <p className="text-xs text-slate-400 font-mono mt-1">{report.details}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span className="text-xs text-slate-500 font-mono">{report.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge className={`text-xs border ${cfg.badge}`}>{report.status}</Badge>
                      {report.status === "COMPLETED" && (
                        <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* PIREP Form */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-teal-500 rounded-full inline-block" />
            PIREP — Pilot Report
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-800 mb-3">
            <p className="text-xs text-slate-500 font-mono">
              UA /OV STAFA/TM 1512/FL350/TP B789/SK BKN018/WX -RA/TA -54/WV 26585/TB NEG/IC NEG/RM SMOOTH RIDE
            </p>
          </div>
          <textarea
            value={pirep}
            onChange={(e) => setPirep(e.target.value)}
            placeholder="Enter PIREP or remarks for operations..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={sendPirep}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                pirepSent ? "bg-green-600 text-white" : "bg-teal-600 hover:bg-teal-500 text-white"
              }`}
            >
              {pirepSent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {pirepSent ? "PIREP Transmitted!" : "Send PIREP"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

