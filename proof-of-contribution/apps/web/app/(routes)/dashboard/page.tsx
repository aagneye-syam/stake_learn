"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { mintSBT } from "@/../../packages/sdk/index";

export default function DashboardPage() {
  const { address } = useAccount();
  const [repo, setRepo] = useState("");
  const [sha, setSha] = useState("");
  const [permit, setPermit] = useState<any>(null);
  const [signature, setSignature] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  async function onVerify() {
    setStatus("Verifying...");
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ repo, sha, wallet: address, expiry: Math.floor(Date.now()/1000)+3600 }),
    });
    const data = await res.json();
    if (res.ok) {
      setPermit({ to: data.to, commitHash: data.commitHash, reputation: data.reputation, expiry: data.expiry, tokenURI: data.tokenURI });
      setSignature(data.signature);
      setStatus("Verified");
    } else {
      setStatus(data.error || "Verify failed");
    }
  }

  async function onMint() {
    if (!permit || !signature) return;
    setStatus("Minting...");
    const res = await fetch("/api/mint", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ permit, signature }) });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error || "Mint failed"); return; }
    const contract = process.env.NEXT_PUBLIC_SBT_ADDRESS as `0x${string}`;
    const tx = await mintSBT(contract as any, { ...permit, signature } as any, process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
    setStatus(`Tx sent: ${tx}`);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Verify and Mint SBT</h2>
      <div className="grid gap-2 max-w-xl">
        <input className="border p-2 rounded" placeholder="owner/repo" value={repo} onChange={e=>setRepo(e.target.value)} />
        <input className="border p-2 rounded" placeholder="commit sha" value={sha} onChange={e=>setSha(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-gray-900 text-white" onClick={onVerify} disabled={!address}>Verify</button>
          <button className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50" onClick={onMint} disabled={!permit}>Mint</button>
        </div>
      </div>
      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </div>
  );
}

