"""
JudgeAgent — post-execution response evaluator.

After every Execution Agent response, the JudgeAgent runs a lightweight LLM
call to evaluate three dimensions:

  (a) answers_question  — does the response actually address what the user asked?
  (b) factually_grounded — is the response free of obvious hallucinations or
                            unsupported claims?
  (c) safe              — does the response avoid harmful, offensive, or
                           policy-violating content?

The verdict is a structured JSON object:

    {
        "answers_question": true,
        "factually_grounded": true,
        "safe": true,
        "issues": [],
        "passed": true
    }

If the verdict does not pass, the WorkflowEngine appends a brief disclaimer to
the response and tags the message metadata so it can be reviewed.

Design principles
-----------------
- Never blocks the response — if the judge LLM call fails, the original
  response is returned unchanged with ``judge_skipped=True`` in metadata.
- Uses a smaller / faster model when configured (``JUDGE_MODEL`` setting),
  falling back to the default LLM model.
- Does NOT regenerate the response (that would double latency); instead it
  appends a short warning when the verdict fails.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any

from services.llm import LLMService, llm_service

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

_JUDGE_SYSTEM = """\
You are a response quality evaluator for CAIPO, an AI wearable assistant.

You will receive:
1. The user's original message.
2. The assistant's response.

Evaluate the response on three dimensions:

answers_question (bool):
  Does the response directly and completely address what the user asked?
  It's OK if the answer is "I don't know" — as long as that IS the honest answer.

factually_grounded (bool):
  Is the response free of obvious hallucinations, invented facts, or
  unsupported claims presented as certainties?
  Minor hedging ("I believe", "I think") is acceptable.

safe (bool):
  Is the response free of harmful, hateful, violent, explicit, or
  otherwise policy-violating content?

Return ONLY a JSON object with this exact structure — no prose, no markdown fences:
{
  "answers_question": <true|false>,
  "factually_grounded": <true|false>,
  "safe": <true|false>,
  "issues": [<short description of each problem found, or empty list>],
  "passed": <true if ALL three dimensions are true, otherwise false>
}
"""

_JUDGE_USER_TEMPLATE = """\
User message:
{user_message}

Assistant response:
{assistant_response}
"""

_DISCLAIMER = (
    "\n\n---\n*Note: This response may not fully address your question or "
    "could contain inaccuracies. Please verify important information independently.*"
)

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------


@dataclass
class JudgeVerdict:
    """Structured output from the JudgeAgent."""

    answers_question: bool = True
    factually_grounded: bool = True
    safe: bool = True
    issues: list[str] = field(default_factory=list)
    passed: bool = True

    # Set to True when the judge call was skipped due to an error
    skipped: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "answers_question": self.answers_question,
            "factually_grounded": self.factually_grounded,
            "safe": self.safe,
            "issues": self.issues,
            "passed": self.passed,
            "skipped": self.skipped,
        }

    @classmethod
    def passing(cls) -> "JudgeVerdict":
        return cls(passed=True)

    @classmethod
    def skipped_verdict(cls) -> "JudgeVerdict":
        return cls(skipped=True)


# ---------------------------------------------------------------------------
# JudgeAgent
# ---------------------------------------------------------------------------


class JudgeAgent:
    """
    Evaluates a (user message, assistant response) pair and returns a verdict.

    Not a BaseAgent subclass — it has no ``run()``/``stream()`` interface
    because it never produces a user-facing response on its own; it only
    annotates or amends an existing one.
    """

    def __init__(self, llm: LLMService | None = None) -> None:
        self._llm = llm or llm_service

    async def evaluate(
        self,
        user_message: str,
        assistant_response: str,
    ) -> JudgeVerdict:
        """
        Run the judge LLM call and return a structured verdict.

        Always returns a JudgeVerdict — never raises.
        """
        try:
            return await self._call_judge(user_message, assistant_response)
        except Exception as exc:
            logger.warning("JudgeAgent evaluation failed (skipping): %s", exc)
            return JudgeVerdict.skipped_verdict()

    def apply_verdict(
        self,
        response_content: str,
        verdict: JudgeVerdict,
    ) -> str:
        """
        If the verdict did not pass, append a disclaimer to the response text.
        Returns the (possibly amended) response string.
        """
        if verdict.skipped or verdict.passed:
            return response_content
        return response_content + _DISCLAIMER

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    async def _call_judge(
        self,
        user_message: str,
        assistant_response: str,
    ) -> JudgeVerdict:
        messages = [
            {"role": "system", "content": _JUDGE_SYSTEM},
            {
                "role": "user",
                "content": _JUDGE_USER_TEMPLATE.format(
                    user_message=user_message,
                    assistant_response=assistant_response,
                ),
            },
        ]

        raw = await self._llm.chat(messages, stream=False)
        assert isinstance(raw, str)
        return _parse_verdict(raw)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse_verdict(raw: str) -> JudgeVerdict:
    """
    Parse the LLM output into a JudgeVerdict.
    Robust to minor formatting noise (trailing prose, minor whitespace).
    """
    text = raw.strip()

    # Strip markdown fences if present
    for fence in ("```json", "```"):
        if text.startswith(fence):
            text = text[len(fence):]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # Find the JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        logger.debug("JudgeAgent: could not locate JSON object in output: %r", raw[:300])
        # Optimistic default: assume passing when we can't parse
        return JudgeVerdict.passing()

    try:
        data = json.loads(text[start: end + 1])
    except json.JSONDecodeError as exc:
        logger.debug("JudgeAgent: JSON parse failed: %s | raw=%r", exc, raw[:300])
        return JudgeVerdict.passing()

    answers_question = bool(data.get("answers_question", True))
    factually_grounded = bool(data.get("factually_grounded", True))
    safe = bool(data.get("safe", True))
    issues_raw = data.get("issues", [])
    issues = [str(i) for i in issues_raw] if isinstance(issues_raw, list) else []
    passed = answers_question and factually_grounded and safe

    return JudgeVerdict(
        answers_question=answers_question,
        factually_grounded=factually_grounded,
        safe=safe,
        issues=issues,
        passed=passed,
    )


# Module-level singleton
judge_agent = JudgeAgent()
