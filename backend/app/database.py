import sqlite3
from langchain_core.messages import HumanMessage, AIMessage
from datetime import datetime
from typing import Optional, List, Dict, Tuple
import secrets
import time

DB_PATH = "chat_history.db"

def init_db():
    """Initialize all database tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Conversations table (existing)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_id INTEGER,
            role TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            customer_id TEXT UNIQUE,
            account_number TEXT,
            role TEXT DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    """)
    
    # Tickets table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            account_number TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'open',
            assigned_to TEXT,
            contact_number TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Postpaid accounts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS postpaid_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            account_number TEXT UNIQUE NOT NULL,
            current_balance REAL DEFAULT 0.0,
            due_date DATE,
            last_payment_amount REAL,
            last_payment_date DATETIME,
            plan_name TEXT,
            monthly_fee REAL,
            data_usage_gb REAL DEFAULT 0.0,
            data_limit_gb REAL,
            status TEXT DEFAULT 'active',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Call logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS call_logs (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            session_id TEXT NOT NULL,
            call_type TEXT NOT NULL,
            duration_seconds INTEGER DEFAULT 0,
            transcript_summary TEXT,
            sentiment TEXT,
            resolved INTEGER DEFAULT 0,
            cost_usd REAL DEFAULT 0.0,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ended_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    conn.commit()
    conn.close()


# ========== CONVERSATION FUNCTIONS (EXISTING) ==========

def save_message(session_id: str, role: str, message: str, user_id: Optional[int] = None):
    """Save a chat message to database"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO conversations (session_id, user_id, role, message) VALUES (?, ?, ?, ?)",
        (session_id, user_id, role, message)
    )
    conn.commit()
    conn.close()


def get_history(session_id: str) -> list:
    """Get chat history for a session"""
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
    """Clear chat history for a session"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "DELETE FROM conversations WHERE session_id = ?",
        (session_id,)
    )
    conn.commit()
    conn.close()


# ========== USER FUNCTIONS ==========

def create_user(username: str, email: str, password_hash: str, 
                customer_id: Optional[str] = None, 
                account_number: Optional[str] = None) -> int:
    """Create a new user and return user_id"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        """INSERT INTO users (username, email, password_hash, customer_id, account_number) 
           VALUES (?, ?, ?, ?, ?)""",
        (username, email, password_hash, customer_id, account_number)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return user_id


def get_user_by_username(username: str) -> Optional[Dict]:
    """Get user by username"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_id(user_id: int) -> Optional[Dict]:
    """Get user by ID"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_user_login(user_id: int):
    """Update last login timestamp"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "UPDATE users SET last_login = ? WHERE id = ?",
        (datetime.utcnow(), user_id)
    )
    conn.commit()
    conn.close()


# ========== TICKET FUNCTIONS ==========

def generate_ticket_id() -> str:
    """Generate unique ticket ID: TKT-{timestamp}-{random}"""
    timestamp = int(time.time())
    random_suffix = secrets.token_hex(3).upper()
    return f"TKT-{timestamp}-{random_suffix}"


def create_ticket(user_id: int, account_number: str, title: str, 
                  description: str, category: str, priority: str, 
                  contact_number: str) -> str:
    """Create a new support ticket"""
    ticket_id = generate_ticket_id()
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """INSERT INTO tickets 
           (id, user_id, account_number, title, description, category, priority, contact_number)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (ticket_id, user_id, account_number, title, description, category, priority, contact_number)
    )
    conn.commit()
    conn.close()
    return ticket_id


def get_tickets(user_id: int, page: int = 1, page_size: int = 20) -> Tuple[List[Dict], int]:
    """Get paginated tickets for a user"""
    offset = (page - 1) * page_size
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    # Get total count
    cursor = conn.execute(
        "SELECT COUNT(*) as count FROM tickets WHERE user_id = ?",
        (user_id,)
    )
    total = cursor.fetchone()["count"]
    
    # Get paginated tickets
    cursor = conn.execute(
        """SELECT * FROM tickets WHERE user_id = ? 
           ORDER BY created_at DESC LIMIT ? OFFSET ?""",
        (user_id, page_size, offset)
    )
    tickets = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tickets, total


def get_ticket_by_id(ticket_id: str, user_id: int) -> Optional[Dict]:
    """Get specific ticket (user must own it)"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(
        "SELECT * FROM tickets WHERE id = ? AND user_id = ?",
        (ticket_id, user_id)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_ticket(ticket_id: str, user_id: int, updates: Dict) -> bool:
    """Update ticket fields"""
    if not updates:
        return False
    
    # Automatically update updated_at
    updates["updated_at"] = datetime.utcnow()
    
    # If status changed to resolved/closed, set resolved_at
    if updates.get("status") in ["resolved", "closed"] and "resolved_at" not in updates:
        updates["resolved_at"] = datetime.utcnow()
    
    set_clause = ", ".join([f"{key} = ?" for key in updates.keys()])
    values = list(updates.values()) + [ticket_id, user_id]
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        f"UPDATE tickets SET {set_clause} WHERE id = ? AND user_id = ?",
        values
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def delete_ticket(ticket_id: str, user_id: int) -> bool:
    """Delete a ticket (user must own it)"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        "DELETE FROM tickets WHERE id = ? AND user_id = ?",
        (ticket_id, user_id)
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


# ========== POSTPAID BALANCE FUNCTIONS ==========

def get_postpaid_balance(user_id: int, account_number: str) -> Optional[Dict]:
    """Get postpaid balance for user's account"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(
        "SELECT * FROM postpaid_accounts WHERE user_id = ? AND account_number = ?",
        (user_id, account_number)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def upsert_postpaid_balance(user_id: int, account_number: str, balance_data: Dict):
    """Insert or update postpaid balance information"""
    conn = sqlite3.connect(DB_PATH)
    balance_data["updated_at"] = datetime.utcnow()
    
    # Check if exists
    cursor = conn.execute(
        "SELECT id FROM postpaid_accounts WHERE user_id = ? AND account_number = ?",
        (user_id, account_number)
    )
    exists = cursor.fetchone()
    
    if exists:
        # Update
        set_clause = ", ".join([f"{key} = ?" for key in balance_data.keys()])
        values = list(balance_data.values()) + [user_id, account_number]
        conn.execute(
            f"UPDATE postpaid_accounts SET {set_clause} WHERE user_id = ? AND account_number = ?",
            values
        )
    else:
        # Insert
        balance_data["user_id"] = user_id
        balance_data["account_number"] = account_number
        columns = ", ".join(balance_data.keys())
        placeholders = ", ".join(["?" for _ in balance_data])
        conn.execute(
            f"INSERT INTO postpaid_accounts ({columns}) VALUES ({placeholders})",
            list(balance_data.values())
        )
    
    conn.commit()
    conn.close()


# ========== CALL LOG FUNCTIONS ==========

def create_call_log(user_id: int, session_id: str, call_type: str) -> str:
    """Create a new call log entry"""
    call_id = f"CALL-{int(time.time())}-{secrets.token_hex(3).upper()}"
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """INSERT INTO call_logs (id, user_id, session_id, call_type)
           VALUES (?, ?, ?, ?)""",
        (call_id, user_id, session_id, call_type)
    )
    conn.commit()
    conn.close()
    return call_id


def update_call_log(call_id: str, updates: Dict):
    """Update call log with summary, duration, etc."""
    if not updates:
        return
    
    set_clause = ", ".join([f"{key} = ?" for key in updates.keys()])
    values = list(updates.values()) + [call_id]
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        f"UPDATE call_logs SET {set_clause} WHERE id = ?",
        values
    )
    conn.commit()
    conn.close()


def get_call_logs(user_id: int, limit: int = 20) -> List[Dict]:
    """Get user's call history"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.execute(
        """SELECT * FROM call_logs WHERE user_id = ? 
           ORDER BY started_at DESC LIMIT ?""",
        (user_id, limit)
    )
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return logs