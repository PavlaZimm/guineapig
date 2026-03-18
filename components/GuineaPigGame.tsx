"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import GuineaPig from "./GuineaPig";
import StatBar from "./StatBar";

type Mood = "happy" | "idle" | "hungry" | "sad" | "sleeping" | "eating" | "playing" | "dirty";
type Color = "orange" | "brown" | "white" | "black" | "spotted";

interface Stats {
  hunger: number;    // 0-100, 100 = full
  happiness: number; // 0-100
  cleanliness: number; // 0-100
  energy: number;    // 0-100
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
}

const COLOR_LABELS: Record<Color, string> = {
  orange: "Oranžové",
  brown: "Hnědé",
  white: "Bílé",
  black: "Černé",
  spotted: "Strakaté",
};

const COLOR_BG: Record<Color, string> = {
  orange: "bg-orange-400",
  brown: "bg-amber-700",
  white: "bg-gray-200",
  black: "bg-gray-800",
  spotted: "bg-amber-500",
};

export default function GuineaPigGame() {
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [color, setColor] = useState<Color>("orange");
  const [stats, setStats] = useState<Stats>({ hunger: 80, happiness: 80, cleanliness: 80, energy: 80 });
  const [mood, setMood] = useState<Mood>("idle");
  const [action, setAction] = useState<string | null>(null);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [score, setScore] = useState(0);
  const [day, setDay] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const actionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatId = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute mood from stats
  const computeMood = useCallback((s: Stats, currentAction: string | null): Mood => {
    if (currentAction === "eating") return "eating";
    if (currentAction === "playing") return "playing";
    if (currentAction === "sleeping") return "sleeping";
    if (currentAction === "bathing") return "dirty";
    if (s.cleanliness < 20) return "dirty";
    if (s.hunger < 20) return "hungry";
    if (s.energy < 20) return "sad";
    if (s.happiness < 20) return "sad";
    const avg = (s.hunger + s.happiness + s.cleanliness + s.energy) / 4;
    if (avg >= 75) return "happy";
    return "idle";
  }, []);

  // Drain stats over time
  useEffect(() => {
    if (!started || gameOver) return;
    tickRef.current = setInterval(() => {
      setStats(prev => {
        const next: Stats = {
          hunger: Math.max(0, prev.hunger - 1.5),
          happiness: Math.max(0, prev.happiness - 1.0),
          cleanliness: Math.max(0, prev.cleanliness - 0.8),
          energy: Math.max(0, prev.energy - 0.6),
        };
        // Advance day roughly every 2 minutes of game time
        setScore(s => s + 1);
        return next;
      });
    }, 2000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [started, gameOver]);

  // Update day counter
  useEffect(() => {
    if (score > 0 && score % 60 === 0) setDay(d => d + 1);
  }, [score]);

  // Check game over — all stats at zero
  useEffect(() => {
    const allLow = Object.values(stats).every(v => v < 5);
    if (allLow && started) setGameOver(true);
  }, [stats, started]);

  // Sync mood
  useEffect(() => {
    setMood(computeMood(stats, action));
  }, [stats, action, computeMood]);

  const addFloat = (text: string) => {
    const id = ++floatId.current;
    const x = 40 + Math.random() * 80;
    const y = 50 + Math.random() * 40;
    setFloats(prev => [...prev, { id, text, x, y }]);
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 1300);
  };

  const doAction = (type: string, statChanges: Partial<Stats>, floatText: string) => {
    if (action) return;
    setAction(type);
    addFloat(floatText);
    setTimeout(() => {
      setStats(prev => {
        const next = { ...prev };
        for (const key of Object.keys(statChanges) as (keyof Stats)[]) {
          next[key] = Math.min(100, prev[key] + (statChanges[key] ?? 0));
        }
        return next;
      });
      setAction(null);
    }, 1800);
  };

  const feed = () => doAction("eating", { hunger: 30, happiness: 5 }, "🥕 Mňam!");
  const play = () => doAction("playing", { happiness: 35, energy: -10, hunger: -8 }, "🎾 Jupí!");
  const groom = () => doAction("bathing", { cleanliness: 40, happiness: 10 }, "✨ Čistounké!");
  const rest = () => doAction("sleeping", { energy: 40, hunger: -5 }, "💤 Odpočívám...");

  const startGame = () => {
    if (!nameInput.trim()) return;
    setName(nameInput.trim());
    setStarted(true);
  };

  const restart = () => {
    setStarted(false);
    setGameOver(false);
    setNameInput("");
    setName("");
    setStats({ hunger: 80, happiness: 80, cleanliness: 80, energy: 80 });
    setScore(0);
    setDay(1);
    setAction(null);
    setFloats([]);
  };

  // ── Setup screen ──────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100 p-4">
        <h1 className="text-4xl font-extrabold text-amber-800 mb-2 drop-shadow">🐾 Morče Tamagotchi</h1>
        <p className="text-amber-600 mb-8 text-center">Pečuj o své virtuální morče a udržuj ho šťastné!</p>

        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md flex flex-col gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-amber-700 mb-1">Jméno morčete</label>
            <input
              className="w-full border-2 border-amber-300 rounded-xl px-4 py-2 text-lg focus:outline-none focus:border-amber-500"
              placeholder="např. Ferda, Ella, Pišta..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && startGame()}
              maxLength={16}
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-bold text-amber-700 mb-2">Barva srsti</label>
            <div className="flex gap-3 flex-wrap">
              {(Object.keys(COLOR_LABELS) as Color[]).map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all
                    ${color === c ? "border-amber-500 scale-105 shadow-md" : "border-transparent hover:border-amber-300"}`}
                >
                  <span className={`w-8 h-8 rounded-full border border-gray-200 ${COLOR_BG[c]}`} />
                  <span className="text-xs text-gray-600">{COLOR_LABELS[c]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex justify-center">
            <GuineaPig mood="idle" name={nameInput || "???"} color={color} />
          </div>

          <button
            onClick={startGame}
            disabled={!nameInput.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed
              text-white font-bold text-lg py-3 rounded-2xl shadow transition-all active:scale-95"
          >
            Začít hrát! 🐾
          </button>
        </div>
      </div>
    );
  }

  // ── Game Over ─────────────────────────────────────────────────
  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-200 to-gray-400 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center flex flex-col gap-4">
          <div className="text-6xl">😢</div>
          <h2 className="text-2xl font-bold text-gray-700">{name} potřebuje více péče!</h2>
          <p className="text-gray-500">Přežilo {day - 1} {day === 2 ? "den" : day < 5 ? "dny" : "dní"}</p>
          <p className="text-sm text-gray-400">Nezapomeň morče pravidelně krmit, hrát si s ním, čistit ho a nechat odpočívat!</p>
          <button
            onClick={restart}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl shadow transition-all"
          >
            Zkusit znovu 🔄
          </button>
        </div>
      </div>
    );
  }

  // ── Main game ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center p-4 pb-8">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center py-3">
        <div className="text-sm font-bold text-amber-700">📅 Den {day}</div>
        <h1 className="text-xl font-extrabold text-amber-800">🐾 Morče Tamagotchi</h1>
        <button onClick={restart} className="text-xs text-gray-400 hover:text-gray-600">Nová hra</button>
      </div>

      {/* Scene */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-inner mb-4"
        style={{
          background: "linear-gradient(180deg, #87CEEB 0%, #B0E2FF 40%, #8FBC6E 70%, #7AAA5E 100%)",
          minHeight: 220,
        }}
      >
        {/* Clouds */}
        <div className="absolute top-4 left-8 opacity-70">
          <div className="bg-white rounded-full w-16 h-8" />
          <div className="bg-white rounded-full w-10 h-6 -mt-5 ml-4" />
        </div>
        <div className="absolute top-6 right-12 opacity-60">
          <div className="bg-white rounded-full w-12 h-6" />
          <div className="bg-white rounded-full w-8 h-5 -mt-4 ml-3" />
        </div>

        {/* Grass details */}
        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: "linear-gradient(180deg, #8FBC6E 0%, #6B9B4E 100%)" }} />

        {/* Floating texts */}
        {floats.map(f => (
          <div
            key={f.id}
            className="absolute float-up text-2xl font-bold pointer-events-none z-20"
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            {f.text}
          </div>
        ))}

        {/* Guinea pig */}
        <div className="flex justify-center items-end" style={{ minHeight: 220, paddingBottom: 16 }}>
          <GuineaPig mood={mood} name={name} color={color} />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow p-4 w-full max-w-md flex flex-col gap-3 mb-4">
        <StatBar label="Hlad"       emoji="🥕" value={stats.hunger}      color="#F59E0B" />
        <StatBar label="Štěstí"     emoji="💛" value={stats.happiness}   color="#F472B6" />
        <StatBar label="Čistota"    emoji="🛁" value={stats.cleanliness} color="#60A5FA" />
        <StatBar label="Energie"    emoji="⚡" value={stats.energy}      color="#34D399" />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        <ActionButton
          emoji="🥕"
          label="Nakrmit"
          sublabel="Dát zeleninu"
          color="bg-amber-400 hover:bg-amber-500"
          disabled={!!action || stats.hunger >= 95}
          onClick={feed}
        />
        <ActionButton
          emoji="🎾"
          label="Hrát si"
          sublabel="Pobíhat & skákat"
          color="bg-pink-400 hover:bg-pink-500"
          disabled={!!action || stats.energy < 15}
          onClick={play}
        />
        <ActionButton
          emoji="🪮"
          label="Česat"
          sublabel="Vyčistit srst"
          color="bg-blue-400 hover:bg-blue-500"
          disabled={!!action || stats.cleanliness >= 95}
          onClick={groom}
        />
        <ActionButton
          emoji="😴"
          label="Spát"
          sublabel="Nechat odpočívat"
          color="bg-indigo-400 hover:bg-indigo-500"
          disabled={!!action || stats.energy >= 95}
          onClick={rest}
        />
      </div>

      {/* Low stat warnings */}
      <div className="mt-3 flex flex-col gap-1 w-full max-w-md">
        {stats.hunger < 25      && <Warning text={`${name} je hladové! 🥕`} />}
        {stats.happiness < 25   && <Warning text={`${name} chce si hrát! 🎾`} />}
        {stats.cleanliness < 25 && <Warning text={`${name} potřebuje vyčesat! 🪮`} />}
        {stats.energy < 25      && <Warning text={`${name} je unavené! 😴`} />}
      </div>
    </div>
  );
}

function ActionButton({ emoji, label, sublabel, color, disabled, onClick }: {
  emoji: string; label: string; sublabel: string; color: string; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${disabled ? "bg-gray-200 cursor-not-allowed text-gray-400" : `${color} text-white active:scale-95`}
        rounded-2xl p-4 flex flex-col items-center gap-1 shadow transition-all font-semibold`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-xs opacity-75">{sublabel}</span>
    </button>
  );
}

function Warning({ text }: { text: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600 font-medium animate-pulse text-center">
      ⚠️ {text}
    </div>
  );
}
