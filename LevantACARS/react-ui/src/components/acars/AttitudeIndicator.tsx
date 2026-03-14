interface AttitudeIndicatorProps {
  pitch?: number;   // degrees, positive = nose up
  roll?: number;    // degrees, positive = right wing down
  size?: number;
}

export function AttitudeIndicator({ pitch = 2, roll = 0, size = 130 }: AttitudeIndicatorProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // Pitch offset (pixels per degree, capped)
  const pitchOffset = Math.max(-r * 0.8, Math.min(r * 0.8, pitch * (r / 30)));

  const transform = `rotate(${-roll}, ${cx}, ${cy})`;

  // Bank angle marks
  const bankAngles = [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60];
  const bankR = r - size * 0.04;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <defs>
        <clipPath id={`adi-clip-${size}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <filter id="adi-glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + size * 0.04} fill="#0f172a" stroke="#334155" strokeWidth="2" />

      {/* ADI Background group (rolls with aircraft) */}
      <g transform={transform} clipPath={`url(#adi-clip-${size})`}>
        {/* Sky */}
        <rect
          x={cx - r - 10}
          y={cy - r * 2 - 10 + pitchOffset}
          width={(r + 10) * 2}
          height={r * 2 + 10}
          fill="#1d4ed8"
        />
        {/* Ground */}
        <rect
          x={cx - r - 10}
          y={cy + pitchOffset}
          width={(r + 10) * 2}
          height={r * 2 + 10}
          fill="#78350f"
        />

        {/* Horizon line */}
        <line
          x1={cx - r - 10} y1={cy + pitchOffset}
          x2={cx + r + 10} y2={cy + pitchOffset}
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Pitch lines */}
        {[-20, -15, -10, -5, 5, 10, 15, 20].map((p) => {
          const yOff = pitchOffset - p * (r / 30);
          const lineW = p % 10 === 0 ? r * 0.5 : r * 0.3;
          return (
            <g key={p}>
              <line
                x1={cx - lineW / 2} y1={cy + yOff}
                x2={cx + lineW / 2} y2={cy + yOff}
                stroke="white" strokeWidth="1" opacity="0.7"
              />
              {p % 10 === 0 && (
                <text
                  x={cx + lineW / 2 + 3} y={cy + yOff}
                  fill="white" fontSize={size * 0.07}
                  fontFamily="monospace" dominantBaseline="middle"
                  opacity="0.7"
                >
                  {Math.abs(p)}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Bank angle scale (fixed) */}
      {bankAngles.map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = cx + bankR * Math.cos(rad);
        const y1 = cy + bankR * Math.sin(rad);
        const innerR = bankR - size * (Math.abs(angle) % 30 === 0 ? 0.06 : 0.04);
        const x2 = cx + innerR * Math.cos(rad);
        const y2 = cy + innerR * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#94a3b8" strokeWidth="1.5"
          />
        );
      })}

      {/* Bank index triangle (rotates with roll) */}
      <g transform={transform}>
        {(() => {
          const triR = r - size * 0.04;
          const rad = -Math.PI / 2;
          const px = cx + triR * Math.cos(rad);
          const py = cy + triR * Math.sin(rad);
          const tw = size * 0.04;
          return (
            <polygon
              points={`${px},${py} ${px - tw},${py - size * 0.05} ${px + tw},${py - size * 0.05}`}
              fill="white"
            />
          );
        })()}
      </g>

      {/* Fixed aircraft symbol */}
      <g filter="url(#adi-glow)">
        {/* Wings */}
        <rect x={cx - r * 0.55} y={cy - size * 0.015} width={r * 0.35} height={size * 0.03} rx="2" fill="#facc15" />
        <rect x={cx + r * 0.2} y={cy - size * 0.015} width={r * 0.35} height={size * 0.03} rx="2" fill="#facc15" />
        {/* Fuselage dot */}
        <circle cx={cx} cy={cy} r={size * 0.025} fill="#facc15" />
      </g>

      {/* Outer border */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="3" />

      {/* Label */}
      <text
        x={cx} y={size - size * 0.04}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={size * 0.08}
        fontFamily="sans-serif"
      >
        ATTITUDE
      </text>
    </svg>
  );
}

