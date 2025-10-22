import { getPublicClient, getWalletClient, sbtAbi, reputationAbi, type Permit, type SignedPermit } from "./utils";
import { type Address } from "viem";

export async function verifyContribution(aiServiceUrl: string, input: { repo: string; sha: string; message?: string; diff?: string; wallet: Address; expiry: number }) {
  const res = await fetch(`${aiServiceUrl}/verify_commit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
  if (!res.ok) throw new Error(`AI verify failed: ${res.status}`);
  return (await res.json()) as SignedPermit;
}

export async function mintSBT(contract: Address, signed: SignedPermit, rpcUrl?: string) {
  const wallet = getWalletClient(undefined, rpcUrl);
  const hash = await wallet.writeContract({ address: contract, abi: sbtAbi, functionName: "mintWithSig", args: [signed as unknown as Permit, signed.signature] });
  return hash;
}

export async function fetchReputation(reputationContract: Address, addr: Address, rpcUrl?: string) {
  const client = getPublicClient(rpcUrl);
  return await client.readContract({ address: reputationContract, abi: reputationAbi, functionName: "getScore", args: [addr] });
}

export async function fetchLeaderboard(reputationContract: Address, limit: bigint, rpcUrl?: string) {
  const client = getPublicClient(rpcUrl);
  return await client.readContract({ address: reputationContract, abi: reputationAbi, functionName: "topContributors", args: [limit] });
}

