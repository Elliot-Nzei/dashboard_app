from fastapi import APIRouter
from backend.utils import load_jobs
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/job_tracker", tags=["job_tracker"])

@router.get("/weekly_activity")
async def get_weekly_activity():
    jobs = load_jobs()
    today = datetime.now().date()
    week_days = [(today - timedelta(days=i)).strftime("%a") for i in reversed(range(7))]
    counts = {day: 0 for day in week_days}
    for job in jobs:
        job_date = datetime.strptime(job["date"], "%Y-%m-%d").date()
        day_str = job_date.strftime("%a")
        if day_str in counts:
            counts[day_str] += 1
    return {"labels": week_days, "data": [counts[day] for day in week_days]}