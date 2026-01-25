from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct,
    Filter, FieldCondition, MatchValue
)
import uuid

from app.config import settings
from app.embeddings import embedding_service
from app.models import BookInDB


class VectorDBService:
    """Service for managing book vectors in Qdrant."""
    
    def __init__(self):
        self.client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT
        )
        self.collection_name = settings.QDRANT_COLLECTION
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Create the books collection if it doesn't exist."""
        collections = self.client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if self.collection_name not in collection_names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=settings.EMBEDDING_DIMENSION,
                    distance=Distance.COSINE
                )
            )
            print(f"Created collection: {self.collection_name}")
    
    def index_book(self, book: BookInDB) -> str:
        """
        Add a book to the vector database.
        Returns the book's ID.
        """
        # Create embedding text from book data
        embedding_text = embedding_service.create_book_embedding_text(
            title=book.title,
            author=book.author,
            description=book.description,
            genre=book.genre
        )
        
        # Generate embedding vector
        vector = embedding_service.encode(embedding_text)
        
        # Create point with metadata
        point = PointStruct(
            id=book.id,
            vector=vector,
            payload={
                "title": book.title,
                "author": book.author,
                "description": book.description,
                "genre": book.genre,
                "cover_url": book.cover_url,
                "language": book.language,
                "tags": book.tags
            }
        )
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=[point]
        )
        
        return book.id
    
    def index_books_batch(self, books: List[BookInDB]) -> int:
        """Index multiple books at once. Returns count of indexed books."""
        if not books:
            return 0
        
        # Prepare embedding texts
        embedding_texts = [
            embedding_service.create_book_embedding_text(
                title=b.title, author=b.author,
                description=b.description, genre=b.genre
            )
            for b in books
        ]
        
        # Generate all embeddings at once
        vectors = embedding_service.encode_batch(embedding_texts)
        
        # Create points
        points = [
            PointStruct(
                id=book.id,
                vector=vector,
                payload={
                    "title": book.title,
                    "author": book.author,
                    "description": book.description,
                    "genre": book.genre,
                    "cover_url": book.cover_url,
                    "language": book.language,
                    "tags": book.tags
                }
            )
            for book, vector in zip(books, vectors)
        ]
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        
        return len(points)
    
    def search_similar(
        self,
        query_text: str,
        language: Optional[str] = None,
        genre: Optional[str] = None,
        limit: int = 5,
        exclude_titles: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for books similar to the query text.
        
        Args:
            query_text: Text to find similar books for (title, author, description)
            language: Filter by language ('pl' or 'en')
            genre: Filter by genre
            limit: Maximum number of results
            exclude_titles: Titles to exclude from results
        
        Returns:
            List of matching books with scores
        """
        # Generate query vector
        query_vector = embedding_service.encode(query_text)
        
        # Build filter conditions
        filter_conditions = []
        
        if language:
            filter_conditions.append(
                FieldCondition(
                    key="language",
                    match=MatchValue(value=language)
                )
            )
        
        if genre:
            filter_conditions.append(
                FieldCondition(
                    key="genre",
                    match=MatchValue(value=genre)
                )
            )
        
        # Create filter if we have conditions
        query_filter = Filter(must=filter_conditions) if filter_conditions else None
        
        # Search using query_points (new API in qdrant-client >= 1.12)
        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=limit + (len(exclude_titles) if exclude_titles else 0)
        )
        
        # Filter out excluded titles and format results
        books = []
        for hit in results.points:
            title = hit.payload.get("title", "")
            if exclude_titles and title in exclude_titles:
                continue
            
            books.append({
                "id": hit.id,
                "title": title,
                "author": hit.payload.get("author", ""),
                "description": hit.payload.get("description", ""),
                "genre": hit.payload.get("genre", ""),
                "cover_url": hit.payload.get("cover_url"),
                "language": hit.payload.get("language", ""),
                "tags": hit.payload.get("tags", []),
                "score": hit.score
            })
            
            if len(books) >= limit:
                break
        
        return books
    
    def search_by_author(
        self,
        author: str,
        language: Optional[str] = None,
        limit: int = 5,
        exclude_titles: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Search for books by the same author, using semantic similarity."""
        query_text = f"Books by {author}"
        return self.search_similar(
            query_text=query_text,
            language=language,
            limit=limit,
            exclude_titles=exclude_titles
        )
    
    def search_by_genre(
        self,
        genre: str,
        language: Optional[str] = None,
        limit: int = 5,
        exclude_titles: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Search for top books in a specific genre."""
        return self.search_similar(
            query_text=f"Best {genre} books",
            language=language,
            genre=genre,
            limit=limit,
            exclude_titles=exclude_titles
        )
    
    def get_collection_count(self) -> int:
        """Get the number of books in the collection."""
        info = self.client.get_collection(self.collection_name)
        return info.points_count
    
    def delete_collection(self):
        """Delete the entire collection (use with caution!)."""
        self.client.delete_collection(self.collection_name)


# Singleton instance
vector_db = VectorDBService()
