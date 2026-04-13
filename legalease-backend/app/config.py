import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "changethissecretkeyinproduction123456")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
FILE_ENCRYPTION_KEY = os.getenv("FILE_ENCRYPTION_KEY", "")
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")