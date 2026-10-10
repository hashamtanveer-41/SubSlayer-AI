export interface SubSlayerLogoProps {
  size?: number
  className?: string
  glow?: boolean
}

export function SubSlayerLogo({ size = 32, className = "", glow = false }: SubSlayerLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: "inline-block",
        flexShrink: 0,
        filter: glow ? "drop-shadow(0 0 10px rgba(192, 132, 252, 0.45))" : undefined,
      }}
    >
      <defs>
        {/* Background gradient: dark obsidian with violet tint */}
        <linearGradient id="ss-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c2035" />
          <stop offset="50%" stopColor="#432c4a" />
          <stop offset="100%" stopColor="#1a1220" />
        </linearGradient>

        {/* Blade metallic gradient */}
        <linearGradient id="ss-blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        {/* Accent edge highlight */}
        <linearGradient id="ss-edge" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Subtle inner stroke */}
        <linearGradient id="ss-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(217,70,239,0.2)" />
        </linearGradient>
      </defs>

      {/* Outer rounded squircle */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="11"
        fill="url(#ss-bg)"
        stroke="url(#ss-border)"
        strokeWidth="1.5"
      />

      {/* Razor blade stylized "S" mark (SubSlayer icon) */}
      {/* Top blade fin */}
      <path
        d="M13 14.5C13 12.567 14.567 11 16.5 11H33C34.5 11 35.5 12.3 35 13.7L31.2 21.5C30.8 22.3 30 22.8 29.1 22.8H18.5C16 22.8 14.5 20.8 14.8 18.3L15.3 14.5H13Z"
        fill="url(#ss-blade)"
      />

      {/* Diagonal assassin slash (the "Slayer" cut) */}
      <path
        d="M35 12L13 36"
        stroke="url(#ss-edge)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Bottom blade fin */}
      <path
        d="M35 33.5C35 35.433 33.433 37 31.5 37H15C13.5 37 12.5 35.7 13 34.3L16.8 26.5C17.2 25.7 18 25.2 18.9 25.2H29.5C32 25.2 33.5 27.2 33.2 29.7L32.7 33.5H35Z"
        fill="url(#ss-blade)"
      />

      {/* Center blade glint */}
      <circle cx="24" cy="24" r="2.2" fill="#ffffff" />
    </svg>
  )
}
