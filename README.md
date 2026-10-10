# SubSlayer AI 🗡️💳

> **Autonomous AI-Driven Subscription Assassin & Financial Burner Shield**  
> Built for the Hackathon by a 5-member powerhouse team.

---

## ⚡ Quick Navigation

- 📄 **[Master PRD & Team Playbook](file:///c:/Users/DELL/OneDrive/Desktop/SubSlayer-AI/product_requirements_document.md)** — **(Must Read)** Contains the full system architecture, API contracts, research data, 5-minute pitch script, and copy-paste AI prompts for each sub-team.
- 🎨 **[Figma Design Workspace](file:///c:/Users/DELL/OneDrive/Desktop/SubSlayer-AI/Figma%20Design)** — React 19 + Vite + Tailwind CSS frontend application exported from Figma.

---

## 👥 Team Roster & Ownership

| Member | Primary Focus | Key Responsibilities |
| :--- | :--- | :--- |
| **Hamza & Sarim** | **Frontend & UI/UX** | Modern dashboard in `Figma Design/`, live agent execution terminal, split-screen cancellation view, and Privacy.com virtual cards UI. |
| **Hasham & Asfand** | **Backend & AI Agent** | Python (FastAPI), bank statement CSV ingestion, autonomous browser cancellation agent (`browser-use` / Playwright), real-time SSE event streaming, and virtual card simulator. |
| **Talal** | **Pitch & Research** | Problem research (FTC Click-to-Cancel, $219/mo zombie subscription metrics), 5-minute presentation script, stage choreography, and pre-recorded demo video backup. |

---

## 🎯 Core Features

1. **Autonomous Subscription Cancellation Agent (P0 - MVP):**
   - Ingests bank feed / CSV statements to identify recurring "vampire" subscriptions.
   - Deploys a headless browser AI agent using pre-authenticated cookies to navigate to the provider's billing portal.
   - Detects and outsmarts retention "dark patterns" (discount bribes, guilt-trip modals).
   - Confirms cancellation and captures DOM screenshot proof.

2. **Privacy.com-Style Virtual Cards / Financial Shield (P1 - High Priority):**
   - On-demand burner virtual card generation for new subscriptions.
   - **$0 Balance / Zero-Out Shield:** Instantly locks card balance to $0.00 so any surprise billing attempts bounce with 0 impact on the user's primary bank account.
   - Interactive charge simulator to demonstrate blocked merchant charges in real time.

---

## 🚀 Getting Started

### Frontend Development
```bash
cd "Figma Design"
pnpm install # or npm install
pnpm dev     # or npm run dev
```

### Backend Development (FastAPI)
```bash
# Refer to the Master PRD for complete requirements.txt and backend setup
uvicorn main:app --reload --port 8000
```