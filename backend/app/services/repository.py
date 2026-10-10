import threading
from typing import Dict, List, Optional
from app.domain.models import Subscription, SubscriptionCycle, SubscriptionStatus, CancellationTask

class SubscriptionRepository:
    """Thread-safe in-memory repository for subscriptions and tasks."""

    def __init__(self):
        self._lock = threading.Lock()
        self._subscriptions: Dict[str, Subscription] = {}
        self._tasks: Dict[str, CancellationTask] = {}
        self._seed_default_data()

    def _seed_default_data(self):
        seeds = [
            Subscription(
                id="sub_01",
                name="Adobe Creative Cloud",
                category="Productivity",
                price=59.99,
                cycle=SubscriptionCycle.MONTHLY,
                renewal="2026-06-28",
                status=SubscriptionStatus.ACTIVE,
                vampireScore=88,
                provider="adobe",
                providerSubscriptionId="demo_adobe_sub_01",
                mark="A",
                tone="adobe",
            ),
            Subscription(
                id="sub_02",
                name="Canva Pro",
                category="Productivity",
                price=14.99,
                cycle=SubscriptionCycle.MONTHLY,
                renewal="2026-06-28",
                status=SubscriptionStatus.ACTIVE,
                vampireScore=72,
                provider="canva",
                providerSubscriptionId="demo_canva_sub_02",
                mark="C",
                tone="canva",
            ),
            Subscription(
                id="sub_03",
                name="Netflix",
                category="Entertainment",
                price=15.49,
                cycle=SubscriptionCycle.MONTHLY,
                renewal="2026-06-24",
                status=SubscriptionStatus.ACTIVE,
                vampireScore=65,
                provider="netflix",
                providerSubscriptionId="demo_netflix_sub_03",
                mark="N",
                tone="netflix",
            ),
            Subscription(
                id="sub_04",
                name="Spotify",
                category="Entertainment",
                price=10.99,
                cycle=SubscriptionCycle.MONTHLY,
                renewal="2026-06-26",
                status=SubscriptionStatus.ACTIVE,
                vampireScore=55,
                provider="spotify",
                providerSubscriptionId="demo_spotify_sub_04",
                mark="S",
                tone="spotify",
            ),
            Subscription(
                id="sub_05",
                name="Notion",
                category="Productivity",
                price=10.00,
                cycle=SubscriptionCycle.MONTHLY,
                renewal="2026-07-02",
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
                renewal="2026-07-05",
                status=SubscriptionStatus.ACTIVE,
                vampireScore=25,
                provider="generic",
                providerSubscriptionId="demo_generic_sub_06",
                mark="C",
                tone="icloud",
            ),
        ]
        for s in seeds:
            self._subscriptions[s.id] = s

    def get_all(self) -> List[Subscription]:
        with self._lock:
            return list(self._subscriptions.values())

    def get_by_id(self, sub_id: str) -> Optional[Subscription]:
        with self._lock:
            return self._subscriptions.get(sub_id)

    def add(self, sub: Subscription) -> Subscription:
        with self._lock:
            self._subscriptions[sub.id] = sub
            return sub

    def update(self, sub: Subscription) -> Optional[Subscription]:
        with self._lock:
            if sub.id in self._subscriptions:
                self._subscriptions[sub.id] = sub
                return sub
            return None

    def save_task(self, task: CancellationTask) -> None:
        with self._lock:
            self._tasks[task.taskId] = task

    def get_task(self, task_id: str) -> Optional[CancellationTask]:
        with self._lock:
            return self._tasks.get(task_id)
