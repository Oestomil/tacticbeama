// src/components/TacticbeamLogo.tsx
export default function TacticbeamLogo({
  height = 44,
  neon = true,              // << neon açık/kapalı
}: { height?: number; neon?: boolean }) {
  const green = "#22c55e";
  const white = "#ffffff";

  return (
    <svg
      role="img"
      aria-label="TacticbeaM"
      height={height}
      viewBox="0 0 720 160"
      fill="none"
    >
      <defs>
        {/* kayan beam için animasyonlu gradient */}
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor={green} stopOpacity="0" />
          <stop offset="35%" stopColor={green} stopOpacity="0.85">
            <animate attributeName="offset" values="0.35;0.75;0.35" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="75%" stopColor={green} stopOpacity="0">
            <animate attributeName="offset" values="0.75;1;0.75" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* neon parıltısı için filtre */}
        <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="10" in="blur1" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="glowWhite" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b1" />
          <feGaussianBlur stdDeviation="7" in="b1" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Kelime işareti — ortalı, sıkı kerning */}
      <g
        fontFamily='Poppins, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial'
        fontWeight={800}
        fontSize="92"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <text
          x="50%" y="74" letterSpacing="-1.5"
          filter={neon ? "url(#glowGreen)" : undefined}
        >
          <tspan fill={green}>Tactic</tspan>
          <tspan
            fill={white}
            filter={neon ? "url(#glowWhite)" : undefined}
          >
            beaM
          </tspan>
        </text>
      </g>

      {/* Beam çizgisi (kayan ışık efekti) */}
      <rect
        x="220" y="110" width="400" height="10" rx="5"
        fill="url(#beam)"
        opacity={0.95}
        filter={neon ? "url(#glowGreen)" : undefined}
      />

      {/* Minimal saha ikonu */}
      <g transform="translate(620, 22)" opacity="0.95" filter={neon ? "url(#glowWhite)" : undefined}>
        <rect x="0" y="0" width="34" height="68" rx="7" fill="none" stroke={white} strokeWidth="3" />
        <line x1="17" y1="0" x2="17" y2="68" stroke={white} strokeWidth="2" />
        <circle cx="17" cy="34" r="4.5" fill={white} />
      </g>
    </svg>
  );
}
