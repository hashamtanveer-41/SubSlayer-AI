import { useEffect, useState } from "react"
import { Dashboard } from "./components/dashboard/Dashboard"
import { Landing } from "./components/landing/Landing"
import { LoginPage } from "./components/auth/LoginPage"
import { Toaster, toast } from "./components/ui"
import { seedSubscriptions, seedVirtualCards } from "./data/seedData"
import { getMeApi, logoutApi } from "./services/api"
import type { Page, Subscription, User, VirtualCard } from "./types"
import { readStored } from "./utils/formatters"

export default function App() {
  const getHashPage = (): Page => {
    const raw = window.location.hash.slice(1)
    const hash = raw.split("?")[0]
    if (hash === "app") return "app"
    if (hash === "login") return "login"
    if (hash === "signup") return "signup"
    return "landing"
  }

  const [page, setPage] = useState<Page>(getHashPage())
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [name, setName] = useState(() => readStored("subslayer-name", "Alex"))
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    readStored("subslayer-subscriptions-v2", seedSubscriptions),
  )
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(() =>
    readStored("subslayer-cards-v2", seedVirtualCards),
  )

  // 1. Initial Session Inspection (Query Param, Hash, & Cookie)
  useEffect(() => {
    let extractedSessionId: string | null = null

    try {
      // Check query string ?session_id=...
      const searchParams = new URLSearchParams(window.location.search)
      extractedSessionId = searchParams.get("session_id")

      // Check hash fragment #app?session_id=... or #?session_id=...
      if (!extractedSessionId && window.location.hash.includes("session_id=")) {
        const hashQuery = window.location.hash.split("?")[1]
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery)
          extractedSessionId = hashParams.get("session_id")
        }
      }

      if (extractedSessionId) {
        localStorage.setItem("subslayer_session", extractedSessionId)
        // Clean URL cleanly without reloading
        const targetHash = window.location.hash.includes("app") ? "#app" : ""
        window.history.replaceState(null, "", window.location.pathname + targetHash)
      }
    } catch (err) {
      console.error("Session inspection error:", err)
    }

    getMeApi()
      .then((user) => {
        if (user) {
          setCurrentUser(user)
          setName(user.name)
          if (extractedSessionId) {
            toast.success(`Welcome, ${user.name}!`, {
              description: "Signed in with Google successfully.",
            })
            setPage("app")
            window.location.hash = "app"
          } else if (window.location.hash.includes("app")) {
            setPage("app")
          }
        } else {
          setCurrentUser(null)
          if (window.location.hash.includes("app")) {
            setPage("landing")
            window.location.hash = ""
          }
        }
      })
      .catch(() => {
        setCurrentUser(null)
      })
      .finally(() => {
        setCheckingAuth(false)
      })
  }, [])

  // 2. Hash change navigation sync
  useEffect(() => {
    const listener = () => {
      setPage(getHashPage())
    }
    window.addEventListener("hashchange", listener)
    return () => window.removeEventListener("hashchange", listener)
  }, [])

  // 3. Local storage persistence for subscriptions & cards
  useEffect(() => {
    try {
      localStorage.setItem("subslayer-subscriptions-v2", JSON.stringify(subscriptions))
    } catch {
      /* Safe fallback */
    }
  }, [subscriptions])

  useEffect(() => {
    try {
      localStorage.setItem("subslayer-cards-v2", JSON.stringify(virtualCards))
    } catch {
      /* Safe fallback */
    }
  }, [virtualCards])

  function navigate(p: Page) {
    if (p === "app" && !currentUser) {
      toast.info("Sign in required", {
        description: "Please sign in with Google or create an account to view the dashboard.",
      })
      window.location.hash = "login"
      setPage("login")
      return
    }
    window.location.hash = p === "landing" ? "" : p
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleLogout() {
    try {
      await logoutApi()
      toast.success("Signed out successfully", {
        description: "Your session has ended securely.",
      })
    } catch (err: any) {
      toast.error("Logout error", {
        description: err?.message || "Could not complete logout.",
      })
    }
    setCurrentUser(null)
    window.location.hash = ""
    setPage("landing")
  }

  function handleAuthSuccess(user: User) {
    setCurrentUser(user)
    setName(user.name)
    try {
      localStorage.setItem("subslayer-name", JSON.stringify(user.name))
    } catch {
      /* Safe fallback */
    }
    window.location.hash = "app"
    setPage("app")
  }

  function resetSeedData() {
    setSubscriptions(seedSubscriptions)
    setVirtualCards(seedVirtualCards)
  }

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7fb",
          fontFamily: "Inter, system-ui, sans-serif",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #704b73 0%, #4a2d4e 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: 800,
            boxShadow: "0 8px 24px rgba(74, 45, 78, 0.25)",
          }}
        >
          S
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 750, fontSize: "16px", color: "#19141c" }}>
            SubSlayer.ai
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#2d1f33", fontWeight: 550 }}>
            Verifying secure session...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="bottom-right" />
      {page === "login" || page === "signup" ? (
        <LoginPage
          initialMode={page === "signup" ? "signup" : "login"}
          navigate={navigate}
          onSuccess={handleAuthSuccess}
        />
      ) : page === "app" ? (
        <Dashboard
          name={currentUser?.name || name}
          user={currentUser}
          subscriptions={subscriptions}
          setSubscriptions={setSubscriptions}
          virtualCards={virtualCards}
          setVirtualCards={setVirtualCards}
          onResetSeedData={resetSeedData}
          logout={handleLogout}
        />
      ) : (
        <Landing
          navigate={navigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}
