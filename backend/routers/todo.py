from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
import json
import os
from typing import List, Optional
from backend.utils import load_todos  # You need to implement this if not present

router = APIRouter(prefix="/api/todo", tags=["todo"])
TODO_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'todo.json')

class TodoItem(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    text: Optional[str] = None
    completed: bool = False

def read_tasks() -> List[dict]:
    if not os.path.exists(TODO_FILE):
        return []
    try:
        with open(TODO_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def write_tasks(tasks: List[dict]):
    os.makedirs(os.path.dirname(TODO_FILE), exist_ok=True)
    with open(TODO_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2)

@router.get("/", response_model=List[TodoItem])
def get_todos():
    return read_tasks()

@router.post("/", response_model=TodoItem, status_code=201)
def add_task(task: TodoItem = Body(...)):
    tasks = read_tasks()
    # Use 'title' or 'text' as the main field
    task_title = task.title or task.text or ""
    # Prevent duplicates by title/text
    if any((t.get('title') == task_title or t.get('text') == task_title) for t in tasks):
        raise HTTPException(status_code=400, detail="Task with this title/text already exists")
    # Auto-increment id
    new_id = max([t.get("id", 0) for t in tasks], default=0) + 1
    task.id = new_id
    # Store both 'title' and 'text' for compatibility
    task_dict = task.dict()
    if not task_dict.get("title") and task_dict.get("text"):
        task_dict["title"] = task_dict["text"]
    if not task_dict.get("text") and task_dict.get("title"):
        task_dict["text"] = task_dict["title"]
    tasks.append(task_dict)
    write_tasks(tasks)
    return task_dict

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int):
    tasks = read_tasks()
    updated = [t for t in tasks if t.get('id') != task_id]
    if len(updated) == len(tasks):
        raise HTTPException(status_code=404, detail="Task not found")
    write_tasks(updated)
    return

@router.put("/{task_id}", response_model=TodoItem)
def update_task(task_id: int, updated: TodoItem = Body(...)):
    tasks = read_tasks()
    for idx, task in enumerate(tasks):
        if task.get("id") == task_id:
            # Update title/text and completed
            if updated.title or updated.text:
                new_text = updated.title or updated.text
                # Prevent duplicates
                if any((t.get('id') != task_id and (t.get('title') == new_text or t.get('text') == new_text)) for t in tasks):
                    raise HTTPException(status_code=400, detail="Task with this title/text already exists")
                task["title"] = new_text
                task["text"] = new_text
            if updated.completed is not None:
                task["completed"] = updated.completed
            tasks[idx] = task
            write_tasks(tasks)
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@router.get("/pending_followups")
async def get_pending_followups():
    tasks = load_todos()
    # Example: tasks with "follow-up" in tags and not completed
    pending = [
        t for t in tasks
        if "follow-up" in t.get("tags", []) and not t.get("completed", False)
    ]
    return {"count": len(pending)}
