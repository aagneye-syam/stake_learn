export async function uploadJsonToPinata(data: any): Promise<string> {
  const jwt = process.env.PINATA_JWT as string;
  if (!jwt) throw new Error("PINATA_JWT missing");
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ pinataContent: data }),
  });
  if (!res.ok) throw new Error(`Pinata upload failed: ${res.status}`);
  const json = await res.json();
  const hash = json.IpfsHash as string;
  return `ipfs://${hash}`;
}

