import { ReactNode } from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: ReactNode;
}

export function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-6 flex flex-col shadow-lg shadow-black/10">
      <div className="flex items-center justify-between text-zinc-400 mb-2">
        <h3 className="text-sm font-medium tracking-wide">{title}</h3>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>
      
      <div className="text-3xl font-bold text-white tracking-tight">
        {value}
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${trend.isPositive ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
            {trend.value}
          </span>
          <span className="text-xs text-zinc-500 font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
}
