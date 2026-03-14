interface FlightGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  size?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  formatValue?: (v: number) => string;
}

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? "1" : "0";
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
};

export function FlightGauge({
  value,
  min,
  max,
  label,
  unit,
  color = "#3b82f6",
  size = 130,
  warningThreshold,
  criticalThreshold,
  formatValue,
}: FlightGaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const sw = size * 0.075;
  const trackSw = size * 0.055;

  const START_ANGLE = 135;
  const SWEEP = 270;
  const END_ANGLE = START_ANGLE + SWEEP;

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const arcLength = r * (SWEEP * Math.PI) / 180;
  const valueDash = pct * arcLength;

  // Determine color based on thresholds
  let strokeColor = color;
  if (criticalThreshold !== undefined && value >= criticalThreshold) strokeColor = "#ef4444";
  else if (warningThreshold !== undefined && value >= warningThreshold) strokeColor = "#f59e0b";

  // Tick marks
  const ticks = [0, 0.25, 0.5, 0.75, 1.0];
  const rOuter = r + sw * 0.8;
  const rInner = r + sw * 0.1;

  const trackPath = describeArc(cx, cy, r, START_ANGLE, END_ANGLE);

  const displayValue = formatValue ? formatValue(value) : Math.round(value).toLocaleString();

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* Glow filter */}
      <defs>
        <filter id={`glow-${label.replace(/\s/g, '')}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r + sw * 0.5} fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

      {/* Track arc (background) */}
      <path
        d={trackPath}
        fill="none"
        stroke="#1e293b"
        strokeWidth={sw}
        strokeLinecap="round"
      />

      {/* Warning zone (if applicable) */}
      {warningThreshold !== undefined && (
        <path
          d={describeArc(cx, cy, r, START_ANGLE + ((warningThreshold - min) / (max - min)) * SWEEP, END_ANGLE)}
          fill="none"
          stroke="#f59e0b20"
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}

      {/* Value arc */}
      <path
        d={trackPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${valueDash.toFixed(2)} ${arcLength.toFixed(2)}`}
        strokeDashoffset="0"
        style={{ transition: "stroke-dasharray 0.4s ease, stroke 0.3s ease" }}
        filter={`url(#glow-${label.replace(/\s/g, '')})`}
      />

      {/* Tick marks */}
      {ticks.map((t, i) => {
        const angle = START_ANGLE + t * SWEEP;
        const outer = polarToCartesian(cx, cy, rOuter, angle);
        const inner = polarToCartesian(cx, cy, rInner, angle);
        return (
          <line
            key={i}
            x1={outer.x} y1={outer.y}
            x2={inner.x} y2={inner.y}
            stroke="#334155"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Needle indicator dot */}
      {(() => {
        const needleAngle = START_ANGLE + pct * SWEEP;
        const np = polarToCartesian(cx, cy, r, needleAngle);
        return (
          <circle
            cx={np.x} cy={np.y} r={sw * 0.45}
            fill={strokeColor}
            style={{ transition: "cx 0.4s ease, cy 0.4s ease, fill 0.3s ease" }}
            filter={`url(#glow-${label.replace(/\s/g, '')})`}
          />
        );
      })()}

      {/* Center value */}
      <text
        x={cx} y={cy - size * 0.04}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={size * 0.18}
        fontFamily="'Courier New', monospace"
        fontWeight="bold"
      >
        {displayValue}
      </text>

      {/* Unit */}
      <text
        x={cx} y={cy + size * 0.14}
        textAnchor="middle"
        fill="#64748b"
        fontSize={size * 0.09}
        fontFamily="monospace"
      >
        {unit}
      </text>

      {/* Label */}
      <text
        x={cx} y={size - size * 0.06}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={size * 0.08}
        fontFamily="sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

