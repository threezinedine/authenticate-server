from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager
from sqlalchemy import inspect
from app.database.session import engine, Base
import app.database.models
from app.api.v1.register.route import router as register_router
from app.api.v1.login.route import router as login_router
from app.api.v1.refresh.route import router as refresh_router
from app.api.v1.locales.route import router as locales_router
from app.api.well_known.route import router as jwks_router
from app.config import settings
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Skip creating tables locally during test executions to prevent intercepting test sessions
    if settings.ENVIRONMENT != "test":
        inspector = inspect(engine)
        if not inspector.has_table("users"):
            print("Creating database tables...")
            Base.metadata.create_all(bind=engine)
        else:
            print("Database tables already exist.")
    else:
        print("Test environment detected, skipping lifespan DB creation.")
    
    yield

app = FastAPI(lifespan=lifespan)

from fastapi.staticfiles import StaticFiles

app.include_router(register_router, prefix="/api/v1")
app.include_router(login_router, prefix="/api/v1")
app.include_router(refresh_router, prefix="/api/v1")
app.include_router(locales_router, prefix="/api/v1/locales")
app.include_router(jwks_router)

# Mount the entire frontend directory as static files to serve CSS, JS, and Images natively
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

# Point Jinja2 to the frontend pages directory
templates_dir = os.path.join(os.path.dirname(__file__), "frontend", "pages")
templates = Jinja2Templates(directory=templates_dir)

@app.get("/")
def main():
    return {"message": "Hello from server!"}

@app.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("login/index.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
