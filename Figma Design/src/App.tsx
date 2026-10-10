import { useEffect, useState } from "react"
import { Dashboard } from "./components/dashboard/Dashboard"
import { Landing } from "./components/landing/Landing"
import type { Page, Subscription, VirtualCard } from "./types"

export default function App() {
  const initialPage = (): Page => {
    const p = window.location.hash.slice(1)
    return ["login", "signup", "app"].includes(p) ? "app" : "landing"
  }

  const [page, setPage] = useState<Page>(initialPage)
  const name = "Demo"
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

  return <Landing navigate={navigate} />
}
