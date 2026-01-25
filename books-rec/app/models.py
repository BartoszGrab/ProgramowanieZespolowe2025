from typing import Optional, List
from pydantic import BaseModel, Field


# Input Models
class BookInput(BaseModel):
    """A book from user's reading history."""
    title: str = Field(..., description="Book title")
    author: str = Field(..., description="Author name")
    genre: Optional[str] = Field(None, description="Book genre (e.g., Fantasy, Sci-Fi)")
    rating: Optional[int] = Field(None, ge=1, le=5, description="User rating 1-5")


class RecommendationRequest(BaseModel):
    """Request for book recommendations."""
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    preferred_language: str = Field("pl", description="Target language for recommendations (pl/en)")
    history: List[BookInput] = Field(..., min_length=1, description="List of books user has read")


# Output Models
class RecommendedBook(BaseModel):
    """A recommended book."""
    title: str
    author: str
    description: Optional[str] = None
    genre: Optional[str] = None
    language: str
    match_score: float = Field(..., ge=0.0, le=1.0)


class RecommendationCategory(BaseModel):
    """A Netflix-style recommendation category (shelf)."""
    category_title: str = Field(..., description="e.g., 'Ponieważ lubisz Andrzeja Sapkowskiego'")
    type: str = Field(
        ...,
        description="Category type: content_similarity, author_based, genre_top, serendipity, people_also_added"
    )
    items: List[RecommendedBook] = Field(default_factory=list)


class RecommendationResponse(BaseModel):
    """Full recommendation response with multiple categories."""
    recommendations: List[RecommendationCategory] = Field(default_factory=list)


# Database Models
class BookInDB(BaseModel):
    """Book stored in the vector database."""
    id: str
    title: str
    author: str
    description: str
    genre: str
    language: str  # 'pl' or 'en'
    tags: List[str] = Field(default_factory=list)
