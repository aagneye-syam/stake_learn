import { NextRequest, NextResponse } from "next/server";
import { fetchLeaderboard } from "@/sdk/index";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = BigInt(url.searchParams.get("limit") || "10");
  const address = process.env.REPUTATION_ADDRESS as `0x${string}`;
  const data = await fetchLeaderboard(address, limit);
  return NextResponse.json({ addrs: data[0], scores: data[1].map((x: bigint) => x.toString()) });
}

