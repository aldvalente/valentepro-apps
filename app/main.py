

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

# --- DEMO AIRBNB SPORT ---
from pydantic import BaseModel
from typing import List, Optional

class Attrezzatura(BaseModel):
    id: int
    nome: str
    descrizione: str
    prezzo_giornaliero: float
    immagine: Optional[str] = None

class AttrezzaturaCreate(BaseModel):
    nome: str
    descrizione: str
    prezzo_giornaliero: float
    immagine: Optional[str] = None

class Prenotazione(BaseModel):
    id: int
    attrezzatura_id: int
    nome_cliente: str
    data_inizio: str
    data_fine: str

class PrenotazioneCreate(BaseModel):
    attrezzatura_id: int
    nome_cliente: str
    data_inizio: str
    data_fine: str

_attrezzature: List[Attrezzatura] = []
_prenotazioni: List[Prenotazione] = []
_id_att = 1
_id_pren = 1

@app.get("/api/attrezzature", response_model=List[Attrezzatura])
def lista_attrezzature():
    return _attrezzature

@app.post("/api/attrezzature", response_model=Attrezzatura)
def aggiungi_attrezzatura(a: AttrezzaturaCreate):
    global _id_att
    att = Attrezzatura(id=_id_att, **a.dict())
    _attrezzature.append(att)
    _id_att += 1
    return att

@app.get("/api/prenotazioni", response_model=List[Prenotazione])
def lista_prenotazioni():
    return _prenotazioni

@app.post("/api/prenotazioni", response_model=Prenotazione)
def crea_prenotazione(p: PrenotazioneCreate):
    global _id_pren
    pren = Prenotazione(id=_id_pren, **p.dict())
    _prenotazioni.append(pren)
    _id_pren += 1
    return pren

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
