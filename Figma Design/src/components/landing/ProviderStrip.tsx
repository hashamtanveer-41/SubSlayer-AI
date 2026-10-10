import { Command } from "lucide-react"

export function ProviderStrip() {
  return (
    <section className="provider-strip">
      <span>
        ANY SERVICE. ANY RETENTION MAZE.
        <br />
        <strong>ONE CLICK TO SLAY.</strong>
      </span>
      <div className="provider-wordmark netflix-word">NETFLIX</div>
      <div className="provider-wordmark">
        <span className="spotify-circle">≋</span> Spotify
      </div>
      <div className="provider-wordmark adobe-word">
        <span>Λ</span> Adobe
      </div>
      <div className="provider-wordmark notion-word">
        <span>N</span> Notion
      </div>
      <div className="provider-wordmark figma-word">
        <Command size={24} /> Figma
      </div>
      <span className="strip-more">and 10,000+ others.</span>
    </section>
  )
}
