import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { parseAbi } from "viem";

const abi = parseAbi([
  "function getScore(address) view returns (uint256)",
  "function topContributors(uint256) view returns (address[] addrs, uint256[] scores)",
]);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = BigInt(url.searchParams.get("limit") || "10");
  const rpc = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL as string;
  const address = process.env.REPUTATION_ADDRESS as `0x${string}`;
  const client = createPublicClient({ chain: sepolia, transport: http(rpc) });
  const data = await client.readContract({ address, abi, functionName: "topContributors", args: [limit] });
  return NextResponse.json({ addrs: data[0], scores: data[1].map((x: any) => x.toString()) });
}

