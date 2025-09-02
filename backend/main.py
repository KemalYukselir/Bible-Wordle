# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from verse_today import get_verse
from playerbase_score import get_playerbase_guess_count as get_guess_count_func, set_playerbase_guess_count as set_guess_count_func


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["https://versele.org", "http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Method for waiting on ping on website load.
@app.get("/")
def health_check():
    return {"status": "ok"} 

@app.get("/today")
def today():
    """Return today's verse"""
    verse = get_verse()
    return verse

@app.get("/get_guess_count")
def get_guess_count():
    """Return number of people who guessed today"""
    """ Has to be padded a bit in beta """
    count = get_guess_count_func()
    return {"count": count}

@app.get("/set_guess_count")
def set_playerbase_guess_count():
    """Set the number of people who guessed today"""
    """ Has to be padded a bit in beta """
    set_guess_count_func()