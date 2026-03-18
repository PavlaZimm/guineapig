"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import GuineaPig, { MoodType, ColorType } from "./GuineaPig";
import StatBar from "./StatBar";
import ActionButton from "./ActionButton";
import MiniGame from "./MiniGame";
import AchievementsPanel, {
  Achievements,
  Counts,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_COUNTS,
} from "./AchievementsPanel";
import { sounds } from "@/lib/sounds";

interface Stats {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

const COLORS: { value: ColorType; label: string; bg: string }[] = [
  { value: "orange",  label: "Oranžové", bg: "bg-orange-400" },
  { value: "brown",   label: "Hnědé",    bg: "bg-amber-700" },
  { value: "white",   label: "Bílé",     bg: "bg-gray-300" },
  { value: "black",   label: "Černé",    bg: "bg-gray-800" },
  { value: "spotted", label: "Strakaté", bg: "bg-orange-300" },
];

const FOODS = [
  { emoji: "🥕", label: "Mrkev",   hunger: 25, happiness: 5  },
  { emoji: "🥬", label: "Salát",   hunger: 20, happiness: 8  },
  { emoji: "🫑", label: "Paprika", hunger: 15, happiness: 12 },
  { emoji: "🍓", label: "Jahoda",  hunger: 10, happiness: 20 },
  { emoji: "🌾", label: "Seno",    hunger: 30, happiness: 3  },
];

const MSG_HAPPY  = ["Jé, jsem tak šťastné! 🎉", "Miluji tě! ❤️", "To bylo moc dobré! 😊", "Hurá! Nejlepší den ever!", "Squeek squeek! 🐾"];
const MSG_HUNGRY = ["Chci jíst... 🥺", "Žaludek mi kručí...", "Nakrm mě prosím! 🥕"];
const MSG_DIRTY  = ["Fůj, jsem špinavé!", "Potřebuji koupel! 🚿", "Prosím, ukliď můj domov!"];
const MSG_SAD    = ["Jsem smutné... 😢", "Pohraj si se mnou! 🎾", "Nevěnuješ mi pozornost!"];

const DECAY_MS          = 5000;
const HUNGER_DECAY      = 3;
const HAPPINESS_DECAY   = 2;
const CLEANLINESS_DECAY = 1.5;
const SLEEP_RESTORE     = 8;

function rnd<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

function checkAchievements(
  counts: Counts,
  stats: Stats,
  age: number,
  prev: Achievements
): [Achievements, string[]] {
  const next = { ...prev };
  const unlocked: string[] = [];
  const push = (key: keyof Achievements, label: string) => {
    if (!prev[key]) { (next[key] as boolean) = true; unlocked.push(label); }
  };
  const days = Math.floor(age / (86400 / (DECAY_MS / 1000)));
  if (counts.fed >= 10) push("fed10", "Kuchař 🥕");
  if (counts.played >= 10) push("played10", "Kamarád 🎾");
  if (counts.cleaned >= 5) push("cleaned5", "Čistič 🚿");
  if (counts.petted >= 10) push("petted10", "Mazlíček 💕");
  if (counts.minigameHighscore >= 10) push("minigame10", "Šampión 🏆");
  if (stats.hunger >= 80 && stats.happiness >= 80 && stats.cleanliness >= 80 && stats.energy >= 80)
    push("supercare", "Superpečovatel ⭐");
  if (days >= 3) push("day3", "Věrný 📅");
  return [next, unlocked];
}

export default function GuineaPigGame() {
  const [started, setStarted]           = useState(false);
  const [name, setName]                 = useState("");
  const [tempName, setTempName]         = useState("");
  const [color, setColor]               = useState<ColorType>("orange");
  const [stats, setStats]               = useState<Stats>({ hunger: 80, happiness: 75, cleanliness: 90, energy: 85 });
  const [mood, setMood]                 = useState<MoodType>("idle");
  const [message, setMessage]           = useState<string | null>(null);
  const [floatingEmojis, setFloating]   = useState<FloatingEmoji[]>([]);
  const [emojiCtr, setEmojiCtr]         = useState(0);
  const [actionActive, setActionActive] = useState<string | null>(null);
  const [isSleeping, setIsSleeping]     = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [age, setAge]                   = useState(0);
  const [coins, setCoins]               = useState(0);
  const [achievements, setAchievements] = useState<Achievements>(DEFAULT_ACHIEVEMENTS);
  const [counts, setCounts]             = useState<Counts>(DEFAULT_COUNTS);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement]     = useState<string | null>(null);

  const msgTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const achTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("guineapig-save");
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      setStarted(true);
      setName(d.name || "Fluffík");
      setColor(d.color || "orange");
      setStats(d.stats || { hunger: 80, happiness: 75, cleanliness: 90, energy: 85 });
      setAge(d.age || 0);
      setCoins(d.coins || 0);
      setAchievements({ ...DEFAULT_ACHIEVEMENTS, ...(d.achievements || {}) });
      setCounts({ ...DEFAULT_COUNTS, ...(d.counts || {}) });
    } catch {}
  }, []);

  // ─── Save ──────────────────────────────────────────────────────────
  const save = useCallback((
    s: Stats, a: number, n: string, c: ColorType,
    co: number, ach: Achievements, cnt: Counts
  ) => {
    localStorage.setItem("guineapig-save", JSON.stringify({ name: n, color: c, stats: s, age: a, coins: co, achievements: ach, counts: cnt }));
  }, []);

  // ─── Decay loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setStats(prev => {
        const next: Stats = {
          hunger:      Math.max(0, prev.hunger - HUNGER_DECAY),
          happiness:   Math.max(0, prev.happiness - HAPPINESS_DECAY),
          cleanliness: Math.max(0, prev.cleanliness - CLEANLINESS_DECAY),
          energy: isSleeping
            ? Math.min(100, prev.energy + SLEEP_RESTORE)
            : Math.max(0, prev.energy - 0.5),
        };
        setAge(a => {
          const na = a + 1;
          setCoins(co => { setAchievements(ach => { setCounts(cnt => { save(next, na, name, color, co, ach, cnt); return cnt; }); return ach; }); return co; });
          return na;
        });
        return next;
      });
    }, DECAY_MS);
    return () => clearInterval(interval);
  }, [started, isSleeping, name, color, save]);

  // ─── Auto-mood ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!started || actionActive) return;
    if (isSleeping) { setMood("sleeping"); return; }
    const { hunger, happiness, cleanliness, energy } = stats;
    if (energy < 20)       setMood("sleeping");
    else if (hunger < 20)  { setMood("hungry"); showMsg(rnd(MSG_HUNGRY)); }
    else if (cleanliness < 20) { setMood("sad"); showMsg(rnd(MSG_DIRTY)); }
    else if (happiness < 20)   { setMood("sad"); showMsg(rnd(MSG_SAD)); }
    else if (happiness > 80 && hunger > 60) setMood("happy");
    else setMood("idle");
  }, [stats, actionActive, isSleeping, started]); // eslint-disable-line

  // ─── Helpers ───────────────────────────────────────────────────────
  const showMsg = useCallback((msg: string) => {
    setMessage(msg);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(null), 3500);
  }, []);

  const spawnEmojis = useCallback((emojis: string[]) => {
    const list: FloatingEmoji[] = emojis.map((emoji, i) => ({ id: emojiCtr + i, emoji, x: 20 + Math.random() * 60 }));
    setEmojiCtr(c => c + emojis.length);
    setFloating(prev => [...prev, ...list]);
    setTimeout(() => setFloating(prev => prev.filter(e => !list.find(l => l.id === e.id))), 1200);
  }, [emojiCtr]);

  const doAchievementCheck = useCallback((newStats: Stats, newCounts: Counts, newAge: number) => {
    setAchievements(prev => {
      const [next, unlocked] = checkAchievements(newCounts, newStats, newAge, prev);
      if (unlocked.length > 0) {
        sounds.achievement();
        setNewAchievement(unlocked[0]);
        if (achTimer.current) clearTimeout(achTimer.current);
        achTimer.current = setTimeout(() => setNewAchievement(null), 3500);
      }
      return next;
    });
  }, []);

  const doAction = useCallback((action: string, duration: number, fn: () => void) => {
    if (actionActive) return;
    setActionActive(action);
    fn();
    if (actionTimer.current) clearTimeout(actionTimer.current);
    actionTimer.current = setTimeout(() => setActionActive(null), duration);
  }, [actionActive]);

  // ─── Actions ───────────────────────────────────────────────────────
  const handleFeed = useCallback((food: typeof FOODS[0]) => {
    if (stats.hunger >= 95) { showMsg("Už jsem najedené! 🙅"); setShowFoodMenu(false); return; }
    doAction("eating", 2000, () => {
      setMood("eating");
      sounds.feed();
      setStats(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + food.hunger), happiness: Math.min(100, prev.happiness + food.happiness) }));
      setCoins(c => c + 2);
      setCounts(prev => {
        const next = { ...prev, fed: prev.fed + 1 };
        setStats(s => { doAchievementCheck(s, next, age); return s; });
        return next;
      });
      spawnEmojis([food.emoji, "😋"]);
      showMsg(`Mňam! ${food.label} je nejlepší! 😋`);
    });
    setShowFoodMenu(false);
  }, [stats.hunger, doAction, spawnEmojis, showMsg, doAchievementCheck, age]);

  const handlePlay = useCallback(() => {
    if (stats.energy < 15) { showMsg("Jsem příliš unavené na hraní! 😴"); return; }
    doAction("playing", 3000, () => {
      setMood("playing");
      sounds.play();
      setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 25), energy: Math.max(0, prev.energy - 10), cleanliness: Math.max(0, prev.cleanliness - 5) }));
      setCoins(c => c + 3);
      setCounts(prev => {
        const next = { ...prev, played: prev.played + 1 };
        setStats(s => { doAchievementCheck(s, next, age); return s; });
        return next;
      });
      spawnEmojis(["🎾", "⚽", "🎉"]);
      showMsg(rnd(MSG_HAPPY));
    });
  }, [stats.energy, doAction, spawnEmojis, showMsg, doAchievementCheck, age]);

  const handleClean = useCallback(() => {
    if (stats.cleanliness >= 95) { showMsg("Jsem čisté jako lilie! 🌸"); return; }
    doAction("cleaning", 2500, () => {
      setMood("cleaning");
      sounds.clean();
      setStats(prev => ({ ...prev, cleanliness: Math.min(100, prev.cleanliness + 40), happiness: Math.min(100, prev.happiness + 10) }));
      setCoins(c => c + 2);
      setCounts(prev => {
        const next = { ...prev, cleaned: prev.cleaned + 1 };
        setStats(s => { doAchievementCheck(s, next, age); return s; });
        return next;
      });
      spawnEmojis(["🚿", "✨", "🌸"]);
      showMsg("Aaah, jak svěží! ✨");
    });
  }, [stats.cleanliness, doAction, spawnEmojis, showMsg, doAchievementCheck, age]);

  const handlePet = useCallback(() => {
    doAction("petting", 2000, () => {
      setMood("petting");
      sounds.pet();
      setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 15) }));
      setCoins(c => c + 1);
      setCounts(prev => {
        const next = { ...prev, petted: prev.petted + 1 };
        setStats(s => { doAchievementCheck(s, next, age); return s; });
        return next;
      });
      spawnEmojis(["❤️", "💕", "😊"]);
      showMsg("Purr purr... Miluji mazlení! 💕");
    });
  }, [doAction, spawnEmojis, showMsg, doAchievementCheck, age]);

  const handleSleep = useCallback(() => {
    setIsSleeping(prev => {
      if (!prev) { setMood("sleeping"); showMsg("Dobrou noc! 😴💤"); sounds.sleep(); }
      else { showMsg("Dobré ráno! ☀️"); setMood("idle"); }
      return !prev;
    });
    setActionActive(null);
  }, [showMsg]);

  const handleMiniGameClose = useCallback((coinsEarned: number) => {
    setShowMiniGame(false);
    if (coinsEarned > 0) {
      setCoins(c => c + coinsEarned);
      sounds.coins();
      showMsg(`Získal/a jsi ${coinsEarned} mincí! 🪙`);
      spawnEmojis(["🪙", "🎮", "🏅"]);
      setCounts(prev => {
        const score = Math.floor(coinsEarned / 2);
        const next = { ...prev, minigameHighscore: Math.max(prev.minigameHighscore, score) };
        setStats(s => { doAchievementCheck(s, next, age); return s; });
        return next;
      });
    }
  }, [showMsg, spawnEmojis, doAchievementCheck, age]);

  const handleStart = () => {
    const n = tempName.trim() || "Fluffík";
    setName(n);
    setStarted(true);
    showMsg(`Ahoj! Jsem ${n}! 🐾`);
  };

  const handleReset = () => {
    localStorage.removeItem("guineapig-save");
    setStarted(false); setTempName(""); setCoins(0);
    setStats({ hunger: 80, happiness: 75, cleanliness: 90, energy: 85 });
    setMood("idle"); setIsSleeping(false); setAge(0);
    setAchievements(DEFAULT_ACHIEVEMENTS); setCounts(DEFAULT_COUNTS);
  };

  const daysAlive = Math.floor(age / (86400 / (DECAY_MS / 1000)));
  const overallHealth = Math.round((stats.hunger + stats.happiness + stats.cleanliness + stats.energy) / 4);
  const achCount = Object.values(achievements).filter(Boolean).length;

  // ─── Start screen ──────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-float-in">
          <h1 className="text-4xl font-bold text-pink-600 mb-1">🐹 Moje Morče</h1>
          <p className="text-gray-500 mb-5 text-sm">Pečuj o svého virtuálního mazlíčka!</p>
          <div className="mb-5"><GuineaPig mood="happy" color={color} size={130} /></div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1 text-left">Jméno morčete</label>
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
            <label className="block text-sm font-semibold text-gray-600 mb-2 text-left">Barva srsti</label>
            <div className="flex gap-2 justify-center flex-wrap">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold text-white border-2 transition-all ${c.bg}
                    ${color === c.value ? "border-pink-500 scale-105 shadow-md" : "border-transparent opacity-70"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleStart}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-2xl text-lg shadow-md transition-all hover:scale-105 active:scale-95">
            Přivítat morče! 🎉
          </button>
        </div>
      </div>
    );
  }

  // ─── Main game ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {showMiniGame && <MiniGame onClose={handleMiniGameClose} />}
      {showAchievements && <AchievementsPanel achievements={achievements} counts={counts} onClose={() => setShowAchievements(false)} />}

      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-pink-700">🐹 {name}</h1>
          <div className="flex justify-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
            <span>Den {daysAlive}</span>
            <span>Zdraví: {overallHealth}%</span>
            <span className="font-semibold text-yellow-600">🪙 {coins}</span>
            <button onClick={() => setShowAchievements(true)}
              className="font-semibold text-orange-500 hover:text-orange-600">
              🏅 {achCount}/7
            </button>
          </div>
        </div>

        {/* Achievement toast */}
        {newAchievement && (
          <div className="mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl px-4 py-2 text-sm font-bold text-center shadow-lg animate-float-in">
            🎉 Nový odznak: {newAchievement}
          </div>
        )}

        {/* Cage */}
        <div className="relative bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl shadow-xl p-4 mb-3 overflow-hidden min-h-[220px] flex flex-col items-center justify-end border-4 border-amber-200">
          {/* BG details */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-yellow-200/60 rounded-b-3xl" />
            <div className="absolute bottom-2 left-4 text-2xl opacity-40">🌾</div>
            <div className="absolute bottom-2 right-6 text-2xl opacity-40">🌾</div>
            <div className="absolute top-4 right-4 text-3xl opacity-60">💧</div>
            <div className="absolute top-4 left-4 text-2xl opacity-50">🎾</div>
          </div>

          {/* Floating emojis */}
          {floatingEmojis.map(fe => (
            <div key={fe.id} className="absolute text-2xl pointer-events-none"
              style={{ left: `${fe.x}%`, bottom: "60%", animation: "hearts 1.2s ease-out forwards" }}>
              {fe.emoji}
            </div>
          ))}

          {/* Speech bubble */}
          {message && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-3 py-1.5 shadow-md text-sm font-semibold text-gray-700 whitespace-nowrap z-10 max-w-[240px] text-center"
              style={{ animation: "speech-bubble 0.3s ease-out forwards" }}>
              {message}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
            </div>
          )}

          {/* Guinea pig */}
          <div className="relative z-10 mb-2">
            <GuineaPig mood={mood} color={color} size={150} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatBar label="Hlad"    value={stats.hunger}      icon="🥕" color="bg-orange-400" />
          <StatBar label="Štěstí"  value={stats.happiness}   icon="😊" color="bg-pink-400" />
          <StatBar label="Čistota" value={stats.cleanliness} icon="🚿" color="bg-blue-400" />
          <StatBar label="Energie" value={stats.energy}      icon="⚡" color="bg-yellow-400" />
        </div>

        {/* Food menu */}
        {showFoodMenu && (
          <div className="bg-white/90 backdrop-blur rounded-2xl p-3 mb-3 shadow-lg animate-float-in">
            <p className="text-sm font-semibold text-gray-600 mb-2 text-center">Co chceš sníst?</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {FOODS.map(food => (
                <button key={food.label} onClick={() => handleFeed(food)}
                  className="food-item flex flex-col items-center bg-orange-50 hover:bg-orange-100 rounded-xl p-2 border border-orange-200">
                  <span className="text-2xl">{food.emoji}</span>
                  <span className="text-xs text-gray-600">{food.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowFoodMenu(false)} className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600">
              Zavřít ✕
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          <ActionButton emoji="🥕" label="Krmit"  color="bg-orange-400" onClick={() => setShowFoodMenu(f => !f)} disabled={!!actionActive} active={showFoodMenu} />
          <ActionButton emoji="🎾" label="Hrát si" color="bg-green-500"  onClick={handlePlay}  disabled={!!actionActive || stats.energy < 15} />
          <ActionButton emoji="🚿" label="Čistit"  color="bg-blue-400"   onClick={handleClean} disabled={!!actionActive} />
          <ActionButton emoji="🤗" label="Mazlit"  color="bg-pink-400"   onClick={handlePet}   disabled={!!actionActive} />
          <ActionButton emoji={isSleeping ? "☀️" : "💤"} label={isSleeping ? "Vstát" : "Spát"} color={isSleeping ? "bg-yellow-400" : "bg-indigo-400"} onClick={handleSleep} />
        </div>

        {/* Mini-game button */}
        <button onClick={() => setShowMiniGame(true)}
          className="btn-action w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold py-3 rounded-2xl shadow-md mb-3 flex items-center justify-center gap-2">
          <span className="text-lg">🎮</span> Mini-hra: Chytej zeleninu! <span className="text-xs opacity-80">(+mince)</span>
        </button>

        {/* Reset */}
        <div className="text-center">
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
            Začít znovu
          </button>
        </div>
      </div>
    </div>
  );
}
