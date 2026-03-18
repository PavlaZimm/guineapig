"use client";

export interface Achievements {
  fed10: boolean;
  played10: boolean;
  cleaned5: boolean;
  petted10: boolean;
  minigame10: boolean;
  supercare: boolean;
  day3: boolean;
}

export interface Counts {
  fed: number;
  played: number;
  cleaned: number;
  petted: number;
  minigameHighscore: number;
}

export const DEFAULT_ACHIEVEMENTS: Achievements = {
  fed10: false,
  played10: false,
  cleaned5: false,
  petted10: false,
  minigame10: false,
  supercare: false,
  day3: false,
};

export const DEFAULT_COUNTS: Counts = {
  fed: 0,
  played: 0,
  cleaned: 0,
  petted: 0,
  minigameHighscore: 0,
};

const BADGES: { key: keyof Achievements; emoji: string; label: string; desc: string }[] = [
  { key: "fed10",       emoji: "🥕", label: "Kuchař",         desc: "Nakrm morče 10×" },
  { key: "played10",    emoji: "🎾", label: "Kamarád",        desc: "Zahraj si 10×" },
  { key: "cleaned5",    emoji: "🚿", label: "Čistič",         desc: "Vyčisti klec 5×" },
  { key: "petted10",    emoji: "💕", label: "Mazlíček",       desc: "Pohlaď morče 10×" },
  { key: "minigame10",  emoji: "🏆", label: "Šampión",        desc: "Dosáhni 10 bodů v mini-hře" },
  { key: "supercare",   emoji: "⭐", label: "Superpečovatel", desc: "Všechny ukazatele nad 80 %" },
  { key: "day3",        emoji: "📅", label: "Věrný",          desc: "Pečuj 3 dny po sobě" },
];

interface Props {
  achievements: Achievements;
  counts: Counts;
  onClose: () => void;
}

export default function AchievementsPanel({ achievements, counts, onClose }: Props) {
  const total = BADGES.filter(b => achievements[b.key]).length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-float-in">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">🏅 Odznaky ({total}/{BADGES.length})</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {BADGES.map(b => {
            const unlocked = achievements[b.key];
            return (
              <div
                key={b.key}
                className={`flex items-center gap-3 rounded-2xl p-3 transition-all
                  ${unlocked ? "bg-yellow-50 border-2 border-yellow-300" : "bg-gray-50 border-2 border-gray-200 opacity-60"}`}
              >
                <span className={`text-3xl ${unlocked ? "" : "grayscale opacity-40"}`}>{b.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm ${unlocked ? "text-yellow-700" : "text-gray-500"}`}>
                    {b.label}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{b.desc}</div>
                </div>
                {unlocked
                  ? <span className="text-green-500 text-lg">✓</span>
                  : <span className="text-gray-300 text-lg">🔒</span>}
              </div>
            );
          })}
        </div>

        <div className="px-4 pb-4 text-center text-xs text-gray-400">
          Krmení: {counts.fed} · Hraní: {counts.played} · Čistění: {counts.cleaned} · Mazlení: {counts.petted}
        </div>
      </div>
    </div>
  );
}
