"use client";

interface StatBarProps {
  label: string;
  emoji: string;
  value: number;
  max?: number;
  color: string;
}

export default function StatBar({ label, emoji, value, max = 100, color }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const isLow = pct < 25;

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-7 text-center">{emoji}</span>
      <span className="text-xs font-semibold text-gray-600 w-20">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isLow ? "animate-pulse" : ""}`}
          style={{ width: `${pct}%`, backgroundColor: isLow ? "#EF4444" : color }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}
