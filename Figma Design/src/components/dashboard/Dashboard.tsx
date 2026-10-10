import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import {
  analyzeSubscriptionApi,
  getSubscriptionsApi,
  getVirtualCards,
  toggleCardLockApi,
  type AiAnalysisResult,
} from "../../services/api"
import type { DashboardSection, Page, Subscription, User, VirtualCard } from "../../types"
import { monthly } from "../../utils/formatters"
import { AgentExecutionModal } from "../agent/AgentExecutionModal"
import { VirtualCardsView } from "../cards/VirtualCardsView"
import { Toast } from "../common/Toast"
import { Button } from "../ui/Button"
import { toast } from "../ui"
import { AddEditSubscriptionDialog } from "./AddEditSubscriptionDialog"
import { ControlCard } from "./ControlCard"
import { DashboardHeader } from "./DashboardHeader"
import { InsightBanner } from "./InsightBanner"
import { RenewalsDialog } from "./RenewalsDialog"
import { SettingsDialog } from "./SettingsDialog"
import { Sidebar } from "./Sidebar"
import { StatGrid } from "./StatGrid"
import { SubscriptionsTable } from "./SubscriptionsTable"
import { UpcomingRenewalsCard } from "./UpcomingRenewalsCard"

export interface DashboardProps {
  name: string
  user?: User | null
  subscriptions: Subscription[]
  setSubscriptions: (subs: Subscription[]) => void
  virtualCards: VirtualCard[]
  setVirtualCards: (cards: VirtualCard[]) => void
  onResetSeedData: () => void
  logout: () => void
  onNavigate?: (p: Page) => void
}

export function Dashboard({
  name,
  user,
  subscriptions,
  setSubscriptions,
  virtualCards,
  setVirtualCards,
  onResetSeedData,
  logout,
  onNavigate,
}: DashboardProps) {
  const [section, setSection] = useState<DashboardSection>("Overview")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All categories")
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [selectedForCancel, setSelectedForCancel] = useState<Subscription | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState("")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [renewalsOpen, setRenewalsOpen] = useState(false)
  const [aiInsight, setAiInsight] = useState<AiAnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzingSubId, setAnalyzingSubId] = useState<string | null>(null)

  // Sync with live FastAPI backend on initial mount
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [liveCards, liveSubs] = await Promise.allSettled([
          getVirtualCards(),
          getSubscriptionsApi(),
        ])
        if (liveCards.status === "fulfilled" && liveCards.value.length > 0) {
          setVirtualCards(liveCards.value)
        }
        if (liveSubs.status === "fulfilled" && liveSubs.value.length > 0) {
          setSubscriptions(liveSubs.value)
        }
      } catch (e) {
        console.warn("Backend sync fallback to local store:", e)
      }
    }
    syncBackendData()
  }, [])

  // Computed metrics
  const active = subscriptions.filter((s) => s.status === "Active")
  const cancelled = subscriptions.filter((s) => s.status === "Cancelled")
  const spend = active.reduce((sum, s) => sum + monthly(s), 0)
  const savings = cancelled.reduce((sum, s) => sum + monthly(s), 0)
  const sortedRenewals = [...active].sort((a, b) =>
    a.renewal.localeCompare(b.renewal),
  )

  const visible = subscriptions.filter(
    (s) =>
      (section === "Cancellation history"
        ? s.status === "Cancelled"
        : s.status === "Active") &&
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All categories" || s.category === category),
  )

  function handleSaveSubscription(sub: Subscription) {
    setSubscriptions(
      editing
        ? subscriptions.map((s) => (s.id === editing.id ? sub : s))
        : [...subscriptions, sub],
    )
    setAddOpen(false)
    setEditing(null)
    setNotice(
      editing
        ? `Updated ${sub.name}.`
        : `Added ${sub.name} to SubSlayer active tracking.`,
    )
  }

  function handleCancelSuccess(sub: Subscription) {
    setSubscriptions(
      subscriptions.map((s) =>
        s.id === sub.id
          ? {
              ...s,
              status: "Cancelled",
              proofScreenshotUrl: "/static/proofs/verified.png",
            }
          : s,
      ),
    )
    setNotice(`AI Agent slayed ${sub.name}! Projected savings updated.`)
  }

  function handleRestoreSubscription(sub: Subscription) {
    setSubscriptions(
      subscriptions.map((item) =>
        item.id === sub.id ? { ...item, status: "Active" } : item,
      ),
    )
    setNotice(`Restored ${sub.name} to active monitoring.`)
  }

  async function handleToggleCardLock(cardId: string) {
    const target = virtualCards.find((c) => c.id === cardId)
    const newLocked = !(target?.balanceLocked ?? target?.demoPolicyLocked ?? target?.status === "locked")

    // Optimistic UI update
    setVirtualCards(
      virtualCards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              balanceLocked: newLocked,
              demoPolicyLocked: newLocked,
              status: newLocked ? "locked" : "active",
            }
          : c,
      ),
    )

    try {
      const updated = await toggleCardLockApi(cardId, newLocked)
      setVirtualCards(
        virtualCards.map((c) => (c.id === cardId ? updated : c)),
      )
    } catch {
      // Local fallback
    }

    setNotice(
      newLocked
        ? `Card balance locked to $0.00! Stripe payment shield active.`
        : `Unlocked virtual card for ${target?.merchant || target?.label || "Service"}.`,
    )
  }

  function handleAddCard(card: VirtualCard) {
    setVirtualCards([...virtualCards, card])
    setNotice("New SubSlayer burner virtual card generated.")
  }

  function handleUpdateCardLimit(cardId: string, limit: number) {
    setVirtualCards(
      virtualCards.map((c) =>
        c.id === cardId ? { ...c, spendingLimit: limit } : c,
      ),
    )
  }

  async function handleAnalyze(sub: Subscription) {
    setAnalyzing(true)
    setAnalyzingSubId(sub.id)
    const toastId = toast.loading("Analyzing with AI...", {
      description: `Evaluating ${sub.name} (${sub.category}) for recurring vampire traits...`,
    })

    try {
      const result = await analyzeSubscriptionApi(sub)
      setAiInsight(result)
      setSubscriptions(
        subscriptions.map((s) => (s.id === sub.id ? { ...s, vampireScore: result.riskScore } : s)),
      )
      toast.success("AI Analysis Complete", {
        id: toastId,
        description: result.formattedSummary,
      })
    } catch (err: any) {
      toast.error("Analysis unavailable", {
        id: toastId,
        description: err?.message || "AI analysis unavailable",
      })
    } finally {
      setAnalyzing(false)
      setAnalyzingSubId(null)
    }
  }

  return (
    <div className="dashboard">
      <Sidebar
        name={name}
        user={user}
        section={section}
        setSection={setSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeCount={active.length}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() =>
          setNotice("Choose an active subscription and click Auto-Cancel to deploy the AI agent.")
        }
        logout={logout}
        onNavigate={onNavigate}
      />

      <div className="dashboard-main">
        <DashboardHeader
          name={name}
          user={user}
          section={section}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenRenewals={() => setRenewalsOpen(true)}
          onNavigate={onNavigate}
        />


        <main className="dashboard-content">
          <div className="dashboard-title">
            <div>
              <span className="eyebrow">AUTONOMOUS AGENT ACTIVE</span>
              <h1>
                {section === "Overview"
                  ? `Welcome back, ${name.split(" ")[0]}.`
                  : section === "Subscriptions"
                    ? "Active Subscriptions."
                    : section === "Cancellation history"
                      ? "Slayed Subscriptions."
                      : "Privacy.com Virtual Card Shield."}
              </h1>
              <p>
                {section === "Overview"
                  ? "Here is your real-time recurring spend and active AI defense status."
                  : section === "Subscriptions"
                    ? "Deploy the SubSlayer browser agent to bypass dark patterns and cancel services."
                    : section === "Cancellation history"
                      ? "A verifiable record of subscriptions cancelled by the AI agent."
                      : "Lock card balances to $0.00 to prevent stubborn merchants from billing you."}
              </p>
            </div>
            {section !== "Virtual cards shield" && (
              <Button
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
                active={active}
                onOpenCancel={(sub) => setSelectedForCancel(sub)}
                onAnalyze={handleAnalyze}
                analyzing={analyzing}
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
                onOpenCancel={(sub) => setSelectedForCancel(sub)}
                onRestore={handleRestoreSubscription}
                onAnalyze={handleAnalyze}
                analyzingSubId={analyzingSubId}
                onNavigate={onNavigate}
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
              onOpenCancel={(sub) => setSelectedForCancel(sub)}
              onRestore={handleRestoreSubscription}
              onViewProof={(sub) => setSelectedForCancel(sub)}
              onAnalyze={handleAnalyze}
              analyzingSubId={analyzingSubId}
              onNavigate={onNavigate}
            />
          )}


          {/* Section: Virtual Cards Shield (Feature 2) */}
          {section === "Virtual cards shield" && (
            <VirtualCardsView
              cards={virtualCards}
              onToggleLock={handleToggleCardLock}
              onAddCard={handleAddCard}
              onUpdateLimit={handleUpdateCardLimit}
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
        onSuccess={handleCancelSuccess}
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

      {/* Workspace Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onResetData={() => {
          onResetSeedData()
          setSettingsOpen(false)
          setNotice("Workspace reset to original seed data.")
        }}
      />

      {/* Notification Toast */}
      <Toast message={notice} onClose={() => setNotice("")} />
    </div>
  )
}
