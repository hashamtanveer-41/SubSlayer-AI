import {
  ArrowUpRight,
  Camera,
  ListFilter,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import type { DashboardSection, Page, Subscription } from "../../types"
import { formatDate, money } from "../../utils/formatters"
import { ProviderIcon } from "../common/ProviderIcon"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

export interface SubscriptionsTableProps {
  section: DashboardSection
  visible: Subscription[]
  allCount: number
  search: string
  setSearch: (s: string) => void
  category: string
  setCategory: (c: string) => void
  onEdit: (sub: Subscription) => void
  onOpenCancel: (sub: Subscription) => void
  onRestore: (sub: Subscription) => void
  onViewProof?: (sub: Subscription) => void
  onAnalyze?: (sub: Subscription) => void
  analyzingSubId?: string | null
  onNavigate?: (p: Page) => void
}

export function SubscriptionsTable({
  section,
  visible,
  allCount,
  search,
  setSearch,
  category,
  setCategory,
  onEdit,
  onOpenCancel,
  onRestore,
  onViewProof,
  onAnalyze,
  analyzingSubId,
  onNavigate,
}: SubscriptionsTableProps) {
  const isHistory = section === "Cancellation history"

  return (
    <section className="subscriptions-panel">
      <div className="panel-heading">
        <div>
          <h2>
            {isHistory ? "Slayed Subscriptions" : "Active Recurring Subscriptions"}
            <span>{visible.length}</span>
          </h2>
          <p>
            {isHistory
              ? "Photographic proof and annualized cash reclaimed."
              : "Review services and trigger autonomous AI cancellation."}
          </p>
        </div>
        <div className="table-controls">
          <label className="search-input">
            <Search size={16} />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search subscriptions"
            />
          </label>
          <label className="category-filter">
            <ListFilter size={16} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter category"
            >
              {[
                "All categories",
                "Entertainment",
                "Productivity",
                "Storage",
                "Other",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Subscription</th>
              <th>Category</th>
              <th>Cost</th>
              <th>{isHistory ? "Cancellation Date" : "Next Renewal"}</th>
              <th>Status</th>
              <th>Vampire Risk</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="subscription-name">
                    <ProviderIcon sub={s} />
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.cycle} billing</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-tag">{s.category}</span>
                </td>
                <td>
                  <strong>{money(s.price)}</strong>
                  <span className="cost-cycle">
                    /{s.cycle === "Monthly" ? "mo" : "yr"}
                  </span>
                </td>
                <td>{formatDate(s.renewal)}</td>
                <td>
                  <span
                    className={`status-pill ${
                      s.status === "Cancelled" ? "cancelled" : ""
                    }`}
                  >
                    <span />
                    {s.status === "Cancelled" ? "Slayed" : "Active"}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background:
                        (s.vampireScore || 0) > 75
                          ? "#fde8e8"
                          : (s.vampireScore || 0) > 40
                            ? "#fef3c7"
                            : "#e9f5ee",
                      color:
                        (s.vampireScore || 0) > 75
                          ? "#b91c1c"
                          : (s.vampireScore || 0) > 40
                            ? "#b45309"
                            : "#15803d",
                    }}
                  >
                    {(s.vampireScore || 0) > 75 ? "High" : (s.vampireScore || 0) > 40 ? "Med" : "Low"} ({s.vampireScore || 50}/100)
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    {s.status === "Active" ? (
                      <>
                        {onAnalyze && (
                          <Button
                            variant="ghost"
                            loading={analyzingSubId === s.id}
                            onClick={() => onAnalyze(s)}
                            title={`Analyze ${s.name} with AI`}
                            aria-label={`Analyze ${s.name} with AI`}
                            style={{
                              color: "var(--accent)",
                              padding: "6px 8px",
                            }}
                          >
                            <Sparkles size={14} />
                          </Button>
                        )}
                        {(s.provider === "spotify" || s.name.toLowerCase().includes("spotify")) && onNavigate && (
                          <Button
                            variant="ghost"
                            onClick={() => onNavigate("demo-spotify")}
                            title="Open Spotify Demo Portal"
                            aria-label="Open Spotify Demo Portal"
                            style={{
                              color: "#1ed760",
                              fontWeight: 700,
                              fontSize: "11.5px",
                              padding: "4px 8px",
                              background: "rgba(30, 215, 96, 0.08)",
                              borderRadius: "4px",
                            }}
                          >
                            Demo ↗
                          </Button>
                        )}
                        {(s.provider === "adobe" || s.name.toLowerCase().includes("adobe")) && onNavigate && (
                          <Button
                            variant="ghost"
                            onClick={() => onNavigate("demo-adobe")}
                            title="Open Adobe Dark Pattern Maze"
                            aria-label="Open Adobe Dark Pattern Maze"
                            style={{
                              color: "#fa0f00",
                              fontWeight: 700,
                              fontSize: "11.5px",
                              padding: "4px 8px",
                              background: "rgba(250, 15, 0, 0.08)",
                              borderRadius: "4px",
                            }}
                          >
                            Maze ↗
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => onEdit(s)}
                          aria-label={`Edit ${s.name}`}
                        >
                          <SlidersHorizontal size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => onOpenCancel(s)}
                          style={{
                            color: "var(--accent)",
                            fontWeight: 600,
                            gap: "6px",
                          }}
                        >
                          <Sparkles size={13} />
                          Auto-Cancel <ArrowUpRight size={14} />
                        </Button>

                      </>
                    ) : (
                      <div style={{ display: "flex", gap: "6px" }}>
                        {s.proofScreenshotUrl && onViewProof && (
                          <Button
                            variant="ghost"
                            onClick={() => onViewProof(s)}
                            style={{ gap: "4px" }}
                          >
                            <Camera size={13} /> Proof
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => onRestore(s)}
                          style={{ gap: "4px" }}
                        >
                          <RotateCcw size={14} /> Restore
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!visible.length && (
        <div className="empty-state">
          <Search size={28} />
          <h3>
            {isHistory
              ? "No slayed subscriptions yet."
              : "No subscriptions found in this view."}
          </h3>
          <p>
            {search || category !== "All categories"
              ? "Try adjusting your search query or category filter."
              : "Click 'Auto-Cancel' on an active subscription to watch the AI in action."}
          </p>
        </div>
      )}

      <div className="table-footer">
        <span>
          {visible.length} subscription{visible.length !== 1 ? "s" : ""} · USD
        </span>
        <span>
          <ShieldCheck size={13} /> Explicit user authorization required.
        </span>
      </div>
    </section>
  )
}
