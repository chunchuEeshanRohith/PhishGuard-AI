import os
import sqlite3
from datetime import datetime
from config import Config


def get_db_connection():
    db_path = Config.DATABASE_PATH
    dir_name = os.path.dirname(db_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            replied_at TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def insert_enquiry(email, message):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ")
    cursor.execute("""
        INSERT INTO enquiries (email, message, status, created_at, updated_at)
        VALUES (?, ?, 'unread', ?, ?)
    """, (email, message, now, now))
    enquiry_id = cursor.lastrowid
    conn.commit()
    cursor.execute("SELECT * FROM enquiries WHERE id = ?", (enquiry_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_enquiries(status_filter=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if status_filter and status_filter.lower() != 'all':
        cursor.execute("""
            SELECT * FROM enquiries
            WHERE LOWER(status) = LOWER(?)
            ORDER BY datetime(created_at) DESC, id DESC
        """, (status_filter,))
    else:
        cursor.execute("""
            SELECT * FROM enquiries
            ORDER BY datetime(created_at) DESC, id DESC
        """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_enquiry_by_id(enquiry_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM enquiries WHERE id = ?", (enquiry_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_enquiry_status(enquiry_id, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ")
    if status == 'replied':
        cursor.execute("""
            UPDATE enquiries
            SET status = ?, updated_at = ?, replied_at = ?
            WHERE id = ?
        """, (status, now, now, enquiry_id))
    else:
        cursor.execute("""
            UPDATE enquiries
            SET status = ?, updated_at = ?
            WHERE id = ?
        """, (status, now, enquiry_id))
    conn.commit()
    cursor.execute("SELECT * FROM enquiries WHERE id = ?", (enquiry_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_enquiry_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) AS total FROM enquiries")
    total = cursor.fetchone()["total"]
    cursor.execute("SELECT COUNT(*) AS unread FROM enquiries WHERE status = 'unread'")
    unread = cursor.fetchone()["unread"]
    cursor.execute("SELECT COUNT(*) AS replied FROM enquiries WHERE status = 'replied'")
    replied = cursor.fetchone()["replied"]
    cursor.execute("SELECT COUNT(*) AS read_count FROM enquiries WHERE status = 'read'")
    read_count = cursor.fetchone()["read_count"]
    conn.close()
    return {
        "total": total,
        "unread": unread,
        "read": read_count,
        "replied": replied
    }
