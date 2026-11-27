export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#4C7DFF" />
      {/* "A" shaped like a peak with a yellow dot on top: reaching 1600 */}
      <path d="M10 30 L20 10 L30 30" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6 23.4 H25.4" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="20" cy="8.6" r="3.4" fill="#FFD23F" />
    </svg>
  );
}

export function Logo() {
  return (
    <a href="/" className="logo" aria-label="SAT Acers home">
      <LogoMark />
      <span className="logo-word">
        <small>SAT</small>Acers
      </span>
    </a>
  );
}
