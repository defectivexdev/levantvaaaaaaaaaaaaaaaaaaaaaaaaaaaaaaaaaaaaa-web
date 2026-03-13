import React from "react";
import { cn } from "@/lib/utils";
import { Plane, Clock, MapPin, ArrowRight } from "lucide-react";

export interface FlightRowProps extends React.HTMLAttributes<HTMLDivElement> {
  flight: {
    id: string;
    callsign: string;
    departure: string;
    arrival: string;
    status: "departed" | "arrived" | "scheduled" | "delayed";
    aircraft: string;
    duration?: string;
  };
}

export function FlightRow({ flight, className, ...props }: FlightRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "departed":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "arrived":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "delayed":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-panel/50 hover:bg-panel transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            {flight.callsign}
          </span>
          <span className="text-sm text-slate-500 font-mono">{flight.aircraft}</span>
        </div>

        <div className="hidden md:flex items-center gap-4 px-6 border-x border-white/10">
          <div className="text-center flex flex-col">
            <span className="text-xl font-bold text-white font-mono tracking-wider">{flight.departure}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center w-24">
            <ArrowRight className="w-5 h-5 text-slate-500" />
            {flight.duration && (
              <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {flight.duration}
              </span>
            )}
          </div>

          <div className="text-center flex flex-col">
            <span className="text-xl font-bold text-white font-mono tracking-wider">{flight.arrival}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={cn(
            "px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-md border",
            getStatusColor(flight.status)
          )}
        >
          {flight.status}
        </span>
      </div>
    </div>
  );
}
