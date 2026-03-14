'use client';

import { cn } from '@/lib/utils';

export type FlightStatus = 
  | 'boarding' 
  | 'taxi' 
  | 'takeoff' 
  | 'climb' 
  | 'cruise' 
  | 'descent' 
  | 'approach' 
  | 'landed' 
  | 'completed'
  | 'preflight';

interface FlightStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  boarding: {
    label: 'Boarding',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  preflight: {
    label: 'Preflight',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  taxi: {
    label: 'Taxi',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  takeoff: {
    label: 'Takeoff',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  climb: {
    label: 'Climb',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  cruise: {
    label: 'Cruise',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  descent: {
    label: 'Descent',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  approach: {
    label: 'Approach',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  landed: {
    label: 'Landed',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20'
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20'
  }
};

export default function FlightStatusBadge({ status, className }: FlightStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.boarding;

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <span className="relative flex h-2 w-2 mr-2">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          config.bgColor
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          config.color.replace('text-', 'bg-')
        )}></span>
      </span>
      {config.label}
    </span>
  );
}
