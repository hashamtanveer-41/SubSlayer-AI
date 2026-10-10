import { useEffect, useState } from "react"
import { Auth } from "./components/auth/Auth"
import { Dashboard } from "./components/dashboard/Dashboard"
import { Landing } from "./components/landing/Landing"
import type { Page, Subscription, VirtualCard } from "./types"
import { readStored } from "./utils/formatters"

export default function App() {
  const initialPage = (): Page => {
    const p = window.location.hash.slice(1)
    return ["login", "signup", "app"].includes(p) ? (p as Page) : "landing"
  }

  const [page, setPage] = useState<Page>(initialPage)
  const [name, setName] = useState(() => readStored("subslayer-name", "Alex"))
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([])

  useEffect(() => {
    const listener = () => setPage(initialPage())
    window.addEventListener("hashchange", listener)
    return () => window.removeEventListener("hashchange", listener)
  }, [])

  function navigate(p: Page) {
    window.location.hash = p === "landing" ? "" : p
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function login(userName: string) {
    setName(userName)
    try {
      localStorage.setItem("subslayer-name", JSON.stringify(userName))
    } catch {
      /* Safe fallback */
    }
    navigate("app")
  }

  if (page === "app") {
    return (
      <Dashboard
        name={name}
        subscriptions={subscriptions}
        setSubscriptions={setSubscriptions}
        virtualCards={virtualCards}
        setVirtualCards={setVirtualCards}
        logout={() => navigate("landing")}
      />
    )
  }

  if (page === "login" || page === "signup") {
    return <Auth mode={page} navigate={navigate} onLogin={login} />
  }

  return <Landing navigate={navigate} />
}
