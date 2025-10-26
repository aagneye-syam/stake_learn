import { NextRequest, NextResponse } from "next/server";
import { uploadJsonToPinata } from "@/../../apps/web/_utils/pinata";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repo, sha, wallet } = body;

    if (!repo || !sha || !wallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chainId = Number(process.env.CHAIN_ID || 11155111);
    const verifyingContract = process.env.SBT_ADDRESS as string;

    // Build metadata and upload to IPFS
    const meta = {
      name: "Proof of Contribution",
      description: `Manually verified contribution for ${repo} at ${sha}`,
      external_url: `https://github.com/${repo}/commit/${sha}`,
      attributes: [
        { trait_type: "repo", value: repo },
        { trait_type: "sha", value: sha },
        { trait_type: "verification_type", value: "manual" },
      ],
      image: `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='black'/><text x='50' y='200' fill='white' font-size='24'>Manual Verification</text></svg>`).toString("base64")}`,
    };

    let tokenURI = "ipfs://pending";
    try { 
      tokenURI = await uploadJsonToPinata(meta); 
    } catch (error) {
      console.error('Failed to upload to IPFS:', error);
      // Continue with fallback
    }

    // Create a mock verification response (since we're doing manual verification)
    const mockVerification = {
      to: wallet,
      commitHash: sha,
      reputation: 10, // Base reputation for manual verification
      expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      tokenURI: tokenURI,
      signature: "0x" + "0".repeat(130) // Mock signature for manual verification
    };

    return NextResponse.json(mockVerification);

  } catch (error) {
    console.error('Error in manual verification:', error);
    return NextResponse.json(
      { error: 'Manual verification failed' },
      { status: 500 }
    );
  }
}
