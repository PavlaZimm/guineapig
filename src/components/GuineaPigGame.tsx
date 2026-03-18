"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import GuineaPig, { MoodType, ColorType } from "./GuineaPig";
import StatBar from "./StatBar";
import ActionButton from "./ActionButton";

interface Stats {
  hunger: number;    // 0–100, decreases over time
  happiness: number; // 0–100, decreases over time
  cleanliness: number; // 0–100, decreases over time
  energy: number;    // 0–100, decreases when playing, restores when sleeping
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

const COLORS: { value: ColorType; label: string; bg: string }[] = [
  { value: "orange", label: "Oranžové", bg: "bg-orange-400" },
  { value: "brown", label: "Hnědé", bg: "bg-amber-700" },
  { value: "white", label: "Bílé", bg: "bg-gray-200" },
  { value: "black", label: "Černé", bg: "bg-gray-800" },
  { value: "spotted", label: "Strakaté", bg: "bg-orange-300" },
];

const FOODS = [
  { emoji: "🥕", label: "Mrkev", hunger: 25, happiness: 5 },
  { emoji: "🥬", label: "Salát", hunger: 20, happiness: 8 },
  { emoji: "🫑", label: "Paprika", hunger: 15, happiness: 12 },
  { emoji: "🍓", label: "Jahoda", hunger: 10, happiness: 20 },
  { emoji: "🌾", label: "Seno", hunger: 30, happiness: 3 },
];

const MESSAGES_HAPPY = [
  "Jé, jsem tak šťastné! 🎉",
  "Miluji tě! ❤️",
  "To bylo moc dobré! 😊",
  "Hurá! Nejlepší den ever!",
  "Squeek squeek! 🐾",
];

const MESSAGES_HUNGRY = [
  "Chci jíst... 🥺",
  "Žaludek mi kručí...",
  "Nakrm mě prosím! 🥕",
];

const MESSAGES_DIRTY = [
  "Fůj, jsem špinavé!",
  "Potřebuji koupel! 🚿",
  "Prosím, ukliď můj domov!",
];

const MESSAGES_TIRED = [
  "Jsem unavené... 😴",
  "Chci spát...",
  "Zívám! 🥱",
];

const MESSAGES_SAD = [
  "Jsem smutné... 😢",
  "Pohraj si se mnou! 🎾",
  "Nevěnuješ mi pozornost!",
];

const DECAY_INTERVAL = 5000; // 5s per tick
const HUNGER_DECAY = 3;
const HAPPINESS_DECAY = 2;
const CLEANLINESS_DECAY = 1.5;
const ENERGY_RESTORE_SLEEP = 8;
const ENERGY_DECAY_PLAY = 10;

function getRandomMessage(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function GuineaPigGame() {
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [tempName, setTempName] = useState("");
  const [color, setColor] = useState<ColorType>("orange");
  const [stats, setStats] = useState<Stats>({
    hunger: 80,
    happiness: 75,
    cleanliness: 90,
    energy: 85,
  });
  const [mood, setMood] = useState<MoodType>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [emojiCounter, setEmojiCounter] = useState(0);
  const [actionActive, setActionActive] = useState<string | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [age, setAge] = useState(0); // in ticks
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load save from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("guineapig-save");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStarted(true);
        setName(data.name || "Fluffík");
        setColor(data.color || "orange");
        setStats(data.stats || { hunger: 80, happiness: 75, cleanliness: 90, energy: 85 });
        setAge(data.age || 0);
      } catch {}
    }
  }, []);

  // Save to localStorage
  const save = useCallback((currentStats: Stats, currentAge: number, currentName: string, currentColor: ColorType) => {
    localStorage.setItem("guineapig-save", JSON.stringify({
      name: currentName,
      color: currentColor,
      stats: currentStats,
      age: currentAge,
    }));
  }, []);

  // Stat decay loop
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setStats(prev => {
        const next: Stats = {
          hunger: Math.max(0, prev.hunger - HUNGER_DECAY),
          happiness: Math.max(0, prev.happiness - HAPPINESS_DECAY),
          cleanliness: Math.max(0, prev.cleanliness - CLEANLINESS_DECAY),
          energy: isSleeping
            ? Math.min(100, prev.energy + ENERGY_RESTORE_SLEEP)
            : Math.max(0, prev.energy - 0.5),
        };
        setAge(a => {
          const newAge = a + 1;
          save(next, newAge, name, color);
          return newAge;
        });
        return next;
      });
    }, DECAY_INTERVAL);
    return () => clearInterval(interval);
  }, [started, isSleeping, name, color, save]);

  // Auto-mood based on stats
  useEffect(() => {
    if (!started || actionActive) return;
    if (isSleeping) {
      setMood("sleeping");
      return;
    }
    const { hunger, happiness, cleanliness, energy } = stats;
    if (energy < 20) {
      setMood("sleeping");
    } else if (hunger < 20) {
      setMood("hungry");
      showMessage(getRandomMessage(MESSAGES_HUNGRY));
    } else if (cleanliness < 20) {
      setMood("sad");
      showMessage(getRandomMessage(MESSAGES_DIRTY));
    } else if (happiness < 20) {
      setMood("sad");
      showMessage(getRandomMessage(MESSAGES_SAD));
    } else if (happiness > 80 && hunger > 60) {
      setMood("happy");
    } else {
      setMood("idle");
    }
  }, [stats, actionActive, isSleeping, started]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 3500);
  }, []);

  const spawnEmojis = useCallback((emojis: string[]) => {
    const newEmojis: FloatingEmoji[] = emojis.map((emoji, i) => ({
      id: emojiCounter + i,
      emoji,
      x: 30 + Math.random() * 80,
    }));
    setEmojiCounter(c => c + emojis.length);
    setFloatingEmojis(prev => [...prev, ...newEmojis]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => !newEmojis.find(n => n.id === e.id)));
    }, 1200);
  }, [emojiCounter]);

  const doAction = useCallback((action: string, duration: number, fn: () => void) => {
    if (actionActive) return;
    setActionActive(action);
    fn();
    if (actionTimer.current) clearTimeout(actionTimer.current);
    actionTimer.current = setTimeout(() => {
      setActionActive(null);
    }, duration);
  }, [actionActive]);

  const handleFeed = useCallback((food: typeof FOODS[0]) => {
    if (stats.hunger >= 95) {
      showMessage("Už jsem najedené! 🙅");
      setShowFoodMenu(false);
      return;
    }
    doAction("eating", 2000, () => {
      setMood("eating");
      setStats(prev => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + food.hunger),
        happiness: Math.min(100, prev.happiness + food.happiness),
      }));
      spawnEmojis([food.emoji, "😋"]);
      showMessage(`Mňam! ${food.label} je nejlepší! 😋`);
    });
    setShowFoodMenu(false);
  }, [stats.hunger, doAction, spawnEmojis, showMessage]);

  const handlePlay = useCallback(() => {
    if (stats.energy < 15) {
      showMessage("Jsem příliš unavené na hraní! 😴");
      return;
    }
    doAction("playing", 3000, () => {
      setMood("playing");
      setStats(prev => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 25),
        energy: Math.max(0, prev.energy - ENERGY_DECAY_PLAY),
        cleanliness: Math.max(0, prev.cleanliness - 5),
      }));
      spawnEmojis(["🎾", "⚽", "🎉"]);
      showMessage(getRandomMessage(MESSAGES_HAPPY));
    });
  }, [stats.energy, doAction, spawnEmojis, showMessage]);

  const handleClean = useCallback(() => {
    if (stats.cleanliness >= 95) {
      showMessage("Jsem čisté jako lilie! 🌸");
      return;
    }
    doAction("cleaning", 2500, () => {
      setMood("cleaning");
      setStats(prev => ({
        ...prev,
        cleanliness: Math.min(100, prev.cleanliness + 40),
        happiness: Math.min(100, prev.happiness + 10),
      }));
      spawnEmojis(["🚿", "✨", "🌸"]);
      showMessage("Aaah, jak svěží! ✨");
    });
  }, [stats.cleanliness, doAction, spawnEmojis, showMessage]);

  const handlePet = useCallback(() => {
    doAction("petting", 2000, () => {
      setMood("petting");
      setStats(prev => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 15),
      }));
      spawnEmojis(["❤️", "💕", "😊"]);
      showMessage("Purr purr... Miluji mazlení! 💕");
    });
  }, [doAction, spawnEmojis, showMessage]);

  const handleSleep = useCallback(() => {
    setIsSleeping(prev => !prev);
    if (!isSleeping) {
      setMood("sleeping");
      showMessage("Dobrou noc! 😴💤");
    } else {
      showMessage("Dobré ráno! ☀️");
      setMood("idle");
    }
    setActionActive(null);
  }, [isSleeping, showMessage]);

  const handleStart = () => {
    const n = tempName.trim() || "Fluffík";
    setName(n);
    setStarted(true);
    showMessage(`Ahoj! Jsem ${n}! 🐾`);
  };

  const handleReset = () => {
    localStorage.removeItem("guineapig-save");
    setStarted(false);
    setTempName("");
    setStats({ hunger: 80, happiness: 75, cleanliness: 90, energy: 85 });
    setMood("idle");
    setIsSleeping(false);
    setAge(0);
  };

  const daysAlive = Math.floor(age / (86400 / (DECAY_INTERVAL / 1000)));
  const overallHealth = Math.round((stats.hunger + stats.happiness + stats.cleanliness + stats.energy) / 4);

  // START SCREEN
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-float-in">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">🐹 Moje Morče</h1>
          <p className="text-gray-500 mb-6">Pečuj o svého virtuálního mazlíčka!</p>

          <div className="mb-6">
            <GuineaPig mood="happy" color={color} size={140} />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-600 mb-1 text-left">
              Jméno morčete
            </label>
            <input
              type="text"
              placeholder="např. Fluffík, Kvítko, Bubu..."
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleStart()}
              maxLength={16}
              className="w-full border-2 border-pink-200 rounded-xl px-4 py-2 text-center text-lg font-semibold focus:outline-none focus:border-pink-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-2 text-left">
              Barva srsti
            </label>
            <div className="flex gap-2 justify-center flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold text-white border-2 transition-all
                    ${c.bg} ${color === c.value ? "border-pink-500 scale-105 shadow-md" : "border-transparent opacity-70"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Přivítat morče! 🎉
          </button>
        </div>
      </div>
    );
  }

  // MAIN GAME
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full">

        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-pink-700">🐹 {name}</h1>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mt-0.5">
            <span>Den {daysAlive}</span>
            <span>Zdraví: {overallHealth}%</span>
            <span>{overallHealth >= 70 ? "😊" : overallHealth >= 40 ? "😐" : "😰"}</span>
          </div>
        </div>

        {/* Cage / Game Area */}
        <div className="relative bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl shadow-xl p-4 mb-3 overflow-hidden min-h-[220px] flex flex-col items-center justify-end border-4 border-amber-200">

          {/* Cage background details */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Hay */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-yellow-200/60 rounded-b-3xl" />
            <div className="absolute bottom-2 left-4 text-2xl opacity-40">🌾</div>
            <div className="absolute bottom-2 right-6 text-2xl opacity-40">🌾</div>
            {/* Water bottle */}
            <div className="absolute top-4 right-4 text-3xl opacity-60">💧</div>
            {/* Toy */}
            <div className="absolute top-4 left-4 text-2xl opacity-50">🎾</div>
          </div>

          {/* Floating emojis */}
          {floatingEmojis.map(fe => (
            <div
              key={fe.id}
              className="absolute text-2xl pointer-events-none"
              style={{
                left: `${fe.x}%`,
                bottom: "60%",
                animation: "hearts 1.2s ease-out forwards",
              }}
            >
              {fe.emoji}
            </div>
          ))}

          {/* Speech bubble */}
          {message && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1.5 shadow-md text-sm font-semibold text-gray-700 whitespace-nowrap z-10 max-w-[240px] text-center"
              style={{ animation: "speech-bubble 0.3s ease-out forwards" }}
            >
              {message}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
            </div>
          )}

          {/* Guinea pig */}
          <div className="relative z-10 mb-2">
            <GuineaPig mood={actionActive ? (mood as MoodType) : mood} color={color} size={150} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatBar label="Hlad" value={stats.hunger} icon="🥕" color="bg-orange-400" />
          <StatBar label="Štěstí" value={stats.happiness} icon="😊" color="bg-pink-400" />
          <StatBar label="Čistota" value={stats.cleanliness} icon="🚿" color="bg-blue-400" />
          <StatBar label="Energie" value={stats.energy} icon="⚡" color="bg-yellow-400" />
        </div>

        {/* Food menu */}
        {showFoodMenu && (
          <div className="bg-white/90 backdrop-blur rounded-2xl p-3 mb-3 shadow-lg animate-float-in">
            <p className="text-sm font-semibold text-gray-600 mb-2 text-center">Co chceš sníst?</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {FOODS.map(food => (
                <button
                  key={food.label}
                  onClick={() => handleFeed(food)}
                  className="food-item flex flex-col items-center bg-orange-50 hover:bg-orange-100 rounded-xl p-2 border border-orange-200"
                >
                  <span className="text-2xl">{food.emoji}</span>
                  <span className="text-xs text-gray-600">{food.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFoodMenu(false)}
              className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600"
            >
              Zavřít ✕
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <ActionButton
            emoji="🥕"
            label="Krmit"
            color="bg-orange-400"
            onClick={() => setShowFoodMenu(f => !f)}
            disabled={!!actionActive}
            active={showFoodMenu}
          />
          <ActionButton
            emoji="🎾"
            label="Hrát si"
            color="bg-green-500"
            onClick={handlePlay}
            disabled={!!actionActive || stats.energy < 15}
          />
          <ActionButton
            emoji="🚿"
            label="Čistit"
            color="bg-blue-400"
            onClick={handleClean}
            disabled={!!actionActive}
          />
          <ActionButton
            emoji="🤗"
            label="Mazlit"
            color="bg-pink-400"
            onClick={handlePet}
            disabled={!!actionActive}
          />
          <ActionButton
            emoji={isSleeping ? "☀️" : "💤"}
            label={isSleeping ? "Vstát" : "Spát"}
            color={isSleeping ? "bg-yellow-400" : "bg-indigo-400"}
            onClick={handleSleep}
          />
        </div>

        {/* Reset */}
        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Začít znovu
          </button>
        </div>
      </div>
    </div>
  );
}
