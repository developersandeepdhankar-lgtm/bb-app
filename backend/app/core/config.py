from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    DB_URL = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:"
        f"{os.getenv('DB_PASSWORD')}@"
        f"{os.getenv('DB_HOST')}/"
        f"{os.getenv('DB_NAME')}"
    )

    # 🔥 HARD-CODE FOR DEBUG (NO ENV)
    SECRET_KEY = "dashboard-debug-secret-key"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440

settings = Settings()
