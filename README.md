# 🏄‍♂️ Sportbnb - Piattaforma Noleggio Attrezzature Sportive

Piattaforma moderna per il noleggio di attrezzature sportive con autenticazione, pannello admin e gestione prenotazioni.

## ✨ Caratteristiche Principali

- 🔐 Autenticazione JWT con ruoli (User/Host/Admin)
- 🎨 Design moderno stile Airbnb con tema rosso
- 🗺️ Mappa interattiva con Leaflet.js
- 📱 Responsive e mobile-friendly
- 🔍 Filtri di ricerca per categoria e città
- 📅 Sistema prenotazioni con controllo sovrapposizioni
- ⚙️ Pannello amministratore completo

## 🚀 Quick Start

```bash
# Sviluppo locale (usa SQLite)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3000
```

**Credenziali Admin**: `admin@sportbnb.com` / `admin123`

## 📦 Deploy su Dokku

Vedi [DEPLOY.md](DEPLOY.md) per istruzioni complete.

```bash
./deploy.sh "Messaggio commit"
```

## 🛠️ Stack Tecnologico

**Backend**: FastAPI, SQLAlchemy, PostgreSQL/SQLite, JWT  
**Frontend**: Vanilla JS, Leaflet.js, CSS moderno  

## 📁 Struttura

```
app/          → API FastAPI e autenticazione
db/           → Modelli database e config
static/       → Frontend (HTML/CSS/JS)
```

Vedi documentazione completa in [DEPLOY.md](DEPLOY.md)
