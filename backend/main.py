from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.routers import todo, expenses, jobs  # update if needed
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Routers
app.include_router(todo.router)
app.include_router(expenses.router)
app.include_router(jobs.router)

# Serve static assets (JS, CSS, Images)
app.mount("/assets", StaticFiles(directory="frontend/assets"), name="assets")

# Serve frontend pages
@app.get("/")
def serve_index():
    return FileResponse("frontend/index.html")

@app.get("/expenses")
def serve_expenses():
    return FileResponse("frontend/expenses.html")

@app.get("/todo")
def serve_todo():
    return FileResponse("frontend/todo.html")

@app.get("/jobs")
def serve_jobs():
    return FileResponse("frontend/job_tracker.html")

@app.get("/settings")
def serve_settings():
    return FileResponse("frontend/settings.html")
