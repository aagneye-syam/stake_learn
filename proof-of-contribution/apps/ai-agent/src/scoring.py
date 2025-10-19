import os
import math
from openai import AsyncOpenAI


client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def score_commit(message: str, diff: str) -> int:
    # Simple heuristic backed by LLM classification; fallback to length-based score
    if not os.getenv("OPENAI_API_KEY"):
        base = min(100, max(1, len(diff.splitlines()) // 10 + (5 if "fix" in message.lower() else 0)))
        return base
    prompt = (
        "Evaluate this commit for authenticity and substantive contribution on a 1-100 scale.\n"
        f"Message: {message}\n\nDiff:\n{diff[:15000]}"
    )
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=10,
    )
    text = resp.choices[0].message.content or "50"
    digits = "".join(ch for ch in text if ch.isdigit())
    try:
        score = int(digits[:3])
    except Exception:
        score = 50
    return max(1, min(100, score))

