"""
Pricing for usage cost estimation.

Rates will be defined based on the multimodal system's billing model.
Return None until pricing is agreed upon with the multimodal system.
"""
from typing import Optional


def compute_cost_usd(
    model: str, prompt_tokens: int, completion_tokens: int
) -> Optional[float]:
    return None
