import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { Plus } from "lucide-react"
import {
  getSubscriptionsApi,
  getProviderHealthApi,
  getVirtualCards,
  analyzeSubscriptionApi,
  saveSubscriptionApi,
  toggleCardLockApi,
} from "../../services/api"
import type { AgentCompletedEvent, DashboardSection, Subscription, VirtualCard } from "../../types"
import { monthly } from "../../utils/formatters"
import { AgentExecutionModal } from "../agent/AgentExecutionModal"
import { VirtualCardsView } from "../cards/VirtualCardsView"
import { Toast } from "../common/Toast"
import { Button } from "../ui/Button"
import { AddEditSubscriptionDialog } from "./AddEditSubscriptionDialog"
import { ControlCard } from "./ControlCard"
import { DashboardHeader } from "./DashboardHeader"
import { InsightBanner } from "./InsightBanner"
import { RenewalsDialog } from "./RenewalsDialog"
import { Sidebar } from "./Sidebar"
import { StatGrid } from "./StatGrid"
import { SubscriptionsTable } from "./SubscriptionsTable"
import { UpcomingRenewalsCard } from "./UpcomingRenewalsCard"

export interface DashboardProps {
  name: string
  subscriptions: Subscription[]
  setSubscriptions: Dispatch<SetStateAction<Subscription[]>>
  virtualCards: VirtualCard[]
  setVirtualCards: Dispatch<SetStateAction<VirtualCard[]>>
  logout: () => void
}

export function Dashboard({
  name,
  subscriptions,
  setSubscriptions,
  virtualCards,
  setVirtualCards,
  logout,
}: DashboardProps) {
  const [section, setSection] = useState<DashboardSection>("Overview")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All categories")
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [selectedForCancel, setSelectedForCancel] = useState<Subscription | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState("")
  const [renewalsOpen, setRenewalsOpen] = useState(false)
  const [backendReady, setBackendReady] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [onlineProviders, setOnlineProviders] = useState<string[]>([])
  const [aiInsight, setAiInsight] = useState("")
  const [analyzing, setAnalyzing] = useState(false)

  // Keep the dashboard aligned with gateway state, including changes made on
  // another device. Failed refreshes leave the last known data visibly stale.
  useEffect(() => {
    let mounted = true
    let refreshing = false
    async function syncBackendData() {
      if (refreshing || document.hidden) return
      refreshing = true
      const providers = ["netflix", "spotify", "canva", "adobe"]
      const [liveCards, liveSubs, ...health] = await Promise.allSettled([
        getVirtualCards(), getSubscriptionsApi(), ...providers.map(getProviderHealthApi),
      ])
      refreshing = false
      if (!mounted) return
      if (liveCards.status === "fulfilled") setVirtualCards(liveCards.value)
      if (liveSubs.status === "fulfilled") setSubscriptions(liveSubs.value)
      setOnlineProviders(providers.filter((_, index) => {
        const result = health[index]
        return result?.status === "fulfilled" && result.value
      }))
      const ready = liveCards.status === "fulfilled" && liveSubs.status === "fulfilled"
      setBackendReady(ready)
      if (ready) setLastSynced(new Date())
    }
    syncBackendData()
    const interval = window.setInterval(syncBackendData, 5000)
    const onFocus = () => syncBackendData()
    window.addEventListener("focus", onFocus)
    return () => {
      mounted = false
      window.clearInterval(interval)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  // Computed metrics
  const active = subscriptions.filter((s) => s.status === "Active")
  const pending = subscriptions.filter((s) => s.status === "Pending Cancellation")
  const cancelled = subscriptions.filter((s) => s.status === "Cancelled")
  const spend = [...active, ...pending].reduce((sum, s) => sum + monthly(s), 0)
  const savings = cancelled.reduce((sum, s) => sum + monthly(s), 0)
  const sortedRenewals = [...active].sort((a, b) =>
    a.renewal.localeCompare(b.renewal),
  )

  const visible = subscriptions.filter(
    (s) =>
      (section === "Cancellation history"
        ? s.status === "Cancelled" || s.status === "Pending Cancellation"
        : s.status === "Active") &&
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All categories" || s.category === category),
  )

  async function handleSaveSubscription(sub: Subscription) {
    try {
      const saved = await saveSubscriptionApi(sub, !!editing)
      setSubscriptions((current) => editing
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [...current, saved])
      setAddOpen(false)
      setEditing(null)
      setNotice(`${saved.name} saved in the backend.`)
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not save subscription")
    }
  }

  function handleCancelResult(sub: Subscription, event: AgentCompletedEvent) {
    setSubscriptions((current) => current.map((item) => item.id === sub.id
      ? { ...item, status: event.status === "success" ? "Cancelled" : "Pending Cancellation",
          projectedAnnualSavings: event.projectedAnnualSavings,
          providerRequestId: event.providerRequestId,
          cancellationEffectiveDate: event.effectiveDate }
      : item))
    setNotice(event.status === "success"
      ? `${sub.name} cancelled by demo provider. Receipt: ${event.providerRequestId}`
      : `${sub.name} cancellation is pending. Receipt: ${event.providerRequestId}`)
  }

  async function handleAnalyze(sub: Subscription) {
    setAnalyzing(true)
    setAiInsight("")
    try {
      const result = await analyzeSubscriptionApi(sub)
      setAiInsight(result)
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Qwen analysis unavailable")
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleToggleCardLock(cardId: string) {
    const target = virtualCards.find((c) => c.id === cardId)
    const newLocked = !(target?.balanceLocked ?? target?.demoPolicyLocked ?? target?.status === "locked")

    try {
      const updated = await toggleCardLockApi(cardId, newLocked)
      setVirtualCards((prev) =>
        prev.map((c) => (c.id === cardId ? updated : c)),
      )
      setNotice(newLocked ? "Demo card policy locked; future test charges will be blocked."
        : `Demo card policy unlocked for ${target?.label || "Service"}.`)
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not update card policy")
    }
  }

  return (
    <div className="dashboard">
      <Sidebar
        name={name}
        section={section}
        setSection={setSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeCount={active.length}
        backendReady={backendReady}
        onOpenHelp={() => {
          setSection("Subscriptions")
          setNotice("Choose Netflix, Spotify, Canva, or Adobe, then confirm a demo API request.")
        }}
        logout={logout}
      />

      <div className="dashboard-main">
        <DashboardHeader
          name={name}
          section={section}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenRenewals={() => setRenewalsOpen(true)}
          backendReady={backendReady}
        />

        <main className="dashboard-content">
          {!backendReady && <div className="permission-note" role="status">
            {lastSynced ? `Gateway unavailable. Showing last known data from ${lastSynced.toLocaleTimeString()}; actions are paused.`
              : "Connecting to the gateway. Subscriptions, payments, and provider requests will load when it responds."}
          </div>}
          <div className="dashboard-title">
            <div>
              <span className="eyebrow">PROVIDER API DEMO</span>
              <h1>
                {section === "Overview"
                  ? `Welcome back, ${name.split(" ")[0]}.`
                  : section === "Subscriptions"
                    ? "Active Subscriptions."
                    : section === "Cancellation history"
                      ? "Cancellation Status."
                      : "Stripe Test Payment Shield."}
              </h1>
              <p>
                {section === "Overview"
                  ? "Here is your demo recurring spend and provider API status."
                  : section === "Subscriptions"
                    ? "Send cancellation requests to the four demo provider APIs."
                    : section === "Cancellation history"
                      ? "Demo provider receipts and pending cancellation requests."
                      : "Lock demo card policies and test Stripe charges against the local wallet."}
              </p>
              {backendReady && <p role="status">{onlineProviders.length} of 4 provider APIs reachable · Last updated {lastSynced?.toLocaleTimeString()}</p>}
            </div>
            {section !== "Virtual cards shield" && (
              <Button
                disabled={!backendReady}
                onClick={() => {
                  setEditing(null)
                  setAddOpen(true)
                }}
              >
                <Plus size={17} />
                Add subscription
              </Button>
            )}
          </div>

          {/* Section: Overview */}
          {section === "Overview" && (
            <>
              <StatGrid
                spend={spend}
                savings={savings}
                active={active}
                cancelled={cancelled}
              />
              <InsightBanner
                active={active.filter((sub) => onlineProviders.includes(sub.provider || ""))}
                onOpenCancel={(sub) => backendReady && setSelectedForCancel(sub)}
                onAnalyze={handleAnalyze}
                analyzing={analyzing}
                backendReady={backendReady}
                insight={aiInsight}
              />
              <SubscriptionsTable
                section={section}
                visible={visible}
                allCount={subscriptions.length}
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                onEdit={(sub) => {
                  setEditing(sub)
                  setAddOpen(true)
                }}
                onOpenCancel={(sub) => backendReady && setSelectedForCancel(sub)}
                backendReady={backendReady}
                onlineProviders={onlineProviders}
              />
              <div className="dashboard-lower">
                <UpcomingRenewalsCard renewals={sortedRenewals} />
                <ControlCard />
              </div>
            </>
          )}

          {/* Section: Subscriptions or Cancellation History */}
          {(section === "Subscriptions" || section === "Cancellation history") && (
            <SubscriptionsTable
              section={section}
              visible={visible}
              allCount={subscriptions.length}
              search={search}
              setSearch={setSearch}
              category={category}
              setCategory={setCategory}
              onEdit={(sub) => {
                setEditing(sub)
                setAddOpen(true)
              }}
              onOpenCancel={(sub) => backendReady && setSelectedForCancel(sub)}
              backendReady={backendReady}
              onlineProviders={onlineProviders}
            />
          )}

          {/* Section: Virtual Cards Shield (Feature 2) */}
          {section === "Virtual cards shield" && (
            <VirtualCardsView
              cards={virtualCards}
              onToggleLock={handleToggleCardLock}
              onSyncBackendCards={setVirtualCards}
              backendReady={backendReady}
            />
          )}

          <footer className="dashboard-footer">
            <span>SubSlayer AI · Active Financial Defense</span>
            <span>Hackathon Live Preview</span>
          </footer>
        </main>
      </div>

      {/* Add / Edit Subscription Dialog */}
      <AddEditSubscriptionDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setEditing(null)
        }}
        editing={editing}
        onSave={handleSaveSubscription}
      />

      {/* Autonomous Agent Cancellation Dialog */}
      <AgentExecutionModal
        selected={selectedForCancel}
        onClose={() => setSelectedForCancel(null)}
        onResult={handleCancelResult}
        onFailure={() => { getSubscriptionsApi().then(setSubscriptions).catch(() => undefined) }}
        onGoToHistory={() => {
          setSelectedForCancel(null)
          setSection("Cancellation history")
        }}
      />

      {/* Renewals Timeline Dialog */}
      <RenewalsDialog
        open={renewalsOpen}
        onOpenChange={setRenewalsOpen}
        renewals={sortedRenewals}
      />

      {/* Notification Toast */}
      <Toast message={notice} onClose={() => setNotice("")} />
    </div>
  )
}
