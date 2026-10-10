"""A browser disconnect must not cancel a provider request already started."""

import asyncio
import os
import unittest
from unittest.mock import patch

from app.services.cancellation_orchestrator import CancellationOrchestrator
from app.services.repository import SubscriptionRepository


class AgentStreamTests(unittest.IsolatedAsyncioTestCase):
    async def test_disconnect_keeps_worker_running_and_result_can_be_replayed(self):
        with patch.dict(os.environ, {"PROVIDER_MODE": "fixture"}):
            repo = SubscriptionRepository()
            agent = CancellationOrchestrator(repo)
            queued = agent.queue_cancellation("sub_02", "canva", True, "disconnect-canva-test-001")

            stream = agent.stream_cancellation_task(queued.taskId)
            first = await stream.__anext__()
            self.assertIn("event: agent_step", first)
            await stream.aclose()

            await asyncio.wait_for(agent._running_tasks[queued.taskId], timeout=10)
            task = repo.get_task(queued.taskId)
            self.assertIsNotNone(task.result)
            self.assertEqual(task.result.status, "success")
            self.assertEqual(repo.get_by_id("sub_02").status.value, "Cancelled")

            replay = [event async for event in agent.stream_cancellation_task(queued.taskId)]
            self.assertEqual(len(replay), 1)
            self.assertIn("event: agent_completed", replay[0])


if __name__ == "__main__":
    unittest.main()
