export function DimensionalShield3D() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: "280px",
        height: "280px",
        filter: "drop-shadow(0 20px 35px rgba(66, 42, 77, 0.22))",
        zIndex: 2,
      }}
    >
      <svg
        width="270"
        height="270"
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: "rotate(6deg)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <defs>
          {/* Gradients for Faceted 3D Shield */}
          <linearGradient id="shield-facet-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e8f9" />
            <stop offset="30%" stopColor="#caa2d5" />
            <stop offset="70%" stopColor="#8d5f99" />
            <stop offset="100%" stopColor="#553060" />
          </linearGradient>

          <linearGradient id="shield-facet-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#caa1d6" />
            <stop offset="50%" stopColor="#784b84" />
            <stop offset="100%" stopColor="#3c1e45" />
          </linearGradient>

          <linearGradient id="shield-top-rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#dcb5e8" />
            <stop offset="100%" stopColor="#855792" />
          </linearGradient>

          <linearGradient id="shield-core-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <radialGradient id="shield-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>

          <filter id="soft-blur-shield" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Ambient Back Glow */}
        <circle cx="140" cy="135" r="95" fill="url(#shield-ambient)" />

        {/* Floating 3D Ambient Floor Shadow */}
        <ellipse cx="140" cy="245" rx="74" ry="14" fill="#583b63" opacity="0.32" filter="url(#soft-blur-shield)" />

        {/* 3D FLOATING ORBITAL DEFENSE RING (Behind shield) */}
        <ellipse
          cx="140"
          cy="142"
          rx="110"
          ry="38"
          stroke="#b88ec5"
          strokeWidth="3.5"
          strokeDasharray="8 6"
          opacity="0.4"
          transform="rotate(-22 140 142)"
        />

        {/* MAIN 3D FACETED SHIELD BODY */}
        {/* Left Facet (Direct Light) */}
        <path
          d="M140 45 L65 78 C65 145, 95 195, 140 225 L140 45 Z"
          fill="url(#shield-facet-left)"
        />

        {/* Right Facet (Shaded Depth) */}
        <path
          d="M140 45 L215 78 C215 145, 185 195, 140 225 L140 45 Z"
          fill="url(#shield-facet-right)"
        />

        {/* TOP BEVELED RIM (Catching Specular Highlight) */}
        <path
          d="M65 78 L140 45 L215 78 L205 84 L140 55 L75 84 Z"
          fill="url(#shield-top-rim)"
        />

        {/* CENTER SPINE HIGHLIGHT */}
        <line
          x1="140"
          y1="45"
          x2="140"
          y2="225"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* INNER FLOATING ISOMETRIC DEFENSE PLATE */}
        <g transform="translate(10, 10)">
          <path
            d="M130 85 L85 106 C85 150, 105 180, 130 198 C155 180, 175 150, 175 106 L130 85 Z"
            fill="rgba(42, 22, 51, 0.45)"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* INNER ZERO-BALANCE DEFENSE GEM (Emerald Crystal Core) */}
          <g transform="translate(116, 120)">
            {/* Hexagonal 3D Gem */}
            <polygon
              points="14,0 28,8 28,24 14,32 0,24 0,8"
              fill="url(#shield-core-glow)"
              stroke="#a7f3d0"
              strokeWidth="1.5"
            />
            {/* Specular Gem Facet */}
            <polygon
              points="14,0 28,8 14,16 0,8"
              fill="#ffffff"
              opacity="0.5"
            />
            {/* Lock / Defense Keyhole Symbol */}
            <circle cx="14" cy="14" r="3" fill="#064e3b" />
            <rect x="13" y="14" width="2" height="6" fill="#064e3b" />
          </g>
        </g>

        {/* 3D FLOATING ORBITAL DEFENSE RING (Front Overlap) */}
        <path
          d="M48 165 C68 185, 120 195, 175 180 C215 168, 240 152, 242 140"
          stroke="#e9d5ff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
          transform="rotate(-22 140 142)"
        />

        {/* FLOATING SATELLITE PRISM BEAD */}
        <circle cx="82" cy="180" r="5" fill="#34d399" />
        <circle cx="81" cy="179" r="2" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  )
}
