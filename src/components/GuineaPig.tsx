"use client";

import React from "react";

export type MoodType = "idle" | "happy" | "hungry" | "sad" | "sleeping" | "eating" | "playing" | "cleaning" | "petting";
export type ColorType = "orange" | "brown" | "white" | "black" | "spotted";

interface GuineaPigProps {
  mood: MoodType;
  color: ColorType;
  size?: number;
}

const COLOR_MAP: Record<ColorType, { body: string; belly: string; nose: string; ear: string }> = {
  orange: { body: "#E07820", belly: "#F5C87A", nose: "#C0392B", ear: "#C0612B" },
  brown: { body: "#7B4A1E", belly: "#C49A6C", nose: "#8B1A1A", ear: "#6B3A1E" },
  white: { body: "#F5F0E8", belly: "#FFFFFF", nose: "#FFB6C1", ear: "#F0C0B8" },
  black: { body: "#2C2C2C", belly: "#555", nose: "#8B0000", ear: "#1a1a1a" },
  spotted: { body: "#E07820", belly: "#F5C87A", nose: "#C0392B", ear: "#C0612B" },
};

export default function GuineaPig({ mood, color, size = 160 }: GuineaPigProps) {
  const c = COLOR_MAP[color];
  const scale = size / 160;

  const eyeExpression = () => {
    switch (mood) {
      case "sleeping":
        return (
          <>
            {/* Closed eyes - curved lines */}
            <path d="M52 62 Q56 58 60 62" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M80 62 Q84 58 88 62" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "sad":
      case "hungry":
        return (
          <>
            <circle cx="56" cy="63" r="6" fill="#1a1a1a" />
            <circle cx="84" cy="63" r="6" fill="#1a1a1a" />
            <circle cx="58" cy="61" r="2" fill="white" />
            <circle cx="86" cy="61" r="2" fill="white" />
            {/* Sad eyebrows */}
            <path d="M50 56 Q56 60 62 56" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M78 56 Q84 60 90 56" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case "happy":
      case "petting":
        return (
          <>
            {/* Happy closed eyes */}
            <path d="M50 63 Q56 57 62 63" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M78 63 Q84 57 90 63" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Sparkle */}
            <circle cx="65" cy="55" r="2" fill="#FFD700" opacity="0.8" />
          </>
        );
      default:
        return (
          <>
            <circle cx="56" cy="63" r="6" fill="#1a1a1a" />
            <circle cx="84" cy="63" r="6" fill="#1a1a1a" />
            <circle cx="58" cy="61" r="2" fill="white" />
            <circle cx="86" cy="61" r="2" fill="white" />
          </>
        );
    }
  };

  const mouthExpression = () => {
    switch (mood) {
      case "sad":
      case "hungry":
        return <path d="M62 82 Q70 78 78 82" stroke="#a0522d" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case "happy":
      case "petting":
      case "playing":
        return (
          <>
            <path d="M62 79 Q70 87 78 79" stroke="#a0522d" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M66 79 Q70 84 74 79" fill="#FFB6C1" opacity="0.5" />
          </>
        );
      case "eating":
        return (
          <>
            <ellipse cx="70" cy="82" rx="6" ry="4" fill="#a0522d" opacity="0.6" />
            <path d="M64 80 Q70 86 76 80" stroke="#a0522d" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case "sleeping":
        return <path d="M64 81 Q70 83 76 81" stroke="#a0522d" strokeWidth="2" fill="none" strokeLinecap="round" />;
      default:
        return <path d="M64 80 Q70 83 76 80" stroke="#a0522d" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
  };

  const animClass = () => {
    switch (mood) {
      case "eating": return "animate-eat";
      case "playing": return "animate-play";
      case "sleeping": return "animate-sleep";
      case "cleaning": return "animate-clean";
      case "petting": return "animate-pet";
      case "happy": return "animate-wiggle";
      default: return "animate-idle";
    }
  };

  return (
    <div
      className={`guinea-pig-container ${animClass()} inline-block`}
      style={{ width: size, height: size * 0.85 }}
    >
      <svg
        viewBox="0 0 140 120"
        width={size}
        height={size * 0.85}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Spotted pattern overlay */}
        {color === "spotted" && (
          <>
            <ellipse cx="30" cy="85" rx="14" ry="10" fill="#7B4A1E" opacity="0.6" />
            <ellipse cx="100" cy="75" rx="10" ry="12" fill="#7B4A1E" opacity="0.6" />
            <ellipse cx="70" cy="95" rx="8" ry="6" fill="#7B4A1E" opacity="0.4" />
          </>
        )}

        {/* Body */}
        <ellipse cx="70" cy="85" rx="55" ry="38" fill={c.body} />

        {/* Belly */}
        <ellipse cx="70" cy="90" rx="32" ry="22" fill={c.belly} opacity="0.8" />

        {/* Head */}
        <ellipse cx="70" cy="65" rx="38" ry="32" fill={c.body} />

        {/* Ears */}
        <ellipse cx="40" cy="42" rx="12" ry="14" fill={c.ear} />
        <ellipse cx="40" cy="42" rx="7" ry="9" fill="#FFB6C1" opacity="0.7" />
        <ellipse cx="100" cy="42" rx="12" ry="14" fill={c.ear} />
        <ellipse cx="100" cy="42" rx="7" ry="9" fill="#FFB6C1" opacity="0.7" />

        {/* Hair tuft on top */}
        <path d="M62 37 Q70 28 78 37" stroke={c.body} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M65 35 Q70 24 75 35" stroke={c.body} strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Eyes */}
        {eyeExpression()}

        {/* Nose */}
        <ellipse cx="70" cy="75" rx="8" ry="5" fill={c.nose} opacity="0.8" />
        <ellipse cx="68" cy="74" rx="2" ry="1.5" fill="white" opacity="0.5" />

        {/* Whiskers */}
        <line x1="42" y1="73" x2="62" y2="75" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />
        <line x1="42" y1="77" x2="62" y2="77" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />
        <line x1="42" y1="81" x2="62" y2="79" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />
        <line x1="78" y1="75" x2="98" y2="73" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />
        <line x1="78" y1="77" x2="98" y2="77" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />
        <line x1="78" y1="79" x2="98" y2="81" stroke="#aaa" strokeWidth="1.2" opacity="0.7" />

        {/* Mouth */}
        {mouthExpression()}

        {/* Cheek blush */}
        <ellipse cx="44" cy="72" rx="7" ry="5" fill="#FFB6C1" opacity="0.4" />
        <ellipse cx="96" cy="72" rx="7" ry="5" fill="#FFB6C1" opacity="0.4" />

        {/* Tiny legs */}
        <ellipse cx="45" cy="116" rx="10" ry="5" fill={c.body} />
        <ellipse cx="60" cy="118" rx="10" ry="5" fill={c.body} />
        <ellipse cx="80" cy="118" rx="10" ry="5" fill={c.body} />
        <ellipse cx="95" cy="116" rx="10" ry="5" fill={c.body} />

        {/* Sleep Z's */}
        {mood === "sleeping" && (
          <g opacity="0.8">
            <text x="108" y="50" fontSize="14" fill="#666" fontWeight="bold">z</text>
            <text x="116" y="38" fontSize="18" fill="#888" fontWeight="bold">z</text>
            <text x="126" y="24" fontSize="22" fill="#aaa" fontWeight="bold">Z</text>
          </g>
        )}

        {/* Food near mouth when eating */}
        {mood === "eating" && (
          <g>
            <ellipse cx="52" cy="85" rx="7" ry="5" fill="#FF6B35" />
            <rect x="56" y="78" width="3" height="8" fill="#228B22" rx="1" />
          </g>
        )}
      </svg>
    </div>
  );
}
