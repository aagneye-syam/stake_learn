from fastapi import FastAPI
from .verify_commit import router as verify_router

app = FastAPI(title="Proof of Contribution AI Agent")

app.include_router(verify_router)

@app.get("/health")
def health():
    return {"ok": True}

