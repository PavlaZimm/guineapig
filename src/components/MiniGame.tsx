"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { sounds } from "@/lib/sounds";

const W = 320;
const H = 270;
const GP_SPEED = 230; // px/s
const SPAWN_START = 1100; // ms
const SPAWN_MIN = 550; // ms

interface Item {
  id: number;
  x: number;
  y: number;
  emoji: string;
  good: boolean;
  points: number;
  speed: number;
}

const GOOD = ["🥕", "🥬", "🫑", "🍓", "🌾", "🍎", "🫐"];
const BAD = ["💩", "🌵", "🪨"];
let nextId = 0;

// Inner game — remounted via key to restart
function GameCanvas({ onGameOver }: { onGameOver: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    gpX: W / 2,
    items: [] as Item[],
    score: 0,
    lives: 3,
    lastTime: 0,
    lastSpawn: 0,
    spawnInterval: SPAWN_START,
    level: 0,
    keys: { left: false, right: false },
  });
  const touchDir = useRef<"left" | "right" | null>(null);
  const rafRef = useRef(0);
  const doneRef = useRef(false);

  const spawn = useCallback(() => {
    const s = stateRef.current;
    const good = Math.random() > 0.22;
    s.items.push({
      id: nextId++,
      x: 20 + Math.random() * (W - 40),
      y: -36,
      emoji: good ? GOOD[Math.floor(Math.random() * GOOD.length)] : BAD[Math.floor(Math.random() * BAD.length)],
      good,
      points: good ? (["🍓", "🫐"].includes(GOOD[0]) ? 2 : 1) : 0,
      speed: 75 + Math.random() * 55 + s.level * 8,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;

    const loop = (ts: number) => {
      if (doneRef.current) return;
      const dt = Math.min((ts - (s.lastTime || ts)) / 1000, 0.05);
      s.lastTime = ts;

      // Spawn
      if (ts - s.lastSpawn > s.spawnInterval) {
        spawn();
        s.lastSpawn = ts;
        s.spawnInterval = Math.max(SPAWN_MIN, s.spawnInterval - 12);
        s.level = Math.floor((SPAWN_START - s.spawnInterval) / 80);
      }

      // Move guinea pig
      if (s.keys.left || touchDir.current === "left")
        s.gpX = Math.max(24, s.gpX - GP_SPEED * dt);
      if (s.keys.right || touchDir.current === "right")
        s.gpX = Math.min(W - 24, s.gpX + GP_SPEED * dt);

      // Update items + collision
      const gpY = H - 28;
      const next: Item[] = [];
      for (const item of s.items) {
        item.y += item.speed * dt;
        const hit = Math.abs(item.x - s.gpX) < 28 && Math.abs(item.y - gpY) < 22;
        if (hit) {
          if (item.good) { s.score += item.points; sounds.collect(); }
          else { s.lives = Math.max(0, s.lives - 1); sounds.miss(); }
        } else if (item.y > H + 36) {
          if (item.good) { s.lives = Math.max(0, s.lives - 1); sounds.miss(); }
        } else {
          next.push(item);
        }
      }
      s.items = next;

      if (s.lives <= 0) {
        doneRef.current = true;
        draw(ctx, s);
        onGameOver(s.score);
        return;
      }

      draw(ctx, s);
      rafRef.current = requestAnimationFrame(loop);
    };

    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") s.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d") s.keys.right = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") s.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") s.keys.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    s.lastSpawn = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [spawn, onGameOver]);

  const onTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX - canvasRef.current!.getBoundingClientRect().left;
    touchDir.current = x < W / 2 ? "left" : "right";
  };
  const onTouchEnd = () => { touchDir.current = null; };
  const onMouseDown = (e: React.MouseEvent) => {
    const x = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    stateRef.current.keys.left = x < W / 2;
    stateRef.current.keys.right = x >= W / 2;
  };
  const onMouseUp = () => {
    stateRef.current.keys.left = false;
    stateRef.current.keys.right = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="block w-full cursor-pointer select-none"
      style={{ touchAction: "none" }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    />
  );
}

function draw(ctx: CanvasRenderingContext2D, s: ReturnType<typeof buildState>) {
  ctx.clearRect(0, 0, W, H);

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#bfdbfe");
  sky.addColorStop(1, "#dbeafe");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Ground
  ctx.fillStyle = "#86efac";
  ctx.fillRect(0, H - 30, W, 30);
  ctx.fillStyle = "#4ade80";
  ctx.fillRect(0, H - 32, W, 4);

  // Items
  ctx.font = "32px serif";
  ctx.textAlign = "center";
  for (const item of s.items) ctx.fillText(item.emoji, item.x, item.y + 16);

  // Guinea pig
  ctx.font = "44px serif";
  ctx.fillText("🐹", s.gpX, H - 2);

  // HUD bar
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, 38);

  ctx.fillStyle = "white";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`🏅 ${s.score}`, 10, 26);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "12px sans-serif";
  ctx.fillText(`Úroveň ${s.level + 1}`, W / 2, 25);

  const hearts = "❤️".repeat(s.lives) + "🖤".repeat(Math.max(0, 3 - s.lives));
  ctx.textAlign = "right";
  ctx.font = "15px serif";
  ctx.fillText(hearts, W - 8, 26);
}

function buildState() {
  return {
    gpX: W / 2,
    items: [] as Item[],
    score: 0,
    lives: 3,
    lastTime: 0,
    lastSpawn: 0,
    spawnInterval: SPAWN_START,
    level: 0,
    keys: { left: false, right: false },
  };
}

interface MiniGameProps {
  onClose: (coinsEarned: number) => void;
}

export default function MiniGame({ onClose }: MiniGameProps) {
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const handleGameOver = useCallback((score: number) => {
    setResult(score);
  }, []);

  const handleRestart = () => {
    setResult(null);
    setGameKey(k => k + 1);
  };

  const coinsEarned = result !== null ? Math.floor(result * 2) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">🎮 Chytej zeleninu!</h2>
          <button onClick={() => onClose(0)} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Canvas */}
        <div className="relative">
          <GameCanvas key={gameKey} onGameOver={handleGameOver} />

          {result !== null && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <div className="text-5xl mb-2">🏆</div>
                <div className="text-2xl font-bold mb-1">Konec hry!</div>
                <div className="text-xl mb-1">Skóre: {result}</div>
                <div className="text-yellow-300 font-semibold text-lg mb-5">
                  +{coinsEarned} 🪙 mincí
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRestart}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Znovu 🔄
                  </button>
                  <button
                    onClick={() => onClose(coinsEarned)}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-5 rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Vzít mince 🪙
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-gray-50 text-center text-xs text-gray-500">
          ← → nebo klikni na kraj · Chytej zeleninu, vyhýbej se 💩
        </div>
      </div>
    </div>
  );
}
