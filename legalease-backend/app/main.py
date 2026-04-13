from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Triggering backend reload after structural updates
from contextlib import asynccontextmanager
from app.routes import auth, document
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize SQLite database
    await init_db()
    yield
    # Shutdown: nothing to clean up for SQLite


app = FastAPI(
    title="LegalEase API",
    description="AI-powered legal document summarizer",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "https://*.vercel.app",   # Vercel deployment
        "*",                      # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(document.router, prefix="/api/document", tags=["Documents"])


@app.get("/")
async def root():
    return {"message": "LegalEase API is running!", "version": "1.0.0", "database": "SQLite"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
