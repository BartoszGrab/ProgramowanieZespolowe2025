"""
Netflix-style Book Recommendation Engine.
Generates categorized recommendations like "Because you read X", "Top in Genre", etc.
"""

from typing import List, Dict, Any, Optional, Set
from collections import Counter

from app.models import (
    BookInput, RecommendationRequest, RecommendationResponse,
    RecommendationCategory, RecommendedBook
)
from app.vector_db import vector_db
from app.embeddings import embedding_service
from app.config import settings


class RecommendationEngine:
    """Netflix-style recommendation engine."""
    
    def __init__(self):
        self.max_per_category = settings.MAX_RECOMMENDATIONS_PER_CATEGORY
    
    def generate_recommendations(
        self, 
        request: RecommendationRequest
    ) -> RecommendationResponse:
        """
        Generate Netflix-style categorized recommendations.
        
        Creates multiple "shelves" (categories) of recommendations:
        1. "Because you read [Last Book]" - similar to most recent read
        2. "More from [Author]" - if user read multiple by same author
        3. "Top [Genre]" - based on user's preferred genres
        4. "Discoveries" - serendipity picks slightly outside comfort zone
        """
        history = request.history
        language = request.preferred_language
        
        # Get titles to exclude (already read)
        read_titles = {book.title for book in history}
        
        categories: List[RecommendationCategory] = []
        used_titles: Set[str] = set(read_titles)
        
        # 1. "Because you read [Last Book]"
        last_book = history[-1]
        similar_category = self._get_similar_to_book(
            last_book, language, used_titles
        )
        if similar_category.items:
            categories.append(similar_category)
            used_titles.update(item.title for item in similar_category.items)
        
        # 2. "More from [Author]" - if author appears multiple times
        author_counts = Counter(book.author for book in history)
        for author, count in author_counts.most_common(2):
            if count >= 1:  # Show even for single book by author
                author_category = self._get_by_author(
                    author, language, used_titles
                )
                if author_category.items:
                    categories.append(author_category)
                    used_titles.update(item.title for item in author_category.items)
        
        # 3. "Top [Genre]" - based on user's genres
        genre_counts = Counter(
            book.genre for book in history 
            if book.genre
        )
        for genre, _ in genre_counts.most_common(2):
            genre_category = self._get_by_genre(
                genre, language, used_titles
            )
            if genre_category.items:
                categories.append(genre_category)
                used_titles.update(item.title for item in genre_category.items)
        
        # 4. "Discoveries" - serendipity picks
        discovery_category = self._get_discoveries(
            history, language, used_titles
        )
        if discovery_category.items:
            categories.append(discovery_category)
        
        return RecommendationResponse(recommendations=categories)
    
    def _get_similar_to_book(
        self,
        book: BookInput,
        language: str,
        exclude_titles: Set[str]
    ) -> RecommendationCategory:
        """Get books similar to a specific book."""
        # Create search query from book
        query = embedding_service.create_book_embedding_text(
            title=book.title,
            author=book.author,
            genre=book.genre or "",
            description=""
        )
        
        results = vector_db.search_similar(
            query_text=query,
            language=language,
            limit=self.max_per_category,
            exclude_titles=list(exclude_titles)
        )
        
        items = [
            RecommendedBook(
                title=r["title"],
                author=r["author"],
                description=r.get("description"),
                genre=r.get("genre"),
                language=r["language"],
                match_score=round(r["score"], 2)
            )
            for r in results
            if r["score"] >= settings.SIMILARITY_THRESHOLD
        ]
        
        # Localized category title
        if language == "pl":
            title = f"Ponieważ czytałeś: {book.title}"
        else:
            title = f"Because you read: {book.title}"
        
        return RecommendationCategory(
            category_title=title,
            type="content_similarity",
            items=items
        )
    
    def _get_by_author(
        self,
        author: str,
        language: str,
        exclude_titles: Set[str]
    ) -> RecommendationCategory:
        """Get more books by a specific author."""
        results = vector_db.search_by_author(
            author=author,
            language=language,
            limit=self.max_per_category,
            exclude_titles=list(exclude_titles)
        )
        
        items = [
            RecommendedBook(
                title=r["title"],
                author=r["author"],
                description=r.get("description"),
                genre=r.get("genre"),
                language=r["language"],
                match_score=round(r["score"], 2)
            )
            for r in results
            if r["score"] >= settings.SIMILARITY_THRESHOLD
        ]
        
        # Localized category title
        if language == "pl":
            title = f"Więcej od: {author}"
        else:
            title = f"More from: {author}"
        
        return RecommendationCategory(
            category_title=title,
            type="author_based",
            items=items
        )
    
    def _get_by_genre(
        self,
        genre: str,
        language: str,
        exclude_titles: Set[str]
    ) -> RecommendationCategory:
        """Get top books in a specific genre."""
        results = vector_db.search_by_genre(
            genre=genre,
            language=language,
            limit=self.max_per_category,
            exclude_titles=list(exclude_titles)
        )
        
        items = [
            RecommendedBook(
                title=r["title"],
                author=r["author"],
                description=r.get("description"),
                genre=r.get("genre"),
                language=r["language"],
                match_score=round(r["score"], 2)
            )
            for r in results
            if r["score"] >= settings.SIMILARITY_THRESHOLD
        ]
        
        # Localized category title
        if language == "pl":
            title = f"Topowe {genre} po polsku"
        else:
            title = f"Top {genre} books"
        
        return RecommendationCategory(
            category_title=title,
            type="genre_top",
            items=items
        )
    
    def _get_discoveries(
        self,
        history: List[BookInput],
        language: str,
        exclude_titles: Set[str]
    ) -> RecommendationCategory:
        """Get serendipity picks - books slightly outside comfort zone."""
        # Create a diversified query from all history
        all_titles = " | ".join(book.title for book in history)
        
        # Search with a broader query
        results = vector_db.search_similar(
            query_text=f"Diverse interesting books like {all_titles}",
            language=language,
            limit=self.max_per_category * 2,  # Get more to filter
            exclude_titles=list(exclude_titles)
        )
        
        # Filter to get books that are similar but not too similar
        # (serendipity means finding good things not actively sought)
        items = []
        for r in results:
            score = r["score"]
            # Looking for moderate similarity (not too close, not too far)
            if 0.4 <= score <= 0.75:
                items.append(
                    RecommendedBook(
                        title=r["title"],
                        author=r["author"],
                        description=r.get("description"),
                        genre=r.get("genre"),
                        language=r["language"],
                        match_score=round(score, 2)
                    )
                )
                if len(items) >= self.max_per_category:
                    break
        
        # Localized category title
        if language == "pl":
            title = "Odkrycia dla Ciebie"
        else:
            title = "Discoveries for You"
        
        return RecommendationCategory(
            category_title=title,
            type="serendipity",
            items=items
        )


# Singleton instance
recommendation_engine = RecommendationEngine()
