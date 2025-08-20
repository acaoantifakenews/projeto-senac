import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    NEWS_API_KEY = os.getenv("NEWS_API_KEY")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./news_checker.db")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Application
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # External APIs
    FACT_CHECK_SOURCES = [
        "https://www.snopes.com",
        "https://www.factcheck.org",
        "https://www.politifact.com",
        "https://checkyourfact.com"
    ]
    
    # Credible News Sources (Brazilian focus)
    CREDIBLE_SOURCES = [
        "g1.globo.com",
        "folha.uol.com.br",
        "estadao.com.br",
        "uol.com.br",
        "bbc.com",
        "reuters.com",
        "agenciabrasil.ebc.com.br"
    ]
    
    # Suspicious patterns
    FAKE_NEWS_INDICATORS = [
        "URGENTE",
        "BOMBA",
        "EXCLUSIVO",
        "MÍDIA NÃO MOSTRA",
        "COMPARTILHE ANTES QUE APAGUEM"
    ]

settings = Settings()
