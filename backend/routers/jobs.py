# routers/jobs.py
from fastapi import APIRouter
from models import JobApplication
from database import load_json, save_json

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/")
def get_jobs():
    return load_json("data/jobs.json")

@router.post("/")
def add_job(job: JobApplication):
    jobs = load_json("data/jobs.json")
    jobs.append(job.dict())
    save_json("data/jobs.json", jobs)
    return {"message": "Job added"}
