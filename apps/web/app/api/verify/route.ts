import { NextRequest, NextResponse } from "next/server";
import { uploadJsonToPinata } from "@/../../apps/web/_utils/pinata";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const aiUrl = process.env.AI_SERVICE_URL || 'https://ai-verifier.vercel.app';
  const chainId = Number(process.env.CHAIN_ID || 11155111);
  const verifyingContract = process.env.SBT_ADDRESS as string;
  // Build basic metadata and upload to IPFS first so AI signs with final tokenURI
  const meta = {
    name: "Proof of Contribution",
    description: `Verified contribution for ${body.repo} at ${body.sha}`,
    external_url: `https://github.com/${body.repo}/commit/${body.sha}`,
    attributes: [
      { trait_type: "repo", value: body.repo },
      { trait_type: "sha", value: body.sha },
    ],
    image: `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='black'/><text x='50' y='200' fill='white' font-size='24'>Proof of Contribution</text></svg>`).toString("base64")}`,
  };
  let tokenURI = "ipfs://pending";
  try { tokenURI = await uploadJsonToPinata(meta); } catch {}
  const res = await fetch(`${aiUrl}/verify_commit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, chain_id: chainId, verifying_contract: verifyingContract, tokenURI }),
  });
  if (!res.ok) return NextResponse.json({ error: "AI verify failed" }, { status: 400 });
  const data = await res.json();
  return NextResponse.json(data);
}

