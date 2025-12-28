import os
try:
    os.remove("backend/onlywar.db")
    print("DB Removed")
except FileNotFoundError:
    print("DB not found")