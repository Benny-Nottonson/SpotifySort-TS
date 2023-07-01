import React from "react";

interface Props {
  className?: string;
}

export default function CardBackground({ className }: Props) {
  return (
    <div
      className={`w-full h-full rounded-full ${className}`}
      style={{ borderRadius: "1.5rem", overflow: "hidden" }}
    >
      <div style={{ opacity: 0.08, width: "100vw", height: "100vh" }}>
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="2"
              numOctaves="1"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100vw" height="100vh" filter="url(#noiseFilter)" />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: 0.2,
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="radialGradient" cx="70%" cy="70%" r="100%">
              <stop offset="0%" stopColor="#1ED760" stopOpacity="1" />
              <stop offset="40%" stopColor="#62CAFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2279CA" stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="url(#radialGradient)"
          />
        </svg>
      </div>
    </div>
  );
}
