import { useEffect, useState, type FormEvent } from "react"
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  ListFilter,
  LoaderCircle,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X,
  Zap,
  CalendarDays,
  CirclePause,
  Command,
  Bell,
  Play,
  RotateCcw,
} from "lucide-react"
import { Button, Input, Dialog } from "./components/ui"

type Subscription = {
  id: string
  name: string
  category: string
  price: number
  cycle: "Monthly" | "Yearly"
  renewal: string
  status: "Active" | "Cancelled"
  mark: string
  tone: string
}
type Page = "landing" | "login" | "signup" | "app"
const seed: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    category: "Entertainment",
    price: 15.49,
    cycle: "Monthly",
    renewal: "2026-06-24",
    status: "Active",
    mark: "N",
    tone: "netflix",
  },
  {
    id: "2",
    name: "Spotify",
    category: "Entertainment",
    price: 10.99,
    cycle: "Monthly",
    renewal: "2026-06-26",
    status: "Active",
    mark: "≋",
    tone: "spotify",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    category: "Productivity",
    price: 59.99,
    cycle: "Monthly",
    renewal: "2026-06-28",
    status: "Active",
    mark: "A",
    tone: "adobe",
  },
  {
    id: "4",
    name: "Notion",
    category: "Productivity",
    price: 10,
    cycle: "Monthly",
    renewal: "2026-07-02",
    status: "Active",
    mark: "N",
    tone: "notion",
  },
  {
    id: "5",
    name: "iCloud+",
    category: "Storage",
    price: 2.99,
    cycle: "Monthly",
    renewal: "2026-07-05",
    status: "Active",
    mark: "☁",
    tone: "icloud",
  },
  {
    id: "6",
    name: "Figma",
    category: "Productivity",
    price: 144,
    cycle: "Yearly",
    renewal: "2026-07-12",
    status: "Active",
    mark: "F",
    tone: "figma",
  },
]
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  )
const monthly = (s: Subscription) =>
  s.cycle === "Yearly" ? s.price / 12 : s.price
function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback
  } catch {
    return fallback
  }
}
function Brand({
  light = false,
  onClick,
}: {
  light?: boolean
  onClick?: () => void
}) {
  return (
    <Button
      variant="ghost"
      className={`brand ${light ? "brand-light" : ""}`}
      onClick={onClick}
      aria-label="Unloop home"
    >
      <span className="brand-symbol">u</span>unloop
      <span className="brand-period">.</span>
    </Button>
  )
}
function ProviderIcon({
  sub,
  small = false,
}: {
  sub: Pick<Subscription, "mark" | "tone">
  small?: boolean
}) {
  return (
    <span
      className={`provider-icon ${sub.tone} ${small ? "provider-small" : ""}`}
      aria-hidden="true"
    >
      {sub.tone === "icloud" ? <Wallet size={19} /> : sub.mark}
    </span>
  )
}

function MiniDashboard() {
  return (
    <div className="mini-dashboard">
      <div className="mini-header">
        <span className="mini-logo">
          <span className="mini-logo-symbol">u</span> Your overview
        </span>
        <span className="mini-date">
          June 2026 <ChevronDown size={12} />
        </span>
      </div>
      <div className="mini-metrics">
        <div>
          <span className="mini-label">MONTHLY SPEND</span>
          <strong>
            $111.46<span>/mo</span>
          </strong>
          <span className="mini-change">
            <ArrowUpRight size={12} /> A little clarity goes a long way.
          </span>
        </div>
        <div className="mini-savings">
          <span className="mini-label">POTENTIAL SAVINGS</span>
          <strong>
            $59.99<span>/mo</span>
          </strong>
          <span>One less thing. More room to live.</span>
        </div>
      </div>
      <div className="mini-table-title">
        <strong>Your subscriptions</strong>
        <span>6 active</span>
      </div>
      {seed.slice(0, 3).map((s) => (
        <div className="mini-row" key={s.id}>
          <ProviderIcon sub={s} small />
          <div>
            <strong>{s.name}</strong>
            <span>{s.category}</span>
          </div>
          <strong>
            {money(s.price)}
            <small>/mo</small>
          </strong>
          <span className="mini-status">Active</span>
        </div>
      ))}
      <div className="mini-agent">
        <span className="agent-symbol">
          <Sparkles size={15} />
        </span>
        <div>
          <strong>A little less subscription. A little more you.</strong>
          <span>Your next smart move is one click away.</span>
        </div>
        <ArrowUpRight size={17} />
      </div>
    </div>
  )
}

function Landing({ navigate }: { navigate: (p: Page) => void }) {
  const [faq, setFaq] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const faqs = [
    [
      "Does Unloop really cancel subscriptions?",
      "This hackathon preview demonstrates the cancellation experience with sample subscriptions. Live provider integrations are not connected yet. The planned agent will execute cancellations only with your explicit permission.",
    ],
    [
      "Do you need my passwords?",
      "Not for this demo. Our intended approach lets you sign in directly with a provider and complete any verification yourself. Unloop should never ask you to hand over a password.",
    ],
    [
      "Can I try it without connecting an account?",
      "Absolutely. Open the demo to explore a complete sample dashboard, add subscriptions, and try the simulated cancellation workflow. No payment information needed.",
    ],
  ]
  return (
    <div className="landing">
      <header className="site-header">
        <Brand
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <nav className={mobileMenu ? "site-nav mobile-open" : "site-nav"}>
          <a href="#how-it-works" onClick={() => setMobileMenu(false)}>
            How it works
          </a>
          <a href="#features" onClick={() => setMobileMenu(false)}>
            Why Unloop
          </a>
          <a href="#questions" onClick={() => setMobileMenu(false)}>
            FAQs
          </a>
        </nav>
        <div className="nav-actions">
          <Button variant="ghost" onClick={() => navigate("login")}>
            Log in
          </Button>
          <Button onClick={() => navigate("signup")}>
            Get started <ArrowUpRight size={16} />
          </Button>
          <Button
            variant="ghost"
            className="mobile-menu-button"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={20} />
          </Button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-star">
                <Sparkles size={13} />
              </span>{" "}
              LESS AUTO-PAY. MORE AUTONOMY.
            </div>
            <h1>
              Your subscriptions.
              <br />
              Your money.
              <br />
              <span>Your call.</span>
              <span className="hero-asterisk" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p>
              Life adds up. Your subscriptions shouldn’t.
              <br className="desktop-break" /> See what you’re paying for, find
              what you don’t need,
              <br className="desktop-break" /> and let your AI assistant handle
              the goodbye.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate("signup")}>
                Take back control <ArrowUpRight size={18} />
              </Button>
              <Button variant="ghost" onClick={() => navigate("app")}>
                <span className="play-circle">
                  <Play size={12} fill="currentColor" />
                </span>{" "}
                Explore the demo
              </Button>
            </div>
            <div className="hero-assurance">
              <ShieldCheck size={15} /> No card. No commitment. Just clarity.
            </div>
          </div>
          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="floating-tag top-tag">
              <span className="tag-icon">
                <CircleCheck size={16} />
              </span>{" "}
              Less admin. More living.
            </div>
            <MiniDashboard />
            <div className="cancel-float">
              <span className="cancel-float-icon">
                <Check size={20} />
              </span>
              <div>
                <strong>Consider it unlooped.</strong>
                <span>Adobe subscription cancelled</span>
              </div>
              <span className="float-saving">
                +$59.99<span>/month back</span>
              </span>
            </div>
            <div className="visual-caption">
              <span className="caption-line" /> A calmer relationship with your
              money.
            </div>
          </div>
        </section>
        <section className="provider-strip">
          <span>
            ALL YOUR SUBSCRIPTIONS.
            <br />
            <strong>ONE CLEAR PICTURE.</strong>
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
          <span className="strip-more">and the rest.</span>
        </section>
        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A SMALL RESET. A BIG DIFFERENCE.</span>
              <h2>
                Out of the loop.
                <br />
                <span>In three simple steps.</span>
              </h2>
            </div>
            <p>
              Less digging through statements.
              <br />
              More knowing where you stand.
            </p>
          </div>
          <div className="steps">
            <article className="step">
              <div className="step-top">
                <span>01 / CONNECT</span>
                <Wallet size={22} />
              </div>
              <h3>Bring it all together.</h3>
              <p>
                Your subscriptions, renewal dates, and monthly costs. Finally,
                in one place.
              </p>
              <div className="step-visual connect-visual">
                {seed.slice(0, 4).map((s) => (
                  <ProviderIcon key={s.id} sub={s} />
                ))}
                <span className="connect-plus">
                  <Plus size={18} />
                </span>
              </div>
            </article>
            <article className="step">
              <div className="step-top">
                <span>02 / DISCOVER</span>
                <SlidersHorizontal size={22} />
              </div>
              <h3>Find your breathing room.</h3>
              <p>
                Spot what adds up. Get a clearer view of what’s worth
                keeping—and what isn’t.
              </p>
              <div className="step-visual discover-visual">
                <span>Potential yearly savings</span>
                <strong>
                  $719.88 <ArrowUpRight size={22} />
                </strong>
                <div className="discovery-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </article>
            <article className="step">
              <div className="step-top">
                <span>03 / UNLOOP</span>
                <Sparkles size={22} />
              </div>
              <h3>You decide. AI does.</h3>
              <p>
                Give the go-ahead. Your assistant handles the cancellation,
                keeping you in control.
              </p>
              <div className="step-visual unloop-visual">
                <span className="agent-symbol">
                  <Sparkles size={18} />
                </span>
                <div>
                  <strong>One less thing on your mind.</strong>
                  <span>Permission first. Always.</span>
                </div>
                <Check size={18} />
              </div>
            </article>
          </div>
          <div className="demo-disclosure">
            <CircleHelp size={14} /> Preview uses sample data. Provider
            connections and AI execution are planned integrations.
          </div>
        </section>
        <section className="statement-section" id="features">
          <div className="statement-art">
            <div className="big-loop">u</div>
            <span className="art-note">
              Make room for
              <br />
              <em>what matters.</em>
            </span>
            <span className="art-star">✳</span>
          </div>
          <div className="statement-copy">
            <span className="eyebrow">
              BUILT AROUND YOU. NOT YOUR AUTO-PAY.
            </span>
            <h2>
              You shouldn’t need
              <br />a spreadsheet.
              <br />
              <span>Or a whole afternoon.</span>
            </h2>
            <p>
              Managing your money should feel empowering, not exhausting. Unloop
              brings clarity to the recurring little things—so you can get back
              to the bigger ones.
            </p>
            <div className="benefit">
              <ShieldCheck size={19} />
              <div>
                <strong>Your permission is the point.</strong>
                <span>No surprise cancellations. You’re always in charge.</span>
              </div>
            </div>
            <div className="benefit">
              <Zap size={19} />
              <div>
                <strong>An assistant, not another chore.</strong>
                <span>
                  A thoughtful workflow from decision to confirmation.
                </span>
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate("app")}>
              Meet your dashboard <ArrowUpRight size={17} />
            </Button>
          </div>
        </section>
        <section className="faq-section" id="questions">
          <div>
            <span className="eyebrow">A LITTLE MORE CLARITY.</span>
            <h2>
              Good questions.
              <br />
              <span>Straight answers.</span>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a], i) => (
              <div
                className={`faq-item ${faq === i ? "faq-open" : ""}`}
                key={q}
              >
                <Button
                  variant="ghost"
                  onClick={() => setFaq(faq === i ? null : i)}
                  aria-expanded={faq === i}
                >
                  {q}
                  <Plus size={18} />
                </Button>
                {faq === i && <p>{a}</p>}
              </div>
            ))}
          </div>
        </section>
        <section className="closing-cta">
          <span className="eyebrow">LESS ON REPEAT. MORE ON PURPOSE.</span>
          <h2>Let’s make a little room.</h2>
          <p>Your next chapter doesn’t need another recurring charge.</p>
          <Button onClick={() => navigate("signup")}>
            Get started with Unloop <ArrowUpRight size={18} />
          </Button>
          <span className="cta-note">
            Free to explore. Built for your peace of mind.
          </span>
          <span className="closing-star" aria-hidden="true">
            ✳
          </span>
        </section>
      </main>
      <footer className="site-footer">
        <Brand
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <span>A little less on repeat.</span>
        <span>© {new Date().getFullYear()} Unloop · Hackathon preview</span>
        <a href="#questions">
          Questions? Start here <ArrowUpRight size={14} />
        </a>
      </footer>
    </div>
  )
}

function Auth({
  mode,
  navigate,
  onLogin,
}: {
  mode: "login" | "signup"
  navigate: (p: Page) => void
  onLogin: (name: string) => void
}) {
  const [error, setError] = useState("")
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const password = String(data.get("password"))
    if (password.length < 6) {
      setError("Use at least 6 characters for your demo password.")
      return
    }
    onLogin(String(data.get("name") || String(data.get("email")).split("@")[0]))
  }
  return (
    <div className="auth-page">
      <div className="auth-story">
        <Brand onClick={() => navigate("landing")} />
        <div>
          <span className="eyebrow">YOUR MONEY. WITH A LITTLE MORE ROOM.</span>
          <h1>
            Less on repeat.
            <br />
            <span>More on purpose.</span>
          </h1>
          <p>
            A clear picture of your subscriptions.
            <br />
            And a little help letting go.
          </p>
          <MiniDashboard />
        </div>
        <span className="auth-bottom">
          <ShieldCheck size={16} /> Your permission comes first. Always.
        </span>
      </div>
      <div className="auth-form-side">
        <Button
          variant="ghost"
          className="back-home"
          onClick={() => navigate("landing")}
        >
          ← Back to home
        </Button>
        <div className="auth-form-wrap">
          <span className="eyebrow">LET’S GET YOU UNLOOPED.</span>
          <h2>{mode === "signup" ? "Make a little room." : "Welcome back."}</h2>
          <p>
            {mode === "signup"
              ? "A calmer relationship with your subscriptions starts here."
              : "Your subscriptions. Right where you left them."}
          </p>
          <div className="demo-banner">
            <Sparkles size={17} />
            <span>Demo mode · No real account or password is stored.</span>
          </div>
          <form onSubmit={submit}>
            {mode === "signup" && (
              <label>
                Your name
                <Input
                  name="name"
                  placeholder="Alex Morgan"
                  required
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email address
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <Input
                name="password"
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                required
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button type="submit" className="full-width">
              {mode === "signup"
                ? "Create demo account"
                : "Enter your dashboard"}
              <ArrowUpRight size={17} />
            </Button>
          </form>
          <div className="auth-switch">
            {mode === "signup"
              ? "Already have an account?"
              : "New around here?"}
            <Button
              variant="ghost"
              onClick={() => navigate(mode === "signup" ? "login" : "signup")}
            >
              {mode === "signup" ? "Log in" : "Sign up"}
            </Button>
          </div>
          <div className="auth-divider">
            <span />
            or just take a look
            <span />
          </div>
          <Button
            variant="secondary"
            className="full-width"
            onClick={() => onLogin("Alex")}
          >
            Explore with sample data <ArrowRight size={16} />
          </Button>
          <p className="auth-disclaimer">
            This is a hackathon prototype, not a live financial service. Never
            enter a password you use elsewhere.
          </p>
        </div>
      </div>
    </div>
  )
}

function Dashboard({
  name,
  subscriptions,
  setSubscriptions,
  logout,
}: {
  name: string
  subscriptions: Subscription[]
  setSubscriptions: (s: Subscription[]) => void
  logout: () => void
}) {
  const [section, setSection] = useState("Overview")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All categories")
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [selected, setSelected] = useState<Subscription | null>(null)
  const [stage, setStage] = useState(-1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState("")
  const [settings, setSettings] = useState(false)
  const [renewalsOpen, setRenewalsOpen] = useState(false)
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
  const agentSteps = [
    "Reading the sample account",
    "Finding cancellation settings",
    "Declining the retention offer",
    "Confirming cancellation",
  ]
  useEffect(() => {
    if (stage < 0 || stage >= 4 || !selected) return
    const timer = window.setTimeout(() => {
      if (stage === 3)
        setSubscriptions(
          subscriptions.map((s) =>
            s.id === selected.id ? { ...s, status: "Cancelled" } : s,
          ),
        )
      setStage(stage + 1)
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [stage, selected, subscriptions, setSubscriptions])
  useEffect(() => {
    if (!notice) return
    const id = window.setTimeout(() => setNotice(""), 4000)
    return () => window.clearTimeout(id)
  }, [notice])
  function saveSubscription(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const sub: Subscription = {
      id: editing?.id || crypto.randomUUID(),
      name: String(f.get("name")),
      category: String(f.get("category")),
      price: Number(f.get("price")),
      cycle: f.get("cycle") as Subscription["cycle"],
      renewal: String(f.get("renewal")),
      status: editing?.status || "Active",
      mark: String(f.get("name")).charAt(0).toUpperCase(),
      tone: editing?.tone || "custom",
    }
    setSubscriptions(
      editing
        ? subscriptions.map((s) => (s.id === editing.id ? sub : s))
        : [...subscriptions, sub],
    )
    setAddOpen(false)
    setEditing(null)
    setNotice(
      editing
        ? "Subscription updated."
        : "Subscription added. A little more clarity.",
    )
  }
  function openCancel(sub: Subscription) {
    setSelected(sub)
    setStage(-1)
  }
  return (
    <div className="dashboard">
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Brand
          onClick={() => {
            setSection("Overview")
            setSidebarOpen(false)
          }}
        />
        <div className="workspace">
          <span className="workspace-avatar">
            {name.charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>Personal workspace</strong>
            <span>Your money, your space</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <span className="nav-label">YOUR SPACE</span>
        <nav className="dashboard-nav">
          {[
            { label: "Overview", icon: LayoutDashboard },
            { label: "Subscriptions", icon: CreditCard },
            { label: "Cancellation history", icon: CirclePause },
          ].map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant="ghost"
              className={section === label ? "selected" : ""}
              onClick={() => {
                setSection(label)
                setSidebarOpen(false)
                setSearch("")
                setCategory("All categories")
              }}
            >
              <Icon size={18} />
              {label}
              {label === "Subscriptions" && (
                <span className="nav-count">{active.length}</span>
              )}
            </Button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="agent-symbol">
            <Sparkles size={20} />
          </span>
          <strong>A little less on repeat.</strong>
          <p>Your assistant is ready when you are.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setSection("Overview")
              setNotice(
                "Choose an active subscription and select Cancel to try the demo assistant.",
              )
              setSidebarOpen(false)
            }}
          >
            Meet your assistant <ArrowUpRight size={15} />
          </Button>
        </div>
        <div className="sidebar-bottom">
          <Button variant="ghost" onClick={() => setSettings(true)}>
            <SlidersHorizontal size={18} />
            Preferences
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              setNotice(
                "This preview uses sample data. Add a subscription, edit its details, or try a simulated cancellation.",
              )
            }
          >
            <CircleHelp size={18} />
            Help & getting started
          </Button>
          <div className="sidebar-profile">
            <span className="profile-avatar">
              {name.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{name}</strong>
              <span>Demo account</span>
            </div>
            <Button variant="ghost" aria-label="Log out" onClick={logout}>
              <LogOut size={17} />
            </Button>
          </div>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <Button
              className="mobile-menu-button"
              variant="ghost"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <span>Your workspace</span>
            <ChevronRight size={14} />
            <strong>{section}</strong>
          </div>
          <div>
            <span className="demo-pill">
              <span /> Demo workspace
            </span>
            <Button
              variant="ghost"
              aria-label="Upcoming renewals"
              onClick={() => setRenewalsOpen(true)}
            >
              <Bell size={19} />
            </Button>
            <span className="profile-avatar">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="dashboard-content">
          <div className="dashboard-title">
            <div>
              <span className="eyebrow">A LITTLE CLARITY GOES A LONG WAY.</span>
              <h1>
                {section === "Overview"
                  ? `Good to see you, ${name.split(" ")[0]}.`
                  : section === "Subscriptions"
                    ? "Everything on repeat."
                    : "Your fresh starts."}
              </h1>
              <p>
                {section === "Overview"
                  ? "Here’s where your subscriptions stand. You’re in control."
                  : section === "Subscriptions"
                    ? "All your subscriptions. One clear picture."
                    : "A record of the subscriptions you’ve let go."}
              </p>
            </div>
            <Button
              onClick={() => {
                setEditing(null)
                setAddOpen(true)
              }}
            >
              <Plus size={17} />
              Add subscription
            </Button>
          </div>
          {section === "Overview" && (
            <>
              <div className="stat-grid">
                <article className="stat-card">
                  <div>
                    <span>Monthly spending</span>
                    <Wallet size={18} />
                  </div>
                  <strong>
                    {money(spend)}
                    <small>/mo</small>
                  </strong>
                  <span className="stat-note">
                    That’s {money(spend * 12)} over a year
                  </span>
                  <div className="stat-mini-bars">
                    {[35, 48, 38, 63, 52, 72, 63, 88, 78, 90, 72, 62].map(
                      (height, i) => (
                        <i key={i} style={{ height: `${height}%` }} />
                      ),
                    )}
                  </div>
                </article>
                <article className="stat-card">
                  <div>
                    <span>Active subscriptions</span>
                    <CreditCard size={18} />
                  </div>
                  <strong>
                    {active.length.toString().padStart(2, "0")}
                    <small>subscriptions</small>
                  </strong>
                  <div className="stat-provider-icons">
                    {active.slice(0, 5).map((s) => (
                      <ProviderIcon key={s.id} sub={s} small />
                    ))}
                    {active.length > 5 && <span>+{active.length - 5}</span>}
                  </div>
                  <span className="stat-note">
                    All in one place. Nothing under the radar.
                  </span>
                </article>
                <article className="stat-card savings-card">
                  <div>
                    <span>Money reclaimed</span>
                    <Sparkles size={18} />
                  </div>
                  <strong>
                    {money(savings)}
                    <small>/mo</small>
                  </strong>
                  <span className="stat-note">
                    {cancelled.length
                      ? `${money(savings * 12)} in projected annual savings`
                      : "Your next smart move is one click away"}
                  </span>
                  <span className="savings-decoration">↗</span>
                </article>
              </div>
              <div className="insight-banner">
                <span className="agent-symbol">
                  <Sparkles size={22} />
                </span>
                <div>
                  <strong>A subscription worth a second look.</strong>
                  <p>
                    {active.length
                      ? `${[...active].sort((a, b) => monthly(b) - monthly(a))[0].name} is your largest recurring cost. Still earning its place?`
                      : "You’ve cleared the loop. Add a subscription whenever you need."}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={!active.length}
                  onClick={() =>
                    openCancel(
                      [...active].sort((a, b) => monthly(b) - monthly(a))[0],
                    )
                  }
                >
                  Review subscription <ArrowUpRight size={16} />
                </Button>
              </div>
            </>
          )}
          <section className="subscriptions-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  {section === "Cancellation history"
                    ? "Unlooped subscriptions"
                    : "Your subscriptions"}
                  <span>
                    {section === "Cancellation history"
                      ? cancelled.length
                      : active.length}
                  </span>
                </h2>
                <p>
                  {section === "Cancellation history"
                    ? "A little more room in your budget."
                    : "Keep what you love. Let go of what you don’t."}
                </p>
              </div>
              <div className="table-controls">
                <label className="search-input">
                  <Search size={16} />
                  <Input
                    placeholder="Search subscriptions"
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
                    <th>
                      {section === "Cancellation history"
                        ? "Last renewal date"
                        : "Next renewal"}
                    </th>
                    <th>Status</th>
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
                            <span>{s.cycle} plan</span>
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
                      <td>
                        {new Date(`${s.renewal}T12:00:00`).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            s.status === "Cancelled" ? "cancelled" : ""
                          }`}
                        >
                          <span />
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {s.status === "Active" ? (
                            <>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setEditing(s)
                                  setAddOpen(true)
                                }}
                                aria-label={`Edit ${s.name}`}
                              >
                                <SlidersHorizontal size={15} />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => openCancel(s)}
                              >
                                Cancel <ArrowUpRight size={14} />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setSubscriptions(
                                  subscriptions.map((item) =>
                                    item.id === s.id
                                      ? { ...item, status: "Active" }
                                      : item,
                                  ),
                                )
                                setNotice(
                                  "Restored in your demo workspace. No provider action was taken.",
                                )
                              }}
                            >
                              <RotateCcw size={14} />
                              Restore demo
                            </Button>
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
                  {section === "Cancellation history"
                    ? "No cancellations here yet."
                    : "Nothing in this loop."}
                </h3>
                <p>
                  {search || category !== "All categories"
                    ? "Try another search or category."
                    : "Add a subscription or explore the demo cancellation flow."}
                </p>
              </div>
            )}
            <div className="table-footer">
              <span>
                {visible.length} subscription{visible.length !== 1 ? "s" : ""} ·
                USD
              </span>
              <span>
                <ShieldCheck size={13} /> Your permission. Always.
              </span>
            </div>
          </section>
          <div className="dashboard-lower">
            <section className="renewal-card">
              <div className="lower-card-heading">
                <h3>Coming up next</h3>
                <CalendarDays size={18} />
              </div>
              {sortedRenewals.slice(0, 3).map((s) => (
                <div className="renewal-row" key={s.id}>
                  <span className="renewal-date">
                    <strong>
                      {new Date(`${s.renewal}T12:00:00`).getDate()}
                    </strong>
                    {new Date(`${s.renewal}T12:00:00`).toLocaleDateString(
                      "en-US",
                      { month: "short" },
                    )}
                  </span>
                  <ProviderIcon sub={s} small />
                  <div>
                    <strong>{s.name}</strong>
                    <span>Sample renewal</span>
                  </div>
                  <strong>{money(s.price)}</strong>
                </div>
              ))}
              {!active.length && <p>No upcoming sample renewals.</p>}
            </section>
            <section className="control-card">
              <ShieldCheck size={25} />
              <span className="eyebrow">YOU’RE ALWAYS IN CHARGE.</span>
              <h3>
                Permission first.
                <br />
                Peace of mind, always.
              </h3>
              <p>
                No real accounts are connected. This workspace uses sample data,
                and cancellation is simulated.
              </p>
              <Button
                variant="ghost"
                onClick={() =>
                  setNotice(
                    "AI integration is not connected yet. Cancellation steps are simulated locally and never interact with real providers.",
                  )
                }
              >
                How this demo works <ArrowUpRight size={15} />
              </Button>
            </section>
          </div>
          <footer className="dashboard-footer">
            <span>Less on repeat. More on purpose.</span>
            <span>Unloop · Hackathon preview</span>
          </footer>
        </main>
      </div>
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) setEditing(null)
        }}
        title={editing ? "A little fine-tuning." : "Bring it into the loop."}
        description={
          editing
            ? "Update the details of your sample subscription."
            : "Add a subscription to your personal overview."
        }
      >
        <form
          className="subscription-form"
          onSubmit={saveSubscription}
          key={editing?.id || "new"}
        >
          <label>
            Subscription name
            <Input
              name="name"
              defaultValue={editing?.name}
              placeholder="e.g. Spotify"
              required
              maxLength={60}
            />
          </label>
          <div className="form-row">
            <label>
              Amount (USD)
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                max="100000"
                defaultValue={editing?.price}
                placeholder="10.99"
                required
              />
            </label>
            <label>
              Billing cycle
              <select name="cycle" defaultValue={editing?.cycle || "Monthly"}>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </label>
          </div>
          <label>
            Category
            <select
              name="category"
              defaultValue={editing?.category || "Entertainment"}
            >
              {["Entertainment", "Productivity", "Storage", "Other"].map(
                (c) => (
                  <option key={c}>{c}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Next renewal
            <Input
              name="renewal"
              type="date"
              defaultValue={
                editing?.renewal || new Date().toISOString().slice(0, 10)
              }
              required
            />
          </label>
          <Button className="full-width" type="submit">
            {editing ? "Save changes" : "Add subscription"}
            <Plus size={16} />
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null)
            setStage(-1)
          }
        }}
        title={
          stage === 4
            ? "Consider it unlooped."
            : stage >= 0
              ? "Making a little room."
              : "Ready to let it go?"
        }
        description="Simulated cancellation · No live provider or AI model is connected."
      >
        {selected && (
          <div className="cancel-dialog">
            <div className="cancel-sub">
              <ProviderIcon sub={selected} />
              <div>
                <strong>{selected.name}</strong>
                <span>
                  {money(selected.price)} /{" "}
                  {selected.cycle === "Monthly" ? "month" : "year"}
                </span>
              </div>
              <span className="category-tag">{selected.category}</span>
            </div>
            {stage === -1 ? (
              <>
                <div className="cancel-savings">
                  <span>Your projected annual savings</span>
                  <strong>{money(monthly(selected) * 12)}</strong>
                </div>
                <p>
                  You decide. The demo assistant shows the cancellation steps
                  and updates your sample subscription. Nothing changes with a
                  real provider.
                </p>
                <div className="permission-note">
                  <ShieldCheck size={18} />
                  By continuing, you authorize this simulated cancellation.
                </div>
                <Button className="full-width" onClick={() => setStage(0)}>
                  <Sparkles size={17} />
                  Approve demo cancellation
                </Button>
                <Button
                  variant="ghost"
                  className="full-width"
                  onClick={() => setSelected(null)}
                >
                  Keep this subscription
                </Button>
              </>
            ) : (
              <>
                <div className="agent-timeline">
                  {agentSteps.map((step, i) => (
                    <div
                      key={step}
                      className={
                        stage > i ? "complete" : stage === i ? "running" : ""
                      }
                    >
                      <span>
                        {stage > i ? (
                          <Check size={16} />
                        ) : stage === i ? (
                          <LoaderCircle className="spinning" size={16} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <div>
                        <strong>{step}</strong>
                        <small>
                          {stage > i
                            ? "Demo step complete"
                            : stage === i
                              ? "Simulating this step…"
                              : "Waiting"}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
                {stage === 4 && (
                  <>
                    <div className="success-note">
                      <CircleCheck size={20} />
                      <span>
                        Sample subscription marked cancelled.
                        <br />
                        <strong>
                          {money(monthly(selected))}/month in projected savings.
                        </strong>
                      </span>
                    </div>
                    <Button
                      className="full-width"
                      onClick={() => {
                        setSelected(null)
                        setStage(-1)
                        setSection("Cancellation history")
                      }}
                    >
                      View cancellation history <ArrowRight size={16} />
                    </Button>
                  </>
                )}
                {stage < 4 && (
                  <p className="simulation-note">
                    Closing this window stops the simulation.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </Dialog>
      <Dialog
        open={settings}
        onOpenChange={setSettings}
        title="Your workspace, your way."
        description="This demo stores sample subscriptions only in this browser."
      >
        <div className="settings-content">
          <div>
            <strong>Display currency</strong>
            <span>USD · Demo transactions are not converted.</span>
          </div>
          <div>
            <strong>Local data</strong>
            <span>
              No banking credentials, passwords, or real accounts are stored.
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSubscriptions(seed)
              setSettings(false)
              setNotice("Workspace reset to the original sample subscriptions.")
            }}
          >
            <RotateCcw size={16} />
            Reset sample data
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={renewalsOpen}
        onOpenChange={setRenewalsOpen}
        title="A heads-up, not a surprise."
        description="Upcoming renewal dates from your sample subscriptions."
      >
        <div className="renewal-dialog">
          {sortedRenewals.map((s) => (
            <div className="renewal-row" key={s.id}>
              <ProviderIcon sub={s} small />
              <div>
                <strong>{s.name}</strong>
                <span>
                  {new Date(`${s.renewal}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </span>
              </div>
              <strong>{money(s.price)}</strong>
            </div>
          ))}
          {!active.length && <p>No upcoming renewals.</p>}
        </div>
      </Dialog>
      {notice && (
        <div className="toast" role="status">
          <CircleCheck size={18} />
          <span>{notice}</span>
          <Button
            variant="ghost"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const initialPage = (): Page => {
    const p = window.location.hash.slice(1)
    return ["login", "signup", "app"].includes(p) ? p as Page : "landing"
  }
  const [page, setPage] = useState<Page>(initialPage)
  const [name, setName] = useState(() => readStored("unloop-name", "Alex"))
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    readStored("unloop-subscriptions", seed),
  )
  useEffect(() => {
    const listener = () => setPage(initialPage())
    window.addEventListener("hashchange", listener)
    return () => window.removeEventListener("hashchange", listener)
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(
        "unloop-subscriptions",
        JSON.stringify(subscriptions),
      )
    } catch {
      /* Demo remains usable when storage is unavailable. */
    }
  }, [subscriptions])
  function navigate(p: Page) {
    window.location.hash = p === "landing" ? "" : p
    setPage(p)
    window.scrollTo(0, 0)
  }
  function login(n: string) {
    setName(n)
    try {
      localStorage.setItem("unloop-name", JSON.stringify(n))
    } catch {
      /* Session remains in memory. */
    }
    navigate("app")
  }
  if (page === "app")
    return (
      <Dashboard
        name={name}
        subscriptions={subscriptions}
        setSubscriptions={setSubscriptions}
        logout={() => navigate("landing")}
      />
    )
  if (page === "login" || page === "signup")
    return <Auth mode={page} navigate={navigate} onLogin={login} />
  return <Landing navigate={navigate} />
}
