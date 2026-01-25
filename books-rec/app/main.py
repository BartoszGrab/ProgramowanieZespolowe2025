"""
Book Recommendation Microservice - Netflix Style
FastAPI application with Vector DB powered recommendations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List

from app.models import (
    RecommendationRequest, RecommendationResponse,
    BookInDB
)
from app.recommender import recommendation_engine
from app.vector_db import vector_db
from app.sample_books import get_sample_books
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the vector database with books from Google Books API on startup."""
    from app.google_books import GoogleBooksClient
    
    print(" Starting Book Recommendation Service...")
    
    # Check if database needs initialization
    try:
        count = vector_db.get_collection_count()
        if count == 0:
            print("📚 Database empty - fetching books from Google Books API...")
            
            client = GoogleBooksClient()
            try:
                target_per_language = max(1, settings.DEFAULT_DB_BOOKS_TARGET // 2)
                pl_books = await client.populate_database(
                    language="pl",
                    target_count=target_per_language
                )
                en_books = await client.populate_database(
                    language="en",
                    target_count=target_per_language
                )
                all_books = pl_books + en_books
                
                if all_books:
                    indexed = vector_db.index_books_batch(all_books)
                    print(f"Indexed {indexed} books from Google Books API")
                    print(f"Polish: {len(pl_books)}, English: {len(en_books)}")
                else:
                    # Fallback to sample books if Google API fails
                    print("Google Books API returned no results, using sample books...")
                    books = get_sample_books()
                    indexed = vector_db.index_books_batch(books)
                    print(f"Indexed {indexed} sample books")
            except Exception as e:
                print(f"Google Books API error: {e}")
                print(" Falling back to sample books...")
                books = get_sample_books()
                indexed = vector_db.index_books_batch(books)
                print(f" Indexed {indexed} sample books")
            finally:
                await client.close()
        else:
            print(f" Found {count} books in database")
    except Exception as e:
        print(f" Could not connect to Qdrant: {e}")
        print(" Make sure Qdrant is running: docker run -p 6333:6333 qdrant/qdrant")
    
    yield
    
    print(" Shutting down Book Recommendation Service...")


app = FastAPI(
    title="Book Recommendation API",
    description="Netflix-style book recommendations powered by Vector DB and multilingual embeddings",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        count = vector_db.get_collection_count()
        return {
            "status": "healthy",
            "books_indexed": count
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "hint": "Make sure Qdrant is running"
        }


@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get Netflix-style book recommendations.
    
    Accepts a list of books the user has read and returns categorized
    recommendations in their preferred language.
    
    **Categories returned:**
    - "Because you read [Book]" - similar to last read
    - "Readers who added [Book] also added" - collaborative picks
    - "More from [Author]" - other books by favorite authors
    - "Top [Genre]" - best in preferred genres
    - "Discoveries" - serendipity picks
    """
    try:
        count = vector_db.get_collection_count()
        if count == 0:
            raise HTTPException(
                status_code=503,
                detail="Database is empty. Please index books first using POST /index"
            )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot connect to Qdrant: {str(e)}. Make sure it's running."
        )
    
    recommendations = recommendation_engine.generate_recommendations(request)
    return recommendations


@app.post("/index")
async def index_books(books: List[BookInDB]):
    """
    Add books to the vector database.
    
    Each book should have:
    - id: unique identifier
    - title: book title
    - author: author name
    - description: book description
    - genre: book genre
    - language: 'pl' or 'en'
    - tags: optional list of tags
    """
    if not books:
        raise HTTPException(status_code=400, detail="No books provided")
    
    try:
        count = vector_db.index_books_batch(books)
        return {
            "status": "success",
            "indexed": count,
            "total_in_db": vector_db.get_collection_count()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to index books: {str(e)}"
        )


@app.post("/reset")
async def reset_database():
    """
    Reset the database with sample books.
    
    ⚠️ This will delete all existing books and re-index sample data.
    """
    try:
        vector_db.delete_collection()
        vector_db._ensure_collection()
        
        # Try to populate from Google Books first
        from app.google_books import GoogleBooksClient
        client = GoogleBooksClient()
        try:
            target_per_language = max(1, settings.DEFAULT_DB_BOOKS_TARGET // 2)
            pl_books = await client.populate_database(
                language="pl",
                target_count=target_per_language
            )
            en_books = await client.populate_database(
                language="en",
                target_count=target_per_language
            )
            all_books = pl_books + en_books
            
            if all_books:
                indexed = vector_db.index_books_batch(all_books)
                return {
                    "status": "success",
                    "message": f"Database reset with {indexed} books from Google Books (with covers)"
                }
        except Exception as e:
            print(f"Google Books API error during reset: {e}")
            # Fallback to sample books continues below
        finally:
            await client.close()

        # Fallback
        books = get_sample_books()
        indexed = vector_db.index_books_batch(books)
        
        return {
            "status": "success",
            "message": f"Database reset with {indexed} sample books (Google Books failed)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset database: {str(e)}"
        )


@app.get("/stats")
async def get_stats():
    """Get database statistics."""
    try:
        count = vector_db.get_collection_count()
        return {
            "total_books": count,
            "collection": vector_db.collection_name
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot get stats: {str(e)}"
        )


# ========================
# Google Books API Endpoints
# ========================

from app.google_books import GoogleBooksClient


@app.get("/google-books/search")
async def search_google_books(
    query: str,
    language: str = "pl",
    max_results: int = 20,
    auto_index: bool = False
):
    """
    Search Google Books API.
    
    Args:
        query: Search query (e.g., "fantasy polskie", "Sapkowski")
        language: Language filter ('pl' or 'en')
        max_results: Maximum results (1-40)
        auto_index: If true, automatically add found books to vector DB
    
    Returns:
        List of books found
    """
    client = GoogleBooksClient()
    try:
        books = await client.search_books(query, language, max_results)
        
        result = {
            "query": query,
            "language": language,
            "found": len(books),
            "books": [
                {
                    "title": b.title,
                    "author": b.author,
                    "genre": b.genre,
                    "description": b.description[:200] + "..." if len(b.description) > 200 else b.description
                }
                for b in books
            ]
        }
        
        if auto_index and books:
            indexed = vector_db.index_books_batch(books)
            result["indexed"] = indexed
            result["total_in_db"] = vector_db.get_collection_count()
        
        return result
    finally:
        await client.close()


@app.post("/google-books/populate")
async def populate_from_google_books(
    language: str = "pl",
    books_per_genre: int = 15
):
    """
    Auto-populate database with books from Google Books API.
    
    Fetches books from multiple genres and indexes them automatically.
    
    Args:
        language: Target language ('pl' or 'en')
        books_per_genre: Books to fetch per genre (default 15)
    
    Returns:
        Summary of indexed books
    """
    client = GoogleBooksClient()
    try:
        print(f"📚 Fetching {language.upper()} books from Google Books API...")
        books = await client.populate_database(
            language=language,
            books_per_genre=books_per_genre
        )
        
        if books:
            indexed = vector_db.index_books_batch(books)
            return {
                "status": "success",
                "fetched": len(books),
                "indexed": indexed,
                "total_in_db": vector_db.get_collection_count(),
                "sample_titles": [b.title for b in books[:10]]
            }
        else:
            return {
                "status": "warning",
                "message": "No books found from Google Books API"
            }
    finally:
        await client.close()
