import type { SVGProps } from "react"

export interface PlatformLogoProps extends SVGProps<SVGSVGElement> {
  size?: number
}

// 1. SPOTIFY: Official circular green badge with black curved audio waves
export function SpotifyLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path
        d="M17.5 10.3C14.0 8.2 8.3 8.0 4.9 9.0C4.4 9.2 3.8 8.9 3.7 8.3C3.5 7.8 3.8 7.2 4.4 7.0C8.3 5.8 14.6 6.1 18.6 8.5C19.1 8.8 19.3 9.4 19.0 9.9C18.7 10.4 18.0 10.6 17.5 10.3Z"
        fill="#121212"
      />
      <path
        d="M16.0 13.0C13.2 11.3 8.7 10.8 5.3 11.8C4.8 12.0 4.3 11.7 4.1 11.2C4.0 10.7 4.3 10.2 4.8 10.0C8.7 8.8 13.7 9.4 17.0 11.4C17.4 11.7 17.6 12.2 17.3 12.7C17.0 13.1 16.5 13.2 16.0 13.0Z"
        fill="#121212"
      />
      <path
        d="M14.7 15.6C12.4 14.2 9.2 13.8 5.7 14.6C5.3 14.7 4.9 14.4 4.8 14.0C4.7 13.6 5.0 13.2 5.4 13.1C9.3 12.2 12.9 12.7 15.6 14.3C16.0 14.5 16.1 15.0 15.9 15.3C15.6 15.7 15.1 15.8 14.7 15.6Z"
        fill="#121212"
      />
    </svg>
  )
}

// 2. NETFLIX: Official bold red ribbon "N" on deep dark background
export function NetflixLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#141414" />
      {/* Left pillar */}
      <path d="M5.5 3H8.7V21H5.5V3Z" fill="#B81D24" />
      {/* Right pillar */}
      <path d="M15.3 3H18.5V21H15.3V3Z" fill="#B81D24" />
      {/* Center diagonal ribbon with subtle shadow/gradient */}
      <path
        d="M5.5 3H9.2L18.5 21H14.8L5.5 3Z"
        fill="#E50914"
      />
    </svg>
  )
}

// 3. ADOBE: Official iconic red badge with white geometric "A"
export function AdobeLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#FA0F00" />
      {/* Left angle */}
      <polygon points="14.5,4 19.5,4 19.5,20" fill="#FFFFFF" />
      {/* Right angle */}
      <polygon points="9.5,4 4.5,4 4.5,20" fill="#FFFFFF" />
      {/* Center crossbar */}
      <polygon points="12,11.2 15.8,20 13.2,20 12.1,17.2 9.8,17.2" fill="#FFFFFF" />
    </svg>
  )
}

// 4. NOTION: Official Notion 3D-perspective cube block with serif "N"
export function NotionLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
      <path
        d="M6.2 5.5C6.2 5.2 6.5 4.9 6.8 4.9L16.2 4.2C16.8 4.1 17.3 4.6 17.2 5.2L16.8 7.3C16.7 7.7 16.3 8.0 15.9 8.0H15.0L15.4 15.8C15.4 16.2 15.2 16.6 14.8 16.8L9.0 19.8C8.5 20.1 7.9 19.7 7.9 19.1V16.8L6.8 16.8C6.3 16.8 5.9 16.4 5.9 15.9V6.5L6.2 5.5Z"
        fill="#000000"
        fillOpacity="0.08"
      />
      <path
        d="M7.1 6.3L15.3 5.7C15.8 5.6 16.2 6.0 16.1 6.5L15.4 16.2C15.4 16.6 15.1 16.9 14.7 17.1L9.1 19.3C8.6 19.5 8.1 19.1 8.1 18.6V8.2L7.0 8.0C6.6 7.9 6.4 7.5 6.5 7.1L7.1 6.3Z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="1.2"
      />
      {/* Serif "N" */}
      <path
        d="M9.7 9.8V16.1L12.9 11.5V16.6M12.9 11.5L9.7 9.8"
        stroke="#000000"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// 5. ICLOUD / APPLE: Vibrant blue/cyan cloud with gradient and Apple silhouette
export function ICloudLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="icloud-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5" fill="url(#icloud-grad)" />
      {/* Cloud silhouette */}
      <path
        d="M17.4 11.5C17.0 9.0 14.8 7.2 12.2 7.2C10.1 7.2 8.3 8.4 7.4 10.2C5.4 10.5 4 12.2 4 14.2C4 16.5 5.8 18.2 8.1 18.2H17.1C19.0 18.2 20.5 16.7 20.5 14.8C20.5 13.1 19.1 11.7 17.4 11.5Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

// 6. FIGMA: Official 5-color geometric components
export function FigmaLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#1E1E1E" />
      {/* Top Left (Orange-Red) */}
      <path d="M7 6C7 4.9 7.9 4 9 4H12V8H9C7.9 8 7 7.1 7 6Z" fill="#F24E1E" />
      {/* Top Right (Peach) */}
      <path d="M12 4H15C16.1 4 17 4.9 17 6C17 7.1 16.1 8 15 8H12V4Z" fill="#FF7262" />
      {/* Middle Left (Purple) */}
      <path d="M7 10C7 8.9 7.9 8 9 8H12V12H9C7.9 12 7 11.1 7 10Z" fill="#A259FF" />
      {/* Middle Right (Cyan) */}
      <circle cx="14.5" cy="10" r="2.5" fill="#1ABCFE" />
      {/* Bottom Left (Green) */}
      <path d="M7 14C7 12.9 7.9 12 9 12H12V15C12 16.7 10.7 18 9 18C7.9 18 7 17.1 7 16V14Z" fill="#0ACF83" />
    </svg>
  )
}

// 7. YOUTUBE / GOOGLE: Red rounded rect with play button
export function YouTubeLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#FF0000" />
      <polygon points="10,8 16,12 10,16" fill="#FFFFFF" />
    </svg>
  )
}

// 8. CHATGPT / OPENAI: Official rosette spiral
export function ChatGPTLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#10A37F" />
      <g transform="translate(3.5, 3.5) scale(0.708)">
        <path
          d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 6.07 6.07 0 0 0-10.27 2.17 5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 6 6 0 0 0 4.52 2.01 6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.09 4.78 2.75a.77.77 0 0 0 .78 0l5.85-3.37v2.33a.08.08 0 0 1-.04.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zm-1.26-6.4a4.49 4.49 0 0 1 2.37-1.98v5.68a.77.77 0 0 0 .38.68l5.82 3.35-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79a4.5 4.5 0 0 1-1.65-6.11zm16.6 3.85-5.83-3.37 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.67a.79.79 0 0 0-.4-.68zm2.01-3.02-.14-.09-4.78-2.78a.78.78 0 0 0-.78 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zm-12.65 3.13-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.4.68v6.73zm1.1-2.37 2.6-1.5 2.61 1.5v3l-2.6 1.5-2.61-1.5z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  )
}

// 9. DISNEY+: Midnight blue with curved arch
export function DisneyPlusLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#113CCF" />
      <path
        d="M4 14.5C8 10 16 10 20 14.5"
        stroke="#00D6FE"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="9" r="1.5" fill="#FFFFFF" />
    </svg>
  )
}

// 10. AMAZON PRIME: Prime Cyan badge with smile arrow
export function AmazonPrimeLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#00A8E1" />
      <path
        d="M6 14C9.5 16.5 14.5 16.5 18 14"
        stroke="#FF9900"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon points="17,13.5 19,14 18,16" fill="#FF9900" />
    </svg>
  )
}

// 11. CANVA: Gradient cyan-purple badge
export function CanvaLogo({ size = 24, ...props }: PlatformLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="canva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c4cc" />
          <stop offset="100%" stopColor="#7d2ae8" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5" fill="url(#canva-grad)" />
      <text
        x="12"
        y="16.5"
        fontSize="14"
        fontWeight="bold"
        fontFamily="sans-serif"
        textAnchor="middle"
        fill="#FFFFFF"
        fontStyle="italic"
      >
        C
      </text>
    </svg>
  )
}

// 12. SPOTIFY WORDMARK: Circular green icon + "Spotify" text
export function SpotifyWordmark({ height = 28 }: { height?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <SpotifyLogo size={height} />
      <span
        style={{
          color: "#ffffff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Circular Std', 'DM Sans', sans-serif",
          fontWeight: 800,
          fontSize: `${height * 0.72}px`,
          letterSpacing: "-0.5px",
        }}
      >
        Spotify
      </span>
    </div>
  )
}

// 13. ADOBE CREATIVE CLOUD OFFICIAL LOGO
export function AdobeCreativeCloudLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="adobe-cc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FA0F00" />
          <stop offset="45%" stopColor="#D8147E" />
          <stop offset="70%" stopColor="#8A2BE2" />
          <stop offset="100%" stopColor="#0265DC" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#adobe-cc-grad)" />
      {/* Infinity ribbon inside CC icon */}
      <path
        d="M20.5 18C16.9 18 14 20.9 14 24.5C14 28.1 16.9 31 20.5 31C23.1 31 25.3 29.5 26.4 27.2C25.4 26.5 24.5 25.7 23.8 24.9C23 25.8 21.8 26.4 20.5 26.4C19.5 26.4 18.6 25.6 18.6 24.5C18.6 23.4 19.5 22.6 20.5 22.6C21.7 22.6 22.7 23.2 23.3 24.1C24.4 23 25.8 21.9 27.4 21.2C25.9 19.3 23.4 18 20.5 18ZM27.5 18C26.1 18 24.8 18.4 23.6 19.1C24.5 20.1 25.6 21.2 26.8 22.3C27.1 22.1 27.5 22 28 22C29.4 22 30.5 23.1 30.5 24.5C30.5 25.9 29.4 27 28 27C27.5 27 27.1 26.9 26.8 26.7C25.7 27.8 24.6 28.9 23.6 29.9C24.8 30.6 26.1 31 27.5 31C31.1 31 34 28.1 34 24.5C34 20.9 31.1 18 27.5 18Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

// 14. ADOBE APP TILES
export function PhotoshopIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#001E36" />
      <text x="16" y="21" fill="#31A8FF" fontSize="13" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
        Ps
      </text>
    </svg>
  )
}

export function IllustratorIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#330000" />
      <text x="16" y="21" fill="#FF9A00" fontSize="13" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
        Ai
      </text>
    </svg>
  )
}

export function PremiereIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#00005B" />
      <text x="16" y="21" fill="#9999FF" fontSize="13" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
        Pr
      </text>
    </svg>
  )
}

export function AfterEffectsIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#00005B" />
      <text x="16" y="21" fill="#9999FF" fontSize="13" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
        Ae
      </text>
    </svg>
  )
}

export function InDesignIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#49021F" />
      <text x="16" y="21" fill="#FF3366" fontSize="13" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
        Id
      </text>
    </svg>
  )
}

export function AcrobatIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#ED2224" />
      <path d="M10 23C13 21 15 15 16 9C17 15 19 21 22 23C18 22 14 22 10 23Z" fill="#FFFFFF" />
    </svg>
  )
}

