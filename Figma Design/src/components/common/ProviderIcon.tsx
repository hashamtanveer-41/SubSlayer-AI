import type { Subscription } from "../../types"
import {
  AdobeLogo,
  AmazonPrimeLogo,
  CanvaLogo,
  ChatGPTLogo,
  DisneyPlusLogo,
  FigmaLogo,
  ICloudLogo,
  NetflixLogo,
  NotionLogo,
  SpotifyLogo,
  YouTubeLogo,
} from "./PlatformLogos"

export interface ProviderIconProps {
  sub: Partial<Subscription> & { mark?: string; tone?: string; name?: string }
  small?: boolean
  className?: string
}

export function ProviderIcon({ sub, small = false, className = "" }: ProviderIconProps) {
  const size = small ? 22 : 32
  const name = (sub.name || "").toLowerCase()
  const tone = (sub.tone || "").toLowerCase()

  // Match provider by tone or name
  if (tone === "spotify" || name.includes("spotify")) {
    return <SpotifyLogo size={size} className={className} />
  }

  if (tone === "netflix" || name.includes("netflix")) {
    return <NetflixLogo size={size} className={className} />
  }

  if (tone === "adobe" || name.includes("adobe")) {
    return <AdobeLogo size={size} className={className} />
  }

  if (tone === "notion" || name.includes("notion")) {
    return <NotionLogo size={size} className={className} />
  }

  if (tone === "icloud" || name.includes("icloud") || name.includes("apple")) {
    return <ICloudLogo size={size} className={className} />
  }

  if (tone === "figma" || name.includes("figma")) {
    return <FigmaLogo size={size} className={className} />
  }

  if (name.includes("youtube")) {
    return <YouTubeLogo size={size} className={className} />
  }

  if (name.includes("chatgpt") || name.includes("openai")) {
    return <ChatGPTLogo size={size} className={className} />
  }

  if (name.includes("disney")) {
    return <DisneyPlusLogo size={size} className={className} />
  }

  if (name.includes("prime") || name.includes("amazon")) {
    return <AmazonPrimeLogo size={size} className={className} />
  }

  if (name.includes("canva")) {
    return <CanvaLogo size={size} className={className} />
  }

  // Fallback: Modern clean gradient badge with uppercase initial
  const initial = (sub.name || sub.mark || "S").charAt(0).toUpperCase()
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: small ? "5px" : "8px",
        background: "linear-gradient(135deg, #72556e 0%, #4a3348 100%)",
        color: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: small ? "11px" : "15px",
        fontWeight: 700,
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}
