export function DimensionalSlashedCard3D() {
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
          transform: "rotate(-3deg)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <defs>
          {/* Subtle Ambient Purple Background Glow */}
          <radialGradient id="card-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>

          {/* Crisp Card Face Gradients */}
          <linearGradient id="card-face-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4c2759" />
            <stop offset="40%" stopColor="#351a40" />
            <stop offset="100%" stopColor="#1f0d26" />
          </linearGradient>

          {/* Card Top Specular Bevel */}
          <linearGradient id="card-top-rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#dcb5e8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
          </linearGradient>

          {/* 3D Extruded Depth Underlayer */}
          <linearGradient id="card-extruded-depth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#633275" />
            <stop offset="100%" stopColor="#190720" />
          </linearGradient>

          {/* Golden EMV Smart Chip Gradients */}
          <linearGradient id="chip-gold-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Clean Precision Laser Edge Glow */}
          <linearGradient id="clean-laser-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fb7185" />
            <stop offset="65%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>

          {/* Cut Cross-Section Wall */}
          <linearGradient id="cut-wall-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          <filter id="soft-floor-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          <filter id="clean-laser-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Back Glow */}
        <circle cx="140" cy="135" r="95" fill="url(#card-ambient)" />

        {/* Floating 3D Ambient Floor Shadow */}
        <ellipse cx="140" cy="245" rx="74" ry="14" fill="#583b63" opacity="0.3" filter="url(#soft-floor-shadow)" />

        {/* 3D FLOATING ORBITAL RECURRING CYCLE (Behind Card - matches the shield card's orbit) */}
        <ellipse
          cx="140"
          cy="142"
          rx="110"
          ry="38"
          stroke="#b88ec5"
          strokeWidth="3.5"
          strokeDasharray="8 6"
          opacity="0.32"
          transform="rotate(-22 140 142)"
        />

        {/* ======================================================== */}
        {/* PIECE 1: UPPER-LEFT CARD HALF (Separated Up & Left)       */}
        {/* ======================================================== */}
        <g transform="translate(-10, -8)">
          {/* 3D Thickness Extrusion Underlayer (6px depth) */}
          <path
            d="M 175 86 L 66 86 A 10 10 0 0 0 56 96 L 56 184 A 10 10 0 0 0 66 194 L 105 194 L 175 86 Z"
            transform="translate(0, 6)"
            fill="url(#card-extruded-depth)"
          />

          {/* Clean Exposed Cut Thickness Edge */}
          <polygon
            points="175,86 105,194 105,200 175,92"
            fill="url(#cut-wall-gradient)"
          />

          {/* Main Card Surface */}
          <path
            d="M 175 86 L 66 86 A 10 10 0 0 0 56 96 L 56 184 A 10 10 0 0 0 66 194 L 105 194 L 175 86 Z"
            fill="url(#card-face-gradient)"
            stroke="#8d5f99"
            strokeWidth="1.2"
          />

          {/* Specular Highlight along Top Rim */}
          <path
            d="M 56 96 A 10 10 0 0 1 66 86 L 175 86"
            stroke="url(#card-top-rim)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Left Edge Bevel Highlight */}
          <line
            x1="56"
            y1="96"
            x2="56"
            y2="184"
            stroke="#a77bb5"
            strokeWidth="1.2"
            opacity="0.6"
          />

          {/* Golden EMV Smart Chip */}
          <g transform="translate(74, 106)">
            {/* Chip Base */}
            <rect x="0" y="0" width="26" height="20" rx="3.5" fill="url(#chip-gold-base)" stroke="#78350f" strokeWidth="0.8" />
            {/* Chip Glint */}
            <path d="M2 2 L24 2 L24 5 L2 5 Z" fill="#ffffff" opacity="0.65" />
            {/* Circuit Division Lines */}
            <rect x="0" y="8" width="8" height="4" fill="#92400e" opacity="0.45" />
            <rect x="18" y="8" width="8" height="4" fill="#92400e" opacity="0.45" />
            <circle cx="13" cy="10" r="2.8" fill="#78350f" opacity="0.55" />
            <line x1="13" y1="2" x2="13" y2="18" stroke="#78350f" strokeWidth="0.8" opacity="0.4" />
          </g>

          {/* Contactless NFC Waves Icon */}
          <g transform="translate(110, 108)" stroke="#dcb5e8" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
            <path d="M0 4 C2 6, 2 10, 0 12" />
            <path d="M4 1 C8 5, 8 11, 4 15" />
            <path d="M8 -2 C13 3, 13 13, 8 18" />
          </g>

          {/* Card Label: "SUBSCRIPTION" */}
          <text
            x="74"
            y="146"
            fill="#ffffff"
            fontSize="8.5"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            letterSpacing="1.2"
          >
            SUBSCRIPTION
          </text>
          <text
            x="74"
            y="157"
            fill="#c084fc"
            fontSize="7"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
            letterSpacing="0.8"
          >
            AUTO-RENEWAL PASS
          </text>

          {/* Clean Precision Cut Edge Highlight */}
          <line
            x1="175"
            y1="86"
            x2="105"
            y2="194"
            stroke="url(#clean-laser-gradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* ======================================================== */}
        {/* PIECE 2: LOWER-RIGHT CARD HALF (Separated Down & Right)   */}
        {/* ======================================================== */}
        <g transform="translate(10, 8)">
          {/* 3D Thickness Extrusion Underlayer (6px depth) */}
          <path
            d="M 175 86 L 105 194 L 214 194 A 10 10 0 0 0 224 184 L 224 96 A 10 10 0 0 0 214 86 L 175 86 Z"
            transform="translate(0, 6)"
            fill="url(#card-extruded-depth)"
          />

          {/* Clean Exposed Cut Thickness Edge */}
          <polygon
            points="175,86 105,194 105,200 175,92"
            fill="url(#cut-wall-gradient)"
          />

          {/* Main Card Surface */}
          <path
            d="M 175 86 L 105 194 L 214 194 A 10 10 0 0 0 224 184 L 224 96 A 10 10 0 0 0 214 86 L 175 86 Z"
            fill="url(#card-face-gradient)"
            stroke="#8d5f99"
            strokeWidth="1.2"
          />

          {/* Top-Right Rim Specular Highlight */}
          <path
            d="M 175 86 L 214 86 A 10 10 0 0 1 224 96"
            stroke="url(#card-top-rim)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Payment Card Network Intersecting Circles (Mastercard-style cue) */}
          <g transform="translate(196, 110)">
            <circle cx="-7" cy="0" r="9" fill="#f43f5e" opacity="0.85" />
            <circle cx="7" cy="0" r="9" fill="#a855f7" opacity="0.85" />
            <path
              d="M 0 -6.5 A 9 9 0 0 1 0 6.5 A 9 9 0 0 1 0 -6.5 Z"
              fill="#fb7185"
              opacity="0.9"
            />
          </g>

          {/* Recurring Billing Price Pill with Clean Strikethrough */}
          <g transform="translate(126, 134)">
            {/* Pill Container */}
            <rect
              x="0"
              y="0"
              width="68"
              height="20"
              rx="4"
              fill="rgba(42, 19, 53, 0.85)"
              stroke="#a855f7"
              strokeWidth="0.9"
            />
            {/* Price Text */}
            <text
              x="6"
              y="14"
              fill="#f5d0fe"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="700"
              letterSpacing="0.5"
            >
              $29.99/mo
            </text>
            {/* Precision Laser Strike-Through */}
            <line
              x1="4"
              y1="10"
              x2="64"
              y2="10"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Card Number Dots & Last 4 Digits */}
          <text
            x="132"
            y="172"
            fill="#e9d5ff"
            fontSize="9"
            fontFamily="monospace"
            letterSpacing="1.8"
          >
            •••• 4821
          </text>
          <text
            x="192"
            y="172"
            fill="#caa1d6"
            fontSize="8"
            fontFamily="monospace"
            opacity="0.75"
          >
            09/28
          </text>

          {/* Clean Precision Cut Edge Highlight */}
          <line
            x1="175"
            y1="86"
            x2="105"
            y2="194"
            stroke="url(#clean-laser-gradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* ======================================================== */}
        {/* CLEAN PRECISION LASER SLASH (Crisp, Semantic, Elegant)   */}
        {/* ======================================================== */}
        {/* Precision Laser Glow Vector (Clean line extending slightly past card) */}
        <line
          x1="190"
          y1="68"
          x2="90"
          y2="212"
          stroke="url(#clean-laser-gradient)"
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="url(#clean-laser-glow)"
        />

        {/* Razor White-Hot Center Core */}
        <line
          x1="184"
          y1="76"
          x2="96"
          y2="204"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Crisp Central Glint at the Heart of the Cut */}
        <circle cx="140" cy="140" r="4" fill="#ffffff" />
        <circle cx="140" cy="140" r="8" fill="#f43f5e" opacity="0.6" />

        {/* Elegant Diamond Sparkle Glint */}
        <g transform="translate(140, 140)">
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        </g>

        {/* Subtle Incision Ember Particles (Controlled, Clean, Focused) */}
        <circle cx="162" cy="108" r="1.8" fill="#ffffff" />
        <circle cx="118" cy="172" r="1.8" fill="#f43f5e" />
        <circle cx="172" cy="94" r="1.4" fill="#fbcfe8" />
        <circle cx="108" cy="186" r="1.4" fill="#fb7185" />

        {/* Front Overlapping Orbital Arc (Creating 3D Depth) */}
        <path
          d="M48 165 C68 185, 120 195, 175 180 C215 168, 240 152, 242 140"
          stroke="#e9d5ff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.75"
          transform="rotate(-22 140 142)"
        />

        {/* Top Accent Sparkle Star */}
        <g transform="translate(68, 62)">
          <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="#fbcfe8" />
          <circle cx="6" cy="6" r="1.5" fill="#ffffff" />
        </g>
      </svg>
    </div>
  )
}
