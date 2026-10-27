import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'fastapi_server', 'deficiencies.db')

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM deficiency_logs")
    conn.commit()
    conn.close()
    print("deficiencies.db successfully reset to pristine beginning state (0 records).")
else:
    print("Database file not found.")
