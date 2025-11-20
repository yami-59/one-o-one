from fastapi import FastAPI, Depends, HTTPException
from typing import List
from sqlmodel import select, Session
from .models import Task
from .db import init_db, get_session
import uvicorn

app = FastAPI(title="Task Manager API (PostgreSQL)")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/tasks", response_model=List[Task])
def list_tasks(session: Session = Depends(get_session)):
    return session.exec(select(Task)).all()

@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task

@app.post("/tasks", response_model=Task)
def create_task(task: Task, session: Session = Depends(get_session)):
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, data: Task, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    task.title = data.title
    task.description = data.description
    task.completed = data.completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    session.delete(task)
    session.commit()
    return {"message": "Task deleted successfully"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
