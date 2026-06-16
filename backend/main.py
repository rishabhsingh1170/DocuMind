"""
Main FastAPI Application Entry Point
Initializes the FastAPI app, connects to MongoDB, and registers all route routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


try:
    from backend.routes import user, auth, document, chat
    from backend.config import CORS_ALLOW_ORIGINS, CORS_ALLOW_CREDENTIALS
except ModuleNotFoundError:
    from routes import user, auth, document, chat
    from config import CORS_ALLOW_ORIGINS, CORS_ALLOW_CREDENTIALS

app = FastAPI(title="Enterprise Knowledge Automation API", version="1.0.0")

# Enable CORS for local frontend apps (Vite/React).
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes
app.include_router(user.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(document.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

# React build
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")