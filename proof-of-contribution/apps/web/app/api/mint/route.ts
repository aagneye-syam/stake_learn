import { NextRequest, NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";

const domain = (chainId: number, verifyingContract: `0x${string}`) => ({
  name: "ProofOfContribution",
  version: "1",
  chainId,
  verifyingContract,
});

const types = {
  Permit: [
    { name: "to", type: "address" },
    { name: "commitHash", type: "bytes32" },
    { name: "reputation", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "tokenURI", type: "string" },
  ],
} as const;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { permit, signature } = body as { permit: any; signature: `0x${string}` };
  const chainId = Number(process.env.CHAIN_ID || 11155111);
  const verifyingContract = process.env.SBT_ADDRESS as `0x${string}`;
  const expectedSigner = process.env.AI_VERIFIER_ADDRESS as `0x${string}`;

  // expiry check
  if (Date.now() / 1000 > Number(permit.expiry)) {
    return NextResponse.json({ error: "Permit expired" }, { status: 400 });
  }

  // recover signer
  const recovered = await recoverTypedDataAddress({
    domain: domain(chainId, verifyingContract),
    types,
    primaryType: "Permit",
    message: permit,
    signature,
  });
  if (recovered.toLowerCase() !== expectedSigner.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Return calldata for client to execute write
  return NextResponse.json({ ok: true, args: [permit, signature] });
}

