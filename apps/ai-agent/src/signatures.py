import os
from eth_account import Account
from eth_account.messages import encode_typed_data


def _domain(chain_id: int, verifying_contract: str):
    return {
        "name": "ProofOfContribution",
        "version": "1",
        "chainId": chain_id,
        "verifyingContract": verifying_contract,
    }


PERMIT_TYPES = {
    "Permit": [
        {"name": "to", "type": "address"},
        {"name": "commitHash", "type": "bytes32"},
        {"name": "reputation", "type": "uint256"},
        {"name": "expiry", "type": "uint256"},
        {"name": "tokenURI", "type": "string"},
    ]
}


async def sign_eip712_permit(permit: dict, chain_id: int, verifying_contract: str):
    private_key = os.getenv("AI_VERIFIER_PRIVATE_KEY")
    if not private_key:
        raise RuntimeError("AI_VERIFIER_PRIVATE_KEY not configured")
    acct = Account.from_key(private_key)
    message = permit
    data = {
        "types": {"EIP712Domain": [
            {"name": "name", "type": "string"},
            {"name": "version", "type": "string"},
            {"name": "chainId", "type": "uint256"},
            {"name": "verifyingContract", "type": "address"},
        ], **PERMIT_TYPES},
        "domain": _domain(chain_id, verifying_contract),
        "primaryType": "Permit",
        "message": message,
    }
    signable = encode_typed_data(full_message=data)
    signed = Account.sign_message(signable, private_key=private_key)
    return {**permit, "signature": signed.signature.hex()}

