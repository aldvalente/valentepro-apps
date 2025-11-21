from fastapi import FastAPI

app = FastAPI(title="ValentePro Minimal App")


@app.get("/")
async def root():
    return {"message": "ValentePro minimal Python app - OK"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
