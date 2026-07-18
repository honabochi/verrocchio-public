export function WorkshopMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" />
      <path d="M17 15 31 50 47 15M12 15h12M40 15h12" />
    </svg>
  );
}

export function NavIcon({ type }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "square",
  };
  const shapes = {
    contratto: (
      <>
        <path {...common} d="M7 26V12l9-7 9 7v14M10 26V13h12v13M5 28h22" />
        <path {...common} d="M13 17h6M13 21h6" />
      </>
    ),
    cartone: (
      <>
        <path {...common} d="M8 5h16v22H8zM8 10h16M13 5v22" />
        <path {...common} d="m15 18 5-5M15 18l5 5" />
      </>
    ),
    giornate: (
      <>
        <rect {...common} x="6" y="6" width="20" height="20" />
        <circle {...common} cx="16" cy="16" r="7" />
        <path {...common} d="M6 16h20M16 6v20M9 9l14 14M23 9 9 23" />
      </>
    ),
    cenacolo: (
      <>
        <circle {...common} cx="16" cy="16" r="11" />
        <circle {...common} cx="16" cy="16" r="3" />
        <path {...common} d="M16 2v6M16 24v6M2 16h6M24 16h6" />
      </>
    ),
    evidence: (
      <>
        <path {...common} d="M7 12h18v15H7zM5 12l3-6h16l3 6" />
        <circle {...common} cx="16" cy="19" r="4" />
        <path {...common} d="m14 19 2 2 4-5" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {shapes[type]}
    </svg>
  );
}

export function SignatureIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="5" y="5" width="54" height="54" fill="none" stroke="currentColor" />
      <path
        d="M16 44c8-20 11-28 15-28 6 0-3 27 2 27 3 0 7-14 11-14 3 0-1 11 3 11 2 0 4-3 6-7M14 49h37"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
