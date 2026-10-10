import { useEffect, useState } from "react"
import { getProviderHealthApi, getSubscriptionsApi } from "../services/api"
import type { Subscription } from "../types"

const providers = ["netflix", "spotify", "canva", "adobe"]

export type DemoOverview = {
  subscriptions: Subscription[]
  connected: boolean
  onlineProviders: number
  updatedAt: Date | null
}

export function useDemoOverview(): DemoOverview {
  const [overview, setOverview] = useState<DemoOverview>({
    subscriptions: [], connected: false, onlineProviders: 0, updatedAt: null,
  })

  useEffect(() => {
    let mounted = true
    let refreshing = false
    async function refresh() {
      if (refreshing || document.hidden) return
      refreshing = true
      const [subscriptions, ...health] = await Promise.allSettled([
        getSubscriptionsApi(), ...providers.map(getProviderHealthApi),
      ])
      refreshing = false
      if (!mounted) return
      setOverview((previous) => ({
        subscriptions: subscriptions.status === "fulfilled" ? subscriptions.value : previous.subscriptions,
        connected: subscriptions.status === "fulfilled",
        onlineProviders: health.filter((result) => result.status === "fulfilled" && result.value).length,
        updatedAt: subscriptions.status === "fulfilled" ? new Date() : previous.updatedAt,
      }))
    }
    refresh()
    const interval = window.setInterval(refresh, 5000)
    window.addEventListener("focus", refresh)
    return () => {
      mounted = false
      window.clearInterval(interval)
      window.removeEventListener("focus", refresh)
    }
  }, [])

  return overview
}
