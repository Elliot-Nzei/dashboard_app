# README.md
# User Dashboard App

This project is a full-stack personal dashboard application featuring:
- A profile sidebar
- To-Do list manager
- Job application tracker
- Expense tracker with summary

## Project Structure
See `project_root/` above.

## Setup Instructions
1. Clone the repo
2. Run `make init` to set up folders and data files
3. Run `make run` to start the FastAPI backend
4. Open `frontend/index.html` in a browser or serve via static

## Dependencies
- Python 3.10+
- FastAPI
- Uvicorn

Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage
- Use `/todo`, `/jobs`, and `/expenses` APIs to manage data
- UI updates dynamically using JS fetch

## Future
- Add user authentication
- Migrate from JSON to SQLite for production

# requirements.txt
fastapi
uvicorn
