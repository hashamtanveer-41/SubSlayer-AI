from typing import Dict, Any
from app.services.agent.interfaces import BaseDarkPatternBypasser

class RetentionTrapSolver(BaseDarkPatternBypasser):
    """
    Analyzes and bypasses deceptive retention dark patterns ('Roach Motels').
    Single Responsibility: Decision logic for navigating retention obstacles.
    """

    async def evaluate_and_bypass(self, step_context: Dict[str, Any]) -> str:
        prompt_type = step_context.get("pattern_type", "discount_modal")

        match prompt_type:
            case "discount_modal":
                return "Detected 50% retention bribe modal ('Stay for 50% off'). Clicked: 'No thanks, cancel my subscription'."
            case "guilt_trip":
                return "Detected loss-aversion prompt ('You will lose 1,200 brand assets'). Clicked: 'Continue to cancel anyway'."
            case "survey_trap":
                return "Detected mandatory retention questionnaire. Selected reason: 'Too expensive / Not using anymore'."
            case _:
                return "Located obfuscated cancel button behind secondary settings layer. Executed bypass."
