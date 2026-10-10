import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from app.api.routes import subscriptions, agent, cards, statement, demo
from app import demo_hub

app = FastAPI(
    title="SubSlayer AI API Gateway",
    description="Backend API Gateway and Provider Demo Orchestrator for SubSlayer AI",
    version="1.0.0"
)

# Configure CORS for frontend Vite dev servers; never combine credentials with a wildcard origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8443,"
        "http://127.0.0.1:8443,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(subscriptions.router)
app.include_router(agent.router)
app.include_router(cards.router)
app.include_router(statement.router)
app.include_router(demo.router)
# The provider devices call this authenticated hub for all Stripe-backed charges.
app.mount("/demo", demo_hub.app)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SubSlayer AI API",
        "version": "1.0.0",
        "stripeMode": "test" if os.getenv("STRIPE_SECRET_KEY", "").startswith("sk_test_") else "disabled"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
