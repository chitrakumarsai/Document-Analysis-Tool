import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    OPENAI_ENDPOINT: str = os.getenv("OPENAI_ENDPOINT")
    OPENAI_DEPLOYMENT_NAME: str = os.getenv("OPENAI_DEPLOYMENT_NAME")
    OPENAI_API_VERSION: str = os.getenv("OPENAI_API_VERSION", "2024-10-21")
    OPENAI_KEY: str = os.getenv("OPENAI_KEY")

settings = Settings()