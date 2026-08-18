from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from datetime import datetime
from pathlib import Path

from .collector import save_weather
from .database import init_db, SessionLocal
from . import models

from .routers import weather
from .routers import forecast
from .routers import anomalies
from .routers import health
from .routers import logs
from .routers import dashboard
from .routers import ai


# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent


app = FastAPI(
    title="Weather API",
    version="1.0"
)


# ======================
# API Routers
# ======================

app.include_router(weather.router)
app.include_router(forecast.router)
app.include_router(anomalies.router)
app.include_router(health.router)
app.include_router(logs.router)
app.include_router(dashboard.router)
app.include_router(ai.router)



# ======================
# Static files
# ======================

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)



# ======================
# HTML Templates
# ======================

templates = Jinja2Templates(
    directory=BASE_DIR / "templates"
)
print("Templates path:", BASE_DIR / "templates")


# Static assets are versioned per process start so a restart always beats
# the browser cache — a stale cached .js is otherwise indistinguishable
# from a broken page.
templates.env.globals["asset_version"] = str(
    int(datetime.now().timestamp())
)



# ======================
# CORS
# ======================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ======================
# Dashboard page
# ======================
@app.get("/")
def dashboard(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )

# ======================
# ======================@app.get("/forecast-page")
@app.get("/forecast-page")
def forecast_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="forecast.html",
        context={}
    )


@app.get("/history-page")
def history_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="history.html",
        context={}
    )


@app.get("/anomalies-page")
def anomalies_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="anomalies.html",
        context={}
    )


@app.get("/logs-page")
def logs_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="logs.html",
        context={}
    )


@app.get("/ai-page")
def ai_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="ai.html",
        context={}
    )


@app.on_event("startup")
def startup_event():

    # Create database tables
    init_db()

    print("Database initialized")


    def collect_job():

        db = SessionLocal()

        try:

            save_weather(db)

            print(
                f"Collecte exécutée à {datetime.now()}"
            )


        except Exception as e:

            print(
                f"Erreur collecte : {e}"
            )


        finally:

            db.close()



    # First collection
    collect_job()



    # Scheduler
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.interval import IntervalTrigger
    scheduler = BackgroundScheduler()


    scheduler.add_job(
        collect_job,
        trigger=IntervalTrigger(minutes=10),
        id="weather_collector",
        replace_existing=True
    )


    scheduler.start()


    print(
        "Collecteur planifié toutes les 10 minutes"
    )