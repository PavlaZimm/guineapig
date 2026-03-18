"use client";

interface StatBarProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export default function StatBar({ label, value, icon, color }: StatBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isLow = clamped <= 20;
  const isMedium = clamped <= 50;

  const barColor = isLow
    ? "bg-red-400"
    : isMedium
    ? "bg-yellow-400"
    : color;

  return (
    <div className={`rounded-xl p-3 bg-white/60 backdrop-blur ${isLow ? "animate-danger-pulse" : ""}`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <span className="text-base">{icon}</span>
          {label}
        </span>
        <span className={`text-xs font-bold ${isLow ? "text-red-500" : "text-gray-500"}`}>
          {Math.round(clamped)}%
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full stat-bar-fill ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
