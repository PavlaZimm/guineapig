"use client";

import React from "react";

type Mood = "happy" | "idle" | "hungry" | "sad" | "sleeping" | "eating" | "playing" | "dirty";

interface GuineaPigProps {
  mood: Mood;
  name: string;
  color: string;
}

const COLORS: Record<string, { body: string; belly: string; ear: string; nose: string }> = {
  orange: { body: "#E8A055", belly: "#F5C989", ear: "#D4756A", nose: "#D4756A" },
  brown: { body: "#8B5E3C", belly: "#C49A6C", ear: "#7A4A2E", nose: "#7A4A2E" },
  white: { body: "#F0EDE8", belly: "#FAFAF8", ear: "#E8B4B8", nose: "#E8B4B8" },
  black: { body: "#2C2C2C", belly: "#4A4040", ear: "#3A2828", nose: "#CC6666" },
  spotted: { body: "#C8A05A", belly: "#F0D898", ear: "#C46060", nose: "#C46060" },
};

export default function GuineaPig({ mood, name, color }: GuineaPigProps) {
  const c = COLORS[color] || COLORS.orange;

  const animClass =
    mood === "sleeping" ? "animate-sleep-bob" :
    mood === "eating"   ? "animate-eat" :
    mood === "playing"  ? "animate-happy-spin" :
    mood === "happy"    ? "animate-bounce-slow" :
    mood === "sad"      ? "animate-flash" :
    "animate-wiggle";

  const eyeStyle = mood === "sleeping"
    ? "happy"
    : mood === "sad" || mood === "hungry"
    ? "sad"
    : "normal";

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Floating mood bubble */}
      <div className="h-8 flex items-center justify-center text-2xl">
        {mood === "happy"    && "😄"}
        {mood === "hungry"   && "🥕"}
        {mood === "sad"      && "😢"}
        {mood === "sleeping" && "💤"}
        {mood === "eating"   && "😋"}
        {mood === "playing"  && "🎉"}
        {mood === "dirty"    && "🛁"}
        {mood === "idle"     && ""}
      </div>

      {/* Guinea pig SVG */}
      <div className={animClass} style={{ display: "inline-block" }}>
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <ellipse cx="80" cy="122" rx="48" ry="8" fill="rgba(0,0,0,0.1)" />

          {/* Body */}
          <ellipse cx="80" cy="88" rx="54" ry="38" fill={c.body} />

          {/* Belly */}
          <ellipse cx="80" cy="96" rx="34" ry="24" fill={c.belly} />

          {/* Spotted pattern (only for spotted color) */}
          {color === "spotted" && (
            <>
              <ellipse cx="55" cy="80" rx="10" ry="8" fill="#7A4A2E" opacity="0.4" />
              <ellipse cx="105" cy="75" rx="8" ry="7" fill="#7A4A2E" opacity="0.4" />
              <ellipse cx="75" cy="70" rx="7" ry="6" fill="#7A4A2E" opacity="0.35" />
            </>
          )}

          {/* Left ear */}
          <ellipse cx="38" cy="60" rx="13" ry="18" fill={c.body} transform="rotate(-20 38 60)" />
          <ellipse cx="38" cy="60" rx="8" ry="12" fill={c.ear} opacity="0.6" transform="rotate(-20 38 60)" />

          {/* Right ear */}
          <ellipse cx="122" cy="60" rx="13" ry="18" fill={c.body} transform="rotate(20 122 60)" />
          <ellipse cx="122" cy="60" rx="8" ry="12" fill={c.ear} opacity="0.6" transform="rotate(20 122 60)" />

          {/* Head */}
          <ellipse cx="80" cy="62" rx="36" ry="30" fill={c.body} />

          {/* Forehead highlight */}
          <ellipse cx="72" cy="50" rx="10" ry="7" fill="rgba(255,255,255,0.15)" transform="rotate(-10 72 50)" />

          {/* Eyes */}
          {eyeStyle === "normal" && (
            <>
              <circle cx="64" cy="58" r="7" fill="white" />
              <circle cx="96" cy="58" r="7" fill="white" />
              <circle cx="66" cy="58" r="4.5" fill="#2C1810" />
              <circle cx="98" cy="58" r="4.5" fill="#2C1810" />
              <circle cx="67.5" cy="56.5" r="1.5" fill="white" />
              <circle cx="99.5" cy="56.5" r="1.5" fill="white" />
            </>
          )}
          {eyeStyle === "happy" && (
            <>
              {/* Closed happy eyes — arcs */}
              <path d="M58 58 Q64 52 70 58" stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M90 58 Q96 52 102 58" stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          )}
          {eyeStyle === "sad" && (
            <>
              <circle cx="64" cy="60" r="7" fill="white" />
              <circle cx="96" cy="60" r="7" fill="white" />
              <circle cx="64" cy="61" r="4.5" fill="#2C1810" />
              <circle cx="96" cy="61" r="4.5" fill="#2C1810" />
              {/* Sad eyebrows */}
              <path d="M59 54 Q64 57 69 54" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M91 54 Q96 57 101 54" stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="80" cy="72" rx="7" ry="5" fill={c.nose} />
          <ellipse cx="80" cy="71" rx="4" ry="3" fill={c.ear} opacity="0.5" />

          {/* Whiskers */}
          <line x1="88" y1="71" x2="110" y2="66" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="88" y1="73" x2="112" y2="73" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="72" y1="71" x2="50" y2="66" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="72" y1="73" x2="48" y2="73" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Mouth */}
          {mood === "eating" || mood === "happy" || mood === "playing" ? (
            <path d="M76 77 Q80 82 84 77" stroke={c.ear} strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : mood === "sad" || mood === "hungry" ? (
            <path d="M76 80 Q80 76 84 80" stroke={c.ear} strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M77 78 Q80 80 83 78" stroke={c.ear} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}

          {/* Little feet */}
          <ellipse cx="54" cy="116" rx="14" ry="8" fill={c.body} />
          <ellipse cx="106" cy="116" rx="14" ry="8" fill={c.body} />
          <ellipse cx="54" cy="117" rx="10" ry="5" fill={c.belly} />
          <ellipse cx="106" cy="117" rx="10" ry="5" fill={c.belly} />

          {/* Sleeping Zzz */}
          {mood === "sleeping" && (
            <>
              <text x="108" y="48" fontSize="14" fill="#88AACC" fontWeight="bold" opacity="0.8">z</text>
              <text x="118" y="36" fontSize="18" fill="#88AACC" fontWeight="bold" opacity="0.7">Z</text>
              <text x="131" y="22" fontSize="22" fill="#88AACC" fontWeight="bold" opacity="0.6">Z</text>
            </>
          )}

          {/* Dirty smudges */}
          {mood === "dirty" && (
            <>
              <ellipse cx="65" cy="85" rx="6" ry="4" fill="#8B7355" opacity="0.5" />
              <ellipse cx="95" cy="90" rx="5" ry="3" fill="#8B7355" opacity="0.4" />
              <ellipse cx="80" cy="78" rx="4" ry="3" fill="#8B7355" opacity="0.35" />
            </>
          )}
        </svg>
      </div>

      {/* Name tag */}
      <div className="bg-white/80 backdrop-blur px-4 py-1 rounded-full shadow text-sm font-bold text-amber-800 border border-amber-200">
        {name}
      </div>
    </div>
  );
}
