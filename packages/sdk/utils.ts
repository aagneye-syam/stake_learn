import { createPublicClient, createWalletClient, http, type Address, parseAbi } from "viem";
import { sepolia } from "viem/chains";

export function getPublicClient(rpcUrl?: string) {
  return createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
}

export function getWalletClient(account?: Address, rpcUrl?: string) {
  return createWalletClient({ 
    chain: sepolia, 
    transport: http(rpcUrl), 
    account 
  } as any);
}

export const sbtAbi = parseAbi([
  "function mintWithSig((address to, bytes32 commitHash, uint256 reputation, uint256 expiry, string tokenURI) p, bytes signature) returns (uint256)",
  "function verifier() view returns (address)",
  "function usedCommitHash(address,bytes32) view returns (bool)",
]);

export const reputationAbi = parseAbi([
  "function getScore(address) view returns (uint256)",
  "function topContributors(uint256) view returns (address[] addrs, uint256[] scores)",
]);

export type Permit = {
  to: Address;
  commitHash: `0x${string}`;
  reputation: bigint;
  expiry: bigint;
  tokenURI: string;
};

export type SignedPermit = Permit & { signature: `0x${string}` };

