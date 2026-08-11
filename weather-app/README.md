# 🌤️ Weather App — dossier applicatif

C'est ici que vit le code (`backend/`, `templates/`, `static/`) et donc **le
dossier depuis lequel toutes les commandes doivent être lancées**.

## Démarrage

```bash
./run.sh
```

Vérifie Python (3.12+ requis), crée `.venv`, installe `requirements.txt`, puis
démarre le serveur sur http://127.0.0.1:8000.

Équivalent manuel :

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

Aucune configuration n'est obligatoire : sans `.env`, l'application utilise
SQLite (`weather.db`, créé automatiquement) et la station de Tunis. Pour
personnaliser, `cp .env.example .env`.

## Documentation complète

Prérequis, configuration, endpoints, pages, dépannage et structure du projet :
voir le [README à la racine du dépôt](../README.md).
