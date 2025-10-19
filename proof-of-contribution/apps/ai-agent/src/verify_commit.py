from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .github_api import fetch_commit_and_diff
from .scoring import score_commit
from .signatures import sign_eip712_permit

router = APIRouter()


class VerifyInput(BaseModel):
    repo: str
    sha: str
    message: str | None = None
    diff: str | None = None
    wallet: str
    expiry: int
    chain_id: int
    verifying_contract: str
    tokenURI: str | None = None


@router.post("/verify_commit")
async def verify_commit(input: VerifyInput):
    try:
        commit_hash = await fetch_commit_and_diff(input.repo, input.sha)
        # If message/diff provided, prefer provided values for scoring context
        message = input.message or commit_hash["message"]
        diff = input.diff or commit_hash["diff"]

        reputation = await score_commit(message=message, diff=diff)

        payload = {
            "to": input.wallet,
            "commitHash": commit_hash["hash"],
            "reputation": reputation,
            "expiry": input.expiry,
            "tokenURI": input.tokenURI or "ipfs://pending"
        }

        signed = await sign_eip712_permit(payload, input.chain_id, input.verifying_contract)
        return signed
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

