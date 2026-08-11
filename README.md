# 🌤️ Weather App - Projet Stage

## 📌 Description
Application web de collecte et d'analyse de données météo, développée en **Python** avec le framework **FastAPI**.

Un collecteur en arrière-plan interroge l'API **Open-Meteo** toutes les 10 minutes, stocke les mesures (température, humidité, vent, pression) en base, puis les expose via une API REST et un tableau de bord web.

Ville suivie par défaut : **Tunis** (latitude `36.8065`, longitude `10.1815`).

> **Base de données :** par défaut l'application utilise **SQLite** (fichier
> `weather.db` créé automatiquement) — aucun serveur à installer. PostgreSQL est
> pris en charge mais **optionnel** : voir [Configuration](#-configuration).

## 🛠️ Technologies utilisées
- **Python 3.12+** (imposé par `numpy==2.5.1` / `pandas==3.0.3`)
- **FastAPI** + **Uvicorn** (serveur ASGI)
- **SQLAlchemy 2.0** — SQLite par défaut, PostgreSQL en option (`psycopg2`)
- **API Open-Meteo** (gratuite, sans clé API)
- **APScheduler** (collecte planifiée)
- **Pandas** / **NumPy** (détection d'anomalies)
- **Jinja2** + HTML/CSS/JS + **Chart.js** (tableau de bord)
- **Git & GitHub**

## ✨ Fonctionnalités
- Collecte automatique des mesures toutes les 10 minutes
- Stockage historique en base (SQLite ou PostgreSQL)
- API REST : dernière mesure, historique, prévision, détection d'anomalies, journal du collecteur
- Interface web responsive : 5 pages, chacune avec sélecteur de métrique
- Journal des exécutions du collecteur (`collector_logs`) avec indicateurs de santé

## ✅ Prérequis
- **Python 3.12 ou supérieur** — `python3 --version` pour vérifier
- **Git**
- PostgreSQL 13+ — **uniquement** si vous ne voulez pas utiliser SQLite

## 🚀 Démarrage rapide

```bash
git clone https://github.com/rahmouni-arij/weather-app.git
cd weather-app/weather-app
./run.sh
```

`run.sh` vérifie la version de Python, crée le virtualenv, installe les
dépendances et démarre le serveur sur http://127.0.0.1:8000.

Variables reconnues par le script :

```bash
PORT=8080 ./run.sh              # autre port
HOST=0.0.0.0 ./run.sh           # accessible sur le réseau
PYTHON=python3.12 ./run.sh      # choisir l'interpréteur
./run.sh --reload               # arguments passés à uvicorn
```

## 🔧 Installation manuelle

### 1. Cloner le dépôt
```bash
git clone https://github.com/rahmouni-arij/weather-app.git
cd weather-app
```

### 2. Aller dans le dossier applicatif
> Le code se trouve dans le sous-dossier `weather-app/` (celui qui contient
> `backend/`, `static/` et `templates/`). **Toutes les commandes qui suivent
> s'exécutent depuis ce dossier.**
```bash
cd weather-app
```

### 3. Créer et activer un environnement virtuel
```bash
python3 -m venv .venv
source .venv/bin/activate       # Linux / macOS
# .venv\Scripts\activate        # Windows (PowerShell)
```

### 4. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 5. (Optionnel) Configurer l'environnement
Sans fichier `.env`, l'application démarre avec SQLite et les valeurs par
défaut. Pour personnaliser :
```bash
cp .env.example .env
```

### 6. Lancer l'application
```bash
uvicorn backend.app.main:app --reload
```

Au démarrage, l'application :
1. crée automatiquement les tables (`measurements`, `collector_logs`) ;
2. lance une première collecte immédiate ;
3. planifie la collecte toutes les 10 minutes.

Ouvrir ensuite dans le navigateur :
- Tableau de bord : http://localhost:8000
- Documentation interactive (Swagger) : http://localhost:8000/docs
- État du service : http://localhost:8000/health

## ⚙️ Configuration
Toutes les variables sont optionnelles et lues depuis `.env` (voir
`.env.example`) :

| Variable        | Défaut                  | Rôle                                  |
|-----------------|-------------------------|---------------------------------------|
| `DATABASE_URL`  | `sqlite:///./weather.db`| Connexion base de données             |
| `CITY_LAT`      | `36.8065`               | Latitude de la station                |
| `CITY_LON`      | `10.1815`               | Longitude de la station               |
| `SECRET_KEY`    | `ma_clef_secrete_123456`| Clé applicative                       |
| `DEBUG`         | `False`                 | Mode debug                            |
| `FORECAST_DAYS` | `7`                     | Horizon de prévision                  |

L'API Open-Meteo ne nécessite **aucune clé**.

### Utiliser PostgreSQL au lieu de SQLite
```bash
createdb weather_db
# puis dans .env :
# DATABASE_URL=postgresql://postgres:admin123@localhost:5432/weather_db
```
Les tables sont créées automatiquement au démarrage.

## 📡 Endpoints de l'API
| Méthode | Route                   | Description                                              |
|---------|-------------------------|----------------------------------------------------------|
| `GET`   | `/health`               | Vérification d'état du service                           |
| `GET`   | `/measurements/latest`  | Dernière mesure (`metric` **requis**)                    |
| `GET`   | `/measurements`         | Historique (`metric` **requis**, `limit`)                |
| `POST`  | `/forecast`             | Prévision simple par moyenne (corps JSON : `metric`, `n_points`) |
| `POST`  | `/anomalies`            | Détection d'anomalies par z-score (corps JSON : `metric`, `threshold`) |
| `GET`   | `/logs`                 | Journal du collecteur (`limit`, `status`) + résumé santé |

Métriques disponibles : `temperature`, `humidity`, `windspeed`, `pressure`.

### Corps des requêtes POST
`/forecast` et `/anomalies` attendent la métrique dans le corps JSON. La métrique
est validée contre l'énumération `MetricName` : toute autre valeur renvoie `422`.

```bash
# Prévision sur les 5 dernières mesures d'humidité
curl -X POST http://localhost:8000/forecast \
  -H "Content-Type: application/json" \
  -d '{"metric": "humidity", "n_points": 5}'

# Anomalies de pression avec un seuil de z-score de 1.5
curl -X POST http://localhost:8000/anomalies \
  -H "Content-Type: application/json" \
  -d '{"metric": "pressure", "threshold": 1.5}'
```

| Champ       | Défaut        | Contraintes                |
|-------------|---------------|----------------------------|
| `metric`    | `temperature` | une des 4 métriques        |
| `n_points`  | `5`           | entier, `2 ≤ n ≤ 100`      |
| `threshold` | `2.0`         | nombre, `0 < t ≤ 10`       |

Le corps est optionnel : `-d '{}'` applique les valeurs par défaut.

### Journal du collecteur
```bash
curl "http://localhost:8000/logs?limit=20&status=error"
```
`status` accepte `success` ou `error` (omettre le paramètre = tous les runs).
`limit` est borné entre 1 et 500.

### Pages web
| Page                | Contenu                                                        |
|---------------------|----------------------------------------------------------------|
| `/`                 | Relevés actuels + graphique d'historique (métrique au choix)   |
| `/forecast-page`    | Prévision par métrique                                          |
| `/history-page`     | Graphique, statistiques et tableau des mesures                  |
| `/anomalies-page`   | Détection d'anomalies par métrique                              |
| `/logs-page`        | Journal du collecteur (santé, filtrage par statut)              |

## 🩺 Dépannage

| Symptôme | Cause / solution |
|----------|------------------|
| `Python 3.12+ required, found 3.x` | Les versions épinglées de numpy/pandas exigent 3.12+. Installer Python 3.12 puis `PYTHON=python3.12 ./run.sh`. |
| `Address already in use` | Un serveur tourne déjà sur le port : `PORT=8001 ./run.sh`. |
| `Weather API Error: ... Read timed out` dans les logs | Open-Meteo injoignable (réseau). L'app continue de servir les données déjà en base ; le run est tracé en `error` dans `/logs-page`. |
| Une page web semble figée / vide après une mise à jour | Cache navigateur. Recharger de force : `Ctrl+Shift+R`. Les URLs des assets sont versionnées à chaque redémarrage pour éviter ce cas. |
| `ModuleNotFoundError: No module named 'backend'` | Commande lancée depuis le mauvais dossier : se placer dans `weather-app/weather-app/`. |
| Graphiques absents, reste de la page OK | Chart.js est chargé depuis un CDN ; sans accès Internet les pages affichent un message et restent utilisables. |

## 📂 Structure du projet
```
weather-app/
├── README.md
├── .gitignore
└── weather-app/                    # ← dossier applicatif (lancer les commandes ici)
    ├── run.sh                      # installation + démarrage en une commande
    ├── requirements.txt
    ├── .env.example                # modèle de configuration
    ├── weather.db                  # base SQLite (créée au premier démarrage)
    ├── backend/
    │   └── app/
    │       ├── main.py             # app FastAPI, pages, scheduler de démarrage
    │       ├── config.py           # configuration (DB, coordonnées, secrets)
    │       ├── database.py         # moteur SQLAlchemy + session
    │       ├── models.py           # Measurement, CollectorLog
    │       ├── schemas.py          # MetricName, LogStatus, corps des requêtes
    │       ├── collector.py        # appel Open-Meteo + écriture en base
    │       ├── core/
    │       │   └── scheduler.py    # (non utilisé — logique reprise dans main.py)
    │       ├── routers/            # weather, forecast, anomalies, health, logs
    │       ├── services/           # logique métier par domaine
    │       └── utils/              # logger, unités des métriques
    ├── templates/                  # base, index, forecast, history, anomalies, logs
    └── static/
        ├── css/style.css
        └── js/                     # metrics (partagé), dashboard, forecast,
                                    # history, anomalies, logs
```
