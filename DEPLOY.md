# 🚀 Guida Deploy su Dokku

## Prerequisiti
- Repository GitHub configurato
- Server Dokku attivo con PostgreSQL plugin installato
- Database PostgreSQL già creato: `valenteapps-db`

## Passo 1: Rinomina file di configurazione database

Il file `db/.env.dokku.prod` contiene le credenziali del database PostgreSQL di produzione.
Rinominalo in `.env.dokku` prima del deploy:

```bash
cd /workspaces/valentepro-apps/db
mv .env.dokku.prod .env.dokku
git add .env.dokku
```

## Passo 2: Commit e Push su GitHub

```bash
cd /workspaces/valentepro-apps
git add .
git commit -m "Deploy: applicazione completa Sportbnb"
git push origin main
```

## Passo 3: Deploy su Dokku (dal server)

Sul tuo server Dokku, esegui:

```bash
# Crea l'app se non esiste
dokku apps:create valenteapps

# Collega il database PostgreSQL esistente
dokku postgres:link valenteapps-db valenteapps

# Configura variabili d'ambiente (se necessario)
dokku config:set valenteapps SECRET_KEY="$(openssl rand -hex 32)"

# Deploy da GitHub
# Opzione A: Deploy diretto da GitHub
git remote add dokku dokku@your-server.com:valenteapps
git push dokku main

# Opzione B: Se hai già un remote Dokku configurato
git push dokku main
```

## Passo 4: Verifica

```bash
# Verifica i log
dokku logs valenteapps -t

# Verifica che l'app sia attiva
curl https://valenteapps.your-domain.com
```

## Note Importanti

### Database
- L'app usa automaticamente il file `db/.env.dokku` in produzione
- Le tabelle vengono create automaticamente al primo avvio
- L'utente admin viene creato automaticamente: `admin@sportbnb.com` / `admin123`

### Credenziali Admin
**⚠️ CAMBIA LA PASSWORD ADMIN DOPO IL PRIMO LOGIN!**

### Variabili d'ambiente
Dokku imposta automaticamente `DATABASE_URL` quando colleghi il database.
Se serve, puoi sovrascrivere altre variabili:

```bash
dokku config:set valenteapps \
  SECRET_KEY="your-secret-key-here" \
  ENVIRONMENT="production"
```

### SSL/HTTPS
Se hai un dominio configurato:

```bash
dokku domains:add valenteapps your-domain.com
dokku letsencrypt:enable valenteapps
```

### Debug
Se qualcosa non funziona:

```bash
# Verifica variabili d'ambiente
dokku config valenteapps

# Verifica database connesso
dokku postgres:info valenteapps-db

# Accedi al container
dokku enter valenteapps web

# Riavvia l'app
dokku ps:restart valenteapps
```

## Struttura File Deploy

```
valentepro-apps/
├── app/
│   ├── main.py          # API FastAPI
│   ├── auth.py          # Sistema autenticazione
│   └── schemas.py       # Validazione dati
├── db/
│   ├── models.py        # Modelli database
│   ├── database.py      # Connessione DB
│   └── .env.dokku       # Credenziali PostgreSQL (committato)
├── static/
│   ├── index.html       # Frontend
│   ├── style.css        # Stili
│   └── app.js           # JavaScript
├── requirements.txt     # Dipendenze Python
├── Procfile            # Comando start Dokku
└── .gitignore          # File esclusi da Git
```
