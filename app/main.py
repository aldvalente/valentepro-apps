

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
from datetime import datetime
import os

app = FastAPI(title="Gestionale Appuntamenti")

# Serve static frontend
static_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class Appuntamento(BaseModel):
    id: int
    nome: str
    data: datetime
    descrizione: str = ""

class AppuntamentoCreate(BaseModel):
    nome: str
    data: datetime
    descrizione: str = ""

_db: List[Appuntamento] = []
_id_counter = 1

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
def root():
        return RedirectResponse(url="/static/index.html")

@app.get("/appuntamenti", response_model=List[Appuntamento])
def lista_appuntamenti():
    return _db

@app.post("/appuntamenti", response_model=Appuntamento)
def crea_appuntamento(appuntamento: AppuntamentoCreate):
    global _id_counter
    nuovo = Appuntamento(id=_id_counter, **appuntamento.dict())
    _db.append(nuovo)
    _id_counter += 1
    return nuovo

@app.delete("/appuntamenti/{appuntamento_id}", response_model=Appuntamento)
def cancella_appuntamento(appuntamento_id: int):
    for i, a in enumerate(_db):
        if a.id == appuntamento_id:
            return _db.pop(i)
    raise HTTPException(status_code=404, detail="Appuntamento non trovato")
