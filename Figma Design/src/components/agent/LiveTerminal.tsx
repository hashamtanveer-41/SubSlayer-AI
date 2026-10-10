import { Terminal } from "lucide-react"

export interface TerminalLog {
  timestamp: string
  message: string
  type?: "info" | "warn" | "success" | "action"
}

export interface LiveTerminalProps {
  logs: TerminalLog[]
}

export function LiveTerminal({ logs }: LiveTerminalProps) {
  return (
    <div
      style={{
        background: "#1e1722",
        color: "#e8dfea",
        borderRadius: "8px",
        padding: "14px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: "11px",
        marginTop: "14px",
        border: "1px solid #3d2f44",
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid #332639",
          paddingBottom: "8px",
          marginBottom: "10px",
          color: "#b09db5",
          fontSize: "10px",
        }}
      >
        <Terminal size={13} color="#c9a8d4" />
        <span>SubSlayer Headless Browser Agent Console</span>
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            color: "#6ee7b7",
            fontSize: "9px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
            }}
          />
          LIVE
        </span>
      </div>
      <div
        style={{
          maxHeight: "130px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {logs.map((log, idx) => (
          <div key={idx} style={{ lineHeight: 1.5, display: "flex", gap: "8px" }}>
            <span style={{ color: "#796683", flexShrink: 0 }}>[{log.timestamp}]</span>
            <span
              style={{
                color:
                  log.type === "warn"
                    ? "#fcd34d"
                    : log.type === "success"
                      ? "#6ee7b7"
                      : log.type === "action"
                        ? "#c084fc"
                        : "#e8dfea",
              }}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
