# Root Python app for Dokku

Questa è una piccola app FastAPI pensata per essere deployata su Dokku utilizzando il workflow già presente nel repository.

File chiave:
- `app/main.py` — entrypoint FastAPI
- `requirements.txt` — dipendenze
- `Procfile` — come avviare l'app con `gunicorn` + `uvicorn` worker
- `runtime.txt` — versione Python per il buildpack

Test in locale:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
# visit http://localhost:5000/ and http://localhost:5000/health
```

Quando pushi su `main`, il workflow `Deploy to Dokku` eseguirà il push al tuo server Dokku come già configurato.
