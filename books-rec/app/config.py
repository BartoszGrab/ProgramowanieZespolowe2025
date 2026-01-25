import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(env_file=".env")
    
    # Qdrant settings
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "books"
    
    # Embedding model - multilingual for PL/EN support
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"
    EMBEDDING_DIMENSION: int = 384
    
    # Recommendation settings
    MAX_RECOMMENDATIONS_PER_CATEGORY: int = 5
    SIMILARITY_THRESHOLD: float = 0.3
<<<<<<< HEAD
=======
    COOCCURRENCE_WEIGHT: float = 0.7
    RATING_WEIGHT: float = 0.3
    PEOPLE_ALSO_MIN_AVG_RATING: float = 3.0

    # Database initialization
    DEFAULT_DB_BOOKS_TARGET: int = 10000
>>>>>>> dev


settings = Settings()
