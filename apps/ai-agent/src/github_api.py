import httpx
import hashlib
import os


async def fetch_commit_and_diff(repo: str, sha: str):
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient() as client:
        commit_url = f"https://api.github.com/repos/{repo}/commits/{sha}"
        r = await client.get(commit_url, headers=headers)
        r.raise_for_status()
        data = r.json()
        message = data["commit"]["message"]
        files = data.get("files", [])
        diff = "\n".join(f.get("patch", "") for f in files if f.get("patch"))
        m = hashlib.sha256()
        m.update(f"{repo}|{sha}|{data['commit']['author']['email']}".encode())
        return {"message": message, "diff": diff, "hash": "0x" + m.hexdigest()}

