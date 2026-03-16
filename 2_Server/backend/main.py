import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from backend.routes.verify import router as verify_router
from backend.routes.admin import router as admin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes — completely separate from static files
app.include_router(verify_router, prefix="/api")
app.include_router(admin_router,  prefix="/api")

# Redirect / → /ui (the dashboard)
@app.get("/")
def root():
    return RedirectResponse(url="/ui/index.html")

# Static files ONLY at /ui — never touches /api/*
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "out")
if os.path.exists(STATIC_DIR):
    app.mount("/ui", StaticFiles(directory=STATIC_DIR, html=True), name="static")
