import threading
from datetime import date, timedelta
from typing import Dict, List, Optional
from app.domain.models import Subscription, SubscriptionCycle, SubscriptionStatus, CancellationTask
from app.demo_common import PROVIDERS

class SubscriptionRepository:
    """Thread-safe in-memory repository for subscriptions and tasks."""

    def __init__(self):
        self._lock = threading.Lock()
        self._subscriptions: Dict[str, Subscription] = {}
        self._tasks: Dict[str, CancellationTask] = {}
        self._seed_default_data()

    def _seed_default_data(self):
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
            self._subscriptions[s.id] = s

    def get_all(self) -> List[Subscription]:
        with self._lock:
            return list(self._subscriptions.values())

    def get_by_id(self, sub_id: str) -> Optional[Subscription]:
        with self._lock:
            return self._subscriptions.get(sub_id)

    def get_by_provider_subscription_id(self, provider: str, provider_id: str) -> Optional[Subscription]:
        with self._lock:
            return next((sub for sub in self._subscriptions.values()
                         if sub.provider == provider and sub.providerSubscriptionId == provider_id), None)

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

    def get_task_by_idempotency_key(self, key: str) -> Optional[CancellationTask]:
        with self._lock:
            return next((task for task in self._tasks.values() if task.idempotencyKey == key), None)
