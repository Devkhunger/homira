// Original decorative motifs (flowers, paisley, leaves) inspired by Indian textile art.
// Colours follow the brand CSS variables, so they change with Admin → Settings.

type P = { className?: string; style?: React.CSSProperties };

export function Flower({ className, style, petals = 12 }: P & { petals?: number }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse key={i} cx="100" cy="45" rx="16" ry="42" transform={`rotate(${(360 / petals) * i} 100 100)`} fill="rgb(var(--brand))" opacity="0.9" />
      ))}
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse key={`i${i}`} cx="100" cy="62" rx="9" ry="24" transform={`rotate(${(360 / petals) * i + 15} 100 100)`} fill="rgb(var(--accent))" />
      ))}
      <circle cx="100" cy="100" r="26" fill="rgb(var(--cream))" />
      <circle cx="100" cy="100" r="16" fill="rgb(var(--brand-dark))" />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={`d${i}`} cx="100" cy="80" r="3" transform={`rotate(${36 * i} 100 100)`} fill="rgb(var(--accent))" />
      ))}
    </svg>
  );
}

export function Paisley({ className, style }: P) {
  return (
    <svg viewBox="0 0 120 180" className={className} style={style} aria-hidden>
      <path d="M60 170C20 170 5 130 12 95 20 55 55 30 70 10c5 20 40 45 42 90 2 40-22 70-52 70Z" fill="rgb(var(--accent))" />
      <path d="M60 155c-28 0-38-28-33-52 6-28 30-45 41-62 4 15 28 32 29 64 1 28-15 50-37 50Z" fill="rgb(var(--brand))" />
      <circle cx="60" cy="112" r="18" fill="rgb(var(--cream))" />
      <circle cx="60" cy="112" r="9" fill="rgb(var(--accent))" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx="60" cy="86" r="3" transform={`rotate(${45 * i} 60 112)`} fill="rgb(var(--cream))" />
      ))}
    </svg>
  );
}

export function LeafSprig({ className, style }: P) {
  return (
    <svg viewBox="0 0 120 220" className={className} style={style} aria-hidden>
      <path d="M60 215C58 150 62 80 60 10" stroke="rgb(var(--brand-dark))" strokeWidth="3" fill="none" />
      {[30, 65, 100, 135, 170].map((y, i) => (
        <g key={y}>
          <path d={`M60 ${y + 10}c-30-4-45-22-48-36 20 0 42 12 48 36Z`} fill={i % 2 ? "rgb(var(--brand))" : "rgb(var(--brand-dark))"} />
          <path d={`M60 ${y + 25}c30-4 45-22 48-36-20 0-42 12-48 36Z`} fill={i % 2 ? "rgb(var(--brand-dark))" : "rgb(var(--brand))"} />
        </g>
      ))}
    </svg>
  );
}

/** Default logo mark: a weaver's shuttle with thread. Replaced by uploaded logo when set. */
export function LoomMark({ className }: P) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden>
      <path d="M2 16C10 6 38 6 46 16 38 26 10 26 2 16Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <ellipse cx="24" cy="16" rx="8" ry="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 12v-9M24 20v9" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2" />
    </svg>
  );
}

/** Woven-border strip, like a saree border. */
export function WovenBorder({ className }: P) {
  return (
    <div
      className={className}
      aria-hidden
      style={{
        height: 10,
        backgroundImage:
          "repeating-linear-gradient(90deg, rgb(var(--brand)) 0 12px, rgb(var(--accent)) 12px 16px, rgb(var(--brand-dark)) 16px 28px, rgb(var(--accent)) 28px 32px)",
      }}
    />
  );
}
