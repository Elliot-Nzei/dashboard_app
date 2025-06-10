# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import todo, expenses, job_tracker  # import all routers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todo.router)
app.include_router(expenses.router)
app.include_router(job_tracker.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}
