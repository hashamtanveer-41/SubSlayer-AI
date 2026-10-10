export const landingFaqs: [string, string][] = [
  [
    "How does SubSlayer AI cancel subscriptions for me?",
    "In this demo, SubSlayer sends a confirmed request to a simulated Netflix, Spotify, Canva, or Adobe API and shows its returned status and receipt. It does not change a real platform account.",
  ],
  [
    "What is the Stripe test payment shield?",
    "The demo lets you lock a local payment policy before a test charge. Unlocked charges use Stripe test mode and decrease a separate customer demo wallet. No real virtual card or bank account is involved.",
  ],
  [
    "Do you store or ask for my real bank passwords?",
    "No. This demo uses simulated provider accounts, a local wallet, and Stripe test mode. Every cancellation request requires your confirmation.",
  ],
  [
    "Can I try this demo right now without connecting an account?",
    "Yes. Start the backend and four demo provider services, then explore provider cancellation, Qwen analysis, and Stripe test charges from the dashboard.",
  ],
]
