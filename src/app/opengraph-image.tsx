import { ImageResponse } from "next/og";

export const alt = "Moje Morče – virtuální mazlíček";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* decorative dots */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(251,191,36,0.3)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(251,191,36,0.2)",
            display: "flex",
          }}
        />

        {/* guinea pig emoji + title */}
        <div style={{ fontSize: 140, lineHeight: 1, display: "flex" }}>🐹</div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#78350f",
            marginTop: 24,
            letterSpacing: "-2px",
            display: "flex",
          }}
        >
          Moje Morče
        </div>

        <div
          style={{
            fontSize: 32,
            color: "#92400e",
            marginTop: 16,
            display: "flex",
          }}
        >
          Virtuální mazlíček, o který se staráš ❤️
        </div>

        {/* pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["🍎 Krmení", "🚿 Koupání", "🎮 Hraní", "🏆 Achievementy"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "rgba(120,53,15,0.12)",
                  border: "2px solid rgba(120,53,15,0.25)",
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontSize: 24,
                  color: "#78350f",
                  display: "flex",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
