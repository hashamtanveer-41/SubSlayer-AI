import {
  AdobeLogo,
  ChatGPTLogo,
  FigmaLogo,
  NetflixLogo,
  NotionLogo,
  SpotifyLogo,
  YouTubeLogo,
} from "../common/PlatformLogos"

export function ProviderStrip() {
  const providers = [
    { name: "Netflix", logo: <NetflixLogo size={24} /> },
    { name: "Spotify", logo: <SpotifyLogo size={24} /> },
    { name: "Adobe", logo: <AdobeLogo size={24} /> },
    { name: "Notion", logo: <NotionLogo size={24} /> },
    { name: "Figma", logo: <FigmaLogo size={24} /> },
    { name: "ChatGPT", logo: <ChatGPTLogo size={24} /> },
    { name: "YouTube", logo: <YouTubeLogo size={24} /> },
  ]

  return (
    <section className="provider-strip" style={{ overflowX: "auto", padding: "26px 36px" }}>
      <span style={{ flexShrink: 0, marginRight: "12px" }}>
        AUTONOMOUS CANCELLATION FOR
        <br />
        <strong style={{ color: "var(--color-ink)", fontWeight: 700 }}>
          10,000+ POPULAR PLATFORMS
        </strong>
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {providers.map((p) => (
          <div
            key={p.name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              padding: "6px 14px",
              borderRadius: "8px",
              background: "#ffffff",
              border: "1px solid #e9e3e9",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
          >
            {p.logo}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 650,
                fontSize: "14px",
                color: "#302b32",
                letterSpacing: "-0.3px",
              }}
            >
              {p.name}
            </span>
          </div>
        ))}
      </div>

      <span className="strip-more" style={{ flexShrink: 0, marginLeft: "8px" }}>
        and any SaaS, gym, or streaming service.
      </span>
    </section>
  )
}
