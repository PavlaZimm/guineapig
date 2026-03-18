"use client";

interface ActionButtonProps {
  emoji: string;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  cooldownMs?: number;
  active?: boolean;
}

export default function ActionButton({
  emoji,
  label,
  color,
  onClick,
  disabled = false,
  active = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-action flex flex-col items-center justify-center gap-1 p-3 rounded-2xl
        font-semibold text-white shadow-md min-w-[70px]
        ${color} ${active ? "ring-2 ring-white ring-offset-1" : ""}
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}
