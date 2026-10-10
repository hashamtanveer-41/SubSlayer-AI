import os
import json
import sqlite3
import threading
from contextlib import contextmanager
from datetime import date, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from app.domain.models import (
    Subscription,
    SubscriptionCycle,
    SubscriptionStatus,
    CancellationTask,
    AgentStepEvent,
    AgentCompletedEvent,
)
from app.demo_common import PROVIDERS


def _resolve_db_path(db_path: Optional[str] = None) -> str:
    path = db_path or os.getenv("SUBSLAYER_DB_PATH", os.getenv("DB_PATH", "subslayer.sqlite3"))
    if path == ":memory:":
        return path
    p = Path(path)
    if not p.is_absolute():
        backend_dir = Path(__file__).resolve().parent.parent.parent
        p = backend_dir / p
    return str(p)


def _row_to_subscription(row: sqlite3.Row) -> Subscription:
    return Subscription(
        id=row["id"],
        name=row["name"],
        category=row["category"],
        price=float(row["price"]),
        cycle=SubscriptionCycle(row["cycle"]),
        renewal=row["renewal"],
        status=SubscriptionStatus(row["status"]),
        vampireScore=int(row["vampire_score"]),
        provider=row["provider"],
        providerSubscriptionId=row["provider_subscription_id"],
        latestCancellationTaskId=row["latest_cancellation_task_id"],
        providerRequestId=row["provider_request_id"],
        cancellationEffectiveDate=row["cancellation_effective_date"],
        mark=row["mark"],
        tone=row["tone"],
        projectedAnnualSavings=float(row["projected_annual_savings"]) if row["projected_annual_savings"] is not None else None,
    )


def _row_to_task(row: sqlite3.Row) -> CancellationTask:
    steps_data = json.loads(row["steps_json"]) if row["steps_json"] else []
    steps = [AgentStepEvent(**s) for s in steps_data]
    result = AgentCompletedEvent(**json.loads(row["result_json"])) if row["result_json"] else None
    return CancellationTask(
        taskId=row["task_id"],
        subscriptionId=row["subscription_id"],
        provider=row["provider"],
        idempotencyKey=row["idempotency_key"],
        status=row["status"],
        steps=steps,
        result=result,
        errorMessage=row["error_message"],
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


class SubscriptionRepository:
    """
    SQLite-backed thread-safe repository for subscriptions and cancellation tasks.
    Persists data to SQLite (subslayer.sqlite3) so user edits, statement imports,
    and agent cancellation states survive application restarts.
    """

    def __init__(self, db_path: Optional[str] = None):
        self._lock = threading.Lock()
        self.db_path = _resolve_db_path(db_path)
        self._is_memory = (self.db_path == ":memory:")
        if self._is_memory:
            self._mem_conn = sqlite3.connect(":memory:", check_same_thread=False)
            self._mem_conn.row_factory = sqlite3.Row
        self._init_db()
        self._seed_default_data_if_empty()

    @contextmanager
    def _connection(self):
        with self._lock:
            if self._is_memory:
                yield self._mem_conn
                self._mem_conn.commit()
            else:
                conn = sqlite3.connect(self.db_path, timeout=15)
                conn.row_factory = sqlite3.Row
                try:
                    yield conn
                    conn.commit()
                finally:
                    conn.close()

    def _init_db(self):
        with self._connection() as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    cycle TEXT NOT NULL,
                    renewal TEXT NOT NULL,
                    status TEXT NOT NULL,
                    vampire_score INTEGER NOT NULL DEFAULT 50,
                    provider TEXT NOT NULL DEFAULT 'generic',
                    provider_subscription_id TEXT,
                    latest_cancellation_task_id TEXT,
                    provider_request_id TEXT,
                    cancellation_effective_date TEXT,
                    mark TEXT,
                    tone TEXT,
                    projected_annual_savings REAL
                );
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cancellation_tasks (
                    task_id TEXT PRIMARY KEY,
                    subscription_id TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    idempotency_key TEXT NOT NULL,
                    status TEXT NOT NULL,
                    steps_json TEXT NOT NULL DEFAULT '[]',
                    result_json TEXT,
                    error_message TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_idempotency ON cancellation_tasks(idempotency_key);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_subs_provider ON subscriptions(provider, provider_subscription_id);")

    def _seed_default_data_if_empty(self):
        with self._connection() as conn:
            count = conn.execute("SELECT COUNT(*) FROM subscriptions").fetchone()[0]
            if count > 0:
                return

            def renewal_in(days: int) -> str:
                return (date.today() + timedelta(days=days)).isoformat()

            seeds = [
                Subscription(
                    id="sub_01",
                    name="Adobe Creative Cloud",
                    category="Productivity",
                    price=59.99,
                    cycle=SubscriptionCycle.MONTHLY,
                    renewal=renewal_in(3),
                    status=SubscriptionStatus.ACTIVE,
                    vampireScore=88,
                    provider="adobe",
                    providerSubscriptionId=PROVIDERS["adobe"]["subscription_id"],
                    mark="A",
                    tone="adobe",
                ),
                Subscription(
                    id="sub_02",
                    name="Canva Pro",
                    category="Productivity",
                    price=14.99,
                    cycle=SubscriptionCycle.MONTHLY,
                    renewal=renewal_in(7),
                    status=SubscriptionStatus.ACTIVE,
                    vampireScore=72,
                    provider="canva",
                    providerSubscriptionId=PROVIDERS["canva"]["subscription_id"],
                    mark="C",
                    tone="canva",
                ),
                Subscription(
                    id="sub_03",
                    name="Netflix",
                    category="Entertainment",
                    price=15.49,
                    cycle=SubscriptionCycle.MONTHLY,
                    renewal=renewal_in(10),
                    status=SubscriptionStatus.ACTIVE,
                    vampireScore=65,
                    provider="netflix",
                    providerSubscriptionId=PROVIDERS["netflix"]["subscription_id"],
                    mark="N",
                    tone="netflix",
                ),
                Subscription(
                    id="sub_04",
                    name="Spotify",
                    category="Entertainment",
                    price=10.99,
                    cycle=SubscriptionCycle.MONTHLY,
                    renewal=renewal_in(15),
                    status=SubscriptionStatus.ACTIVE,
                    vampireScore=55,
                    provider="spotify",
                    providerSubscriptionId=PROVIDERS["spotify"]["subscription_id"],
                    mark="S",
                    tone="spotify",
                ),
                Subscription(
                    id="sub_05",
                    name="Notion",
                    category="Productivity",
                    price=10.00,
                    cycle=SubscriptionCycle.MONTHLY,
                    renewal=renewal_in(20),
                    status=SubscriptionStatus.ACTIVE,
                    vampireScore=40,
                    provider="generic",
                    providerSubscriptionId="demo_generic_sub_05",
                    mark="N",
                    tone="notion",
                ),
                Subscription(
                    id="sub_06",
                    name="iCloud+",
                    category="Storage",
                    price=2.99,
                    cycle=SubscriptionCycle.MONTHLY,
                    renewal=renewal_in(25),
                    status=SubscriptionStatus.ACTIVE,
                    vampireScore=25,
                    provider="generic",
                    providerSubscriptionId="demo_generic_sub_06",
                    mark="C",
                    tone="icloud",
                ),
            ]
            for s in seeds:
                conn.execute("""
                    INSERT OR REPLACE INTO subscriptions (
                        id, name, category, price, cycle, renewal, status,
                        vampire_score, provider, provider_subscription_id,
                        latest_cancellation_task_id, provider_request_id,
                        cancellation_effective_date, mark, tone, projected_annual_savings
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s.id, s.name, s.category, s.price,
                    s.cycle.value if hasattr(s.cycle, "value") else str(s.cycle),
                    s.renewal,
                    s.status.value if hasattr(s.status, "value") else str(s.status),
                    s.vampireScore, s.provider, s.providerSubscriptionId,
                    s.latestCancellationTaskId, s.providerRequestId,
                    s.cancellationEffectiveDate, s.mark, s.tone, s.projectedAnnualSavings,
                ))

    def reset(self):
        """Clears all records and reseeds default data (used in tests or manual reset)."""
        with self._connection() as conn:
            conn.execute("DELETE FROM subscriptions")
            conn.execute("DELETE FROM cancellation_tasks")
        self._seed_default_data_if_empty()

    def get_all(self) -> List[Subscription]:
        with self._connection() as conn:
            rows = conn.execute("SELECT * FROM subscriptions").fetchall()
            return [_row_to_subscription(r) for r in rows]

    def get_by_id(self, sub_id: str) -> Optional[Subscription]:
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM subscriptions WHERE id = ?", (sub_id,)).fetchone()
            return _row_to_subscription(row) if row else None

    def get_by_provider_subscription_id(self, provider: str, provider_id: str) -> Optional[Subscription]:
        with self._connection() as conn:
            row = conn.execute(
                "SELECT * FROM subscriptions WHERE provider = ? AND provider_subscription_id = ?",
                (provider, provider_id),
            ).fetchone()
            return _row_to_subscription(row) if row else None

    def add(self, sub: Subscription) -> Subscription:
        with self._connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO subscriptions (
                    id, name, category, price, cycle, renewal, status,
                    vampire_score, provider, provider_subscription_id,
                    latest_cancellation_task_id, provider_request_id,
                    cancellation_effective_date, mark, tone, projected_annual_savings
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sub.id, sub.name, sub.category, sub.price,
                sub.cycle.value if hasattr(sub.cycle, "value") else str(sub.cycle),
                sub.renewal,
                sub.status.value if hasattr(sub.status, "value") else str(sub.status),
                sub.vampireScore, sub.provider, sub.providerSubscriptionId,
                sub.latestCancellationTaskId, sub.providerRequestId,
                sub.cancellationEffectiveDate, sub.mark, sub.tone, sub.projectedAnnualSavings,
            ))
            return sub

    def update(self, sub: Subscription) -> Optional[Subscription]:
        with self._connection() as conn:
            cur = conn.execute("""
                UPDATE subscriptions SET
                    name = ?, category = ?, price = ?, cycle = ?, renewal = ?,
                    status = ?, vampire_score = ?, provider = ?, provider_subscription_id = ?,
                    latest_cancellation_task_id = ?, provider_request_id = ?,
                    cancellation_effective_date = ?, mark = ?, tone = ?, projected_annual_savings = ?
                WHERE id = ?
            """, (
                sub.name, sub.category, sub.price,
                sub.cycle.value if hasattr(sub.cycle, "value") else str(sub.cycle),
                sub.renewal,
                sub.status.value if hasattr(sub.status, "value") else str(sub.status),
                sub.vampireScore, sub.provider, sub.providerSubscriptionId,
                sub.latestCancellationTaskId, sub.providerRequestId,
                sub.cancellationEffectiveDate, sub.mark, sub.tone, sub.projectedAnnualSavings,
                sub.id,
            ))
            if cur.rowcount == 0:
                return None
            return sub

    def save_task(self, task: CancellationTask) -> None:
        steps_json = json.dumps([s.model_dump() for s in task.steps])
        result_json = json.dumps(task.result.model_dump()) if task.result else None
        with self._connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO cancellation_tasks (
                    task_id, subscription_id, provider, idempotency_key, status,
                    steps_json, result_json, error_message, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task.taskId, task.subscriptionId, task.provider, task.idempotencyKey,
                task.status, steps_json, result_json, task.errorMessage,
                task.createdAt, task.updatedAt,
            ))

    def get_task(self, task_id: str) -> Optional[CancellationTask]:
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM cancellation_tasks WHERE task_id = ?", (task_id,)).fetchone()
            return _row_to_task(row) if row else None

    def get_task_by_idempotency_key(self, key: str) -> Optional[CancellationTask]:
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM cancellation_tasks WHERE idempotency_key = ?", (key,)).fetchone()
            return _row_to_task(row) if row else None
