import React from "react";
import { cn } from "./utils";

interface StatBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatBox({
  label,
  value,
  icon: Icon,
  trend,
  className,
  ...props
}: StatBoxProps) {
  return (
    <div
      className={cn(
        "glass-card p-6 flex flex-col gap-2 relative overflow-hidden group",
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium mb-1",
              trend.isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
    </div>
  );
}
