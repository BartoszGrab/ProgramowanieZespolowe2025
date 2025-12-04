"""
Google Books API client for fetching book data.
Allows automatic population of the vector database with real books.
"""

import httpx
from typing import List, Optional, Dict, Any
import uuid

from app.models import BookInDB
from app.config import settings


class GoogleBooksClient:
    """Client for Google Books API."""
    
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def search_books(
        self,
        query: str,
        language: str = "pl",
        max_results: int = 20
    ) -> List[BookInDB]:
        """
        Search for books using Google Books API.
        
        Args:
            query: Search query (e.g., "fantasy polskie", "sci-fi")
            language: Language filter ('pl' or 'en')
            max_results: Maximum number of results
        
        Returns:
            List of BookInDB objects ready for indexing
        """
        # Map language code to Google Books langRestrict
        lang_map = {"pl": "pl", "en": "en"}
        lang_restrict = lang_map.get(language, "pl")
        
        params = {
            "q": query,
            "langRestrict": lang_restrict,
            "maxResults": min(max_results, 40),  # API limit is 40
            "printType": "books",
            "orderBy": "relevance"
        }
        
        try:
            response = await self.client.get(self.BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            print(f"Google Books API error: {e}")
            return []
        
        books = []
        items = data.get("items", [])
        
        for item in items:
            book = self._parse_volume(item, language)
            if book:
                books.append(book)
        
        return books
    
    def _parse_volume(self, item: Dict[str, Any], language: str) -> Optional[BookInDB]:
        """Parse a Google Books volume into BookInDB."""
        volume_info = item.get("volumeInfo", {})
        
        title = volume_info.get("title")
        authors = volume_info.get("authors", [])
        
        if not title or not authors:
            return None
        
        # Get description or create one from other fields
        description = volume_info.get("description", "")
        if not description:
            subtitle = volume_info.get("subtitle", "")
            description = subtitle if subtitle else f"Książka autorstwa {', '.join(authors)}"
        
        # Truncate long descriptions
        if len(description) > 500:
            description = description[:497] + "..."
        
        # Get categories/genres
        categories = volume_info.get("categories", [])
        genre = categories[0] if categories else "Fiction"
        
        # Map common English genre names to Polish if needed
        if language == "pl":
            genre_map = {
                "Fiction": "Proza",
                "Fantasy": "Fantasy",
                "Science Fiction": "Sci-Fi",
                "Mystery": "Kryminał",
                "Thriller": "Thriller",
                "Romance": "Romans",
                "Horror": "Horror",
                "Biography": "Biografia",
                "History": "Historia"
            }
            genre = genre_map.get(genre, genre)
        
        return BookInDB(
            id=str(uuid.uuid4()),
            title=title,
            author=authors[0],  # Primary author
            description=description,
            genre=genre,
            language=language,
            tags=[cat.lower() for cat in categories[:3]]
        )
    
    async def search_by_genre(
        self,
        genre: str,
        language: str = "pl",
        max_results: int = 20
    ) -> List[BookInDB]:
        """Search for books by genre."""
        query = f"subject:{genre}"
        return await self.search_books(query, language, max_results)
    
    async def search_by_author(
        self,
        author: str,
        language: str = "pl",
        max_results: int = 10
    ) -> List[BookInDB]:
        """Search for books by author."""
        query = f"inauthor:{author}"
        return await self.search_books(query, language, max_results)
    
    async def populate_database(
        self,
        authors: List[str] = None,
        language: str = "pl",
        books_per_author: int = 10
    ) -> List[BookInDB]:
        """
        Fetch books by popular authors to populate the database.
        
        Args:
            authors: List of authors to search. Defaults to popular authors.
            language: Target language
            books_per_author: Number of books per author
        
        Returns:
            All fetched books (without duplicates)
        """
        if authors is None:
            if language == "pl":
                # Popular Polish and translated authors
                authors = [
                    "Andrzej Sapkowski",
                    "Stanisław Lem",
                    "Jarosław Grzędowicz",
                    "Jacek Dukaj",
                    "Anna Kańtoch",
                    "Remigiusz Mróz",
                    "Zygmunt Miłoszewski",
                    "Olga Tokarczuk",
                    "Stephen King",
                    "Brandon Sanderson",
                    "Frank Herbert",
                    "George R.R. Martin",
                    "J.R.R. Tolkien",
                    "Liu Cixin",
                    "Agatha Christie"
                ]
            else:
                # Popular English authors
                authors = [
                    "Brandon Sanderson",
                    "J.R.R. Tolkien",
                    "George R.R. Martin",
                    "Stephen King",
                    "Frank Herbert",
                    "Isaac Asimov",
                    "Patrick Rothfuss",
                    "Andy Weir",
                    "Agatha Christie",
                    "Dan Brown",
                    "Neil Gaiman",
                    "Terry Pratchett",
                    "Robert Jordan",
                    "Joe Abercrombie",
                    "Ursula K. Le Guin"
                ]
        
        all_books: Dict[str, BookInDB] = {}  # Use title as key to avoid duplicates
        
        for author in authors:
            books = await self.search_by_author(
                author=author,
                language=language,
                max_results=books_per_author
            )
            
            for book in books:
                if book.title not in all_books:
                    all_books[book.title] = book
            
            print(f"   📖 {author}: {len(books)} books")
        
        return list(all_books.values())
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Factory function for dependency injection
async def get_google_books_client():
    client = GoogleBooksClient()
    try:
        yield client
    finally:
        await client.close()
