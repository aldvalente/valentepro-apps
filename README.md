# ValentePro Apps — FastAPI

Questa è una semplice app Python FastAPI pronta per il deploy su Dokku tramite workflow GitHub Actions.

## File principali
- `app/main.py` — entrypoint FastAPI
- `requirements.txt` — dipendenze
- `Procfile` — comando di avvio (Gunicorn/Uvicorn)
- `runtime.txt` — versione Python

## Test locale
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
# visita http://localhost:5000/
```

Quando pushi su GitHub, il deploy sarà automatico su Dokku.
