"""
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import config
from app.routes import songs


# Create app
app = FastAPI(
    title="AI Beat Game Backend",
    description="Backend API for AI Music Beat Game",
    version="0.1.0",
)

# CORS middleware (allow all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for local audio serving
app.mount(
    "/songs",
    StaticFiles(directory=str(config.SONGS_DIR)),
    name="songs"
)

# Include routers
app.include_router(songs.router)


@app.get("/")
async def root():
    return {
        "name": "AI Beat Game Backend",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
    )
