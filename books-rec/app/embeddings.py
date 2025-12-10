from functools import lru_cache
from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

from app.config import settings


class EmbeddingService:
    """Service for generating multilingual text embeddings."""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _get_model(self) -> SentenceTransformer:
        """Lazy load the embedding model."""
        if self._model is None:
            print(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return self._model
    
    def encode(self, text: str) -> List[float]:
        """
        Generate embedding vector for a single text.
        
        The multilingual model understands both Polish and English,
        mapping semantically similar concepts close together regardless of language.
        """
        model = self._get_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts at once (more efficient)."""
        model = self._get_model()
        embeddings = model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    
    def create_book_embedding_text(self, title: str, author: str, 
                                    description: str = "", genre: str = "") -> str:
        """
        Create a rich text representation of a book for embedding.
        Combines title, author, genre and description for better semantic matching.
        """
        parts = [title, f"by {author}"]
        if genre:
            parts.append(f"Genre: {genre}")
        if description:
            parts.append(description)
        return " | ".join(parts)


# Singleton instance
embedding_service = EmbeddingService()
