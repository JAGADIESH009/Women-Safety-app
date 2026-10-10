import sqlite3
import sys

try:
    conn = sqlite3.connect('RKStorage.db')
    c = conn.cursor()
    c.execute("SELECT value FROM catalystLocalStorage WHERE key='women_safety_contacts'")
    row = c.fetchone()
    if row:
        print(row[0])
    else:
        print("No contacts found.")
except Exception as e:
    print(f"Error: {e}")
