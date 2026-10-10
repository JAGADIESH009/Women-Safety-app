import os
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, ".env")
print(f"Looking for .env file at: {env_path}")

loaded = load_dotenv(dotenv_path=env_path)
print(f".env file loaded successfully: {loaded}")

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    print("STATUS: NOT CONFIGURED (DATABASE_URL is missing)")
else:
    # Safely parse the dialect without exposing credentials
    try:
        scheme = database_url.split("://")[0]
        
        # Apply the same logic as our code
        if scheme == "postgres":
            resolved_scheme = "postgresql+psycopg"
        elif scheme == "postgresql":
            resolved_scheme = "postgresql+psycopg"
        else:
            resolved_scheme = scheme
            
        print("STATUS: CONFIGURED")
        print(f"DIALECT USED: {resolved_scheme}")
    except Exception as e:
        print(f"Error parsing URL: {e}")
