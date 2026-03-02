import sqlite3
from langchain_core.messages import HumanMessage, AIMessage

DB_PATH = "chat_history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_message(session_id: str, role: str, message: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO conversations (session_id, role, message) VALUES (?, ?, ?)",
        (session_id, role, message)
    )
    conn.commit()
    conn.close()

def get_history(session_id: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        "SELECT role, message FROM conversations WHERE session_id = ? ORDER BY timestamp",
        (session_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    history = []
    for role, message in rows:
        if role == "human":
            history.append(HumanMessage(content=message))
        else:
            history.append(AIMessage(content=message))
    return history

def clear_history(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "DELETE FROM conversations WHERE session_id = ?",
        (session_id,)
    )
    conn.commit()
    conn.close()