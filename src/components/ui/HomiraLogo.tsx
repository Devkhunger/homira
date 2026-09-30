// Vector version of the Homira logo mark: house outline, two cushions and a sofa.
// Uses currentColor, so it takes the colour of the surrounding text.

export function HomiraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 124 70" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* house */}
      <path d="M4 30 L17 20" />
      <path d="M17 20 V62 H31" />
      <path d="M66 3 L114 32" />
      {/* back cushion */}
      <g transform="rotate(-22 50 30)">
        <path d="M34 16 Q50 11 66 16 Q70 30 66 44 Q50 49 34 44 Q30 30 34 16 Z" />
        <circle cx="42" cy="23" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="58" cy="23" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="42" cy="37" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="58" cy="37" r="1.6" fill="currentColor" stroke="none" />
      </g>
      {/* front cushion */}
      <g transform="rotate(14 72 48)">
        <path d="M57 34 Q72 29 87 34 Q91 48 87 62 Q72 67 57 62 Q53 48 57 34 Z" />
        <circle cx="65" cy="41" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="79" cy="41" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="65" cy="55" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="79" cy="55" r="1.6" fill="currentColor" stroke="none" />
      </g>
      {/* sofa */}
      <rect x="93" y="38" width="20" height="13" rx="3" fill="currentColor" stroke="none" />
      <rect x="90" y="50" width="28" height="7" rx="2" fill="currentColor" stroke="none" />
      <rect x="114" y="44" width="6" height="13" rx="2" fill="currentColor" stroke="none" />
      <path d="M91 60 H119" />
      <path d="M116 60 V64" />
    </svg>
  );
}

/** Full logo: mark + name + tagline (used on the login pages and 404). */
export function HomiraLogoFull({ name, tagline, className }: { name: string; tagline?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center text-brand ${className ?? ""}`}>
      <HomiraMark className="h-14 w-auto" />
      <span className="mt-1 font-serif text-4xl font-semibold leading-none">{name}</span>
      <svg viewBox="0 0 200 8" className="mt-1 h-2 w-40" aria-hidden><path d="M2 6 Q100 -2 198 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
      {tagline && <span className="mt-1 text-sm italic">{tagline}</span>}
    </div>
  );
}
