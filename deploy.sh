#!/bin/bash
# Script per preparare e deployare l'applicazione su Dokku

set -e  # Exit on error

echo "🚀 Preparazione deploy Sportbnb..."

# Verifica che siamo nella directory corretta
if [ ! -f "requirements.txt" ]; then
    echo "❌ Errore: esegui questo script dalla root del progetto"
    exit 1
fi

# Verifica configurazione database produzione
if [ ! -f "db/.env.dokku" ]; then
    echo "❌ Errore: file db/.env.dokku non trovato"
    echo "   Assicurati che il file di configurazione database esista"
    exit 1
fi

echo "✓ File di configurazione trovati"

# Aggiungi tutti i file
echo "📦 Staging files..."
git add .

# Verifica stato
echo "📊 Git status:"
git status --short

# Chiedi conferma
read -p "Vuoi committare e pushare questi cambiamenti? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploy annullato"
    exit 0
fi

# Commit
echo "💾 Creating commit..."
COMMIT_MSG="${1:-Deploy: aggiornamento applicazione Sportbnb}"
git commit -m "$COMMIT_MSG" || echo "Nessun cambiamento da committare"

# Push
echo "🌐 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deploy preparato!"
echo ""
echo "📝 PROSSIMI PASSI SUL SERVER DOKKU:"
echo ""
echo "1. Collegati al tuo server"
echo "2. Se è il primo deploy:"
echo "   dokku apps:create valenteapps"
echo "   dokku postgres:link valenteapps-db valenteapps"
echo ""
echo "3. Deploy:"
echo "   cd /percorso/repo && git pull"
echo "   oppure:"
echo "   git push dokku main"
echo ""
echo "4. Verifica:"
echo "   dokku logs valenteapps -t"
echo ""
