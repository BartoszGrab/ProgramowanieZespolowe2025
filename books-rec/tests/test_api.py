"""
Tests for the Book Recommendation API.
"""

import pytest
from fastapi.testclient import TestClient


def test_pydantic_models():
    """Test Pydantic model validation."""
    from app.models import BookInput, RecommendationRequest
    
    # Test valid book input
    book = BookInput(
        title="Wiedźmin",
        author="Andrzej Sapkowski",
        genre="Fantasy",
        rating=5
    )
    assert book.title == "Wiedźmin"
    assert book.rating == 5
    
    # Test request with Polish preference
    request = RecommendationRequest(
        preferred_language="pl",
        history=[book]
    )
    assert request.preferred_language == "pl"
    assert len(request.history) == 1


def test_sample_books():
    """Test sample books data."""
    from app.sample_books import get_sample_books, get_sample_books_count
    
    books = get_sample_books()
    count = get_sample_books_count()
    
    assert len(books) == count
    assert count > 20  # We should have at least 20+ books
    
    # Check we have both Polish and English books
    pl_books = [b for b in books if b.language == "pl"]
    en_books = [b for b in books if b.language == "en"]
    
    assert len(pl_books) > 10
    assert len(en_books) > 10


def test_embedding_text_creation():
    """Test embedding text creation."""
    from app.embeddings import embedding_service
    
    text = embedding_service.create_book_embedding_text(
        title="Wiedźmin",
        author="Andrzej Sapkowski",
        genre="Fantasy",
        description="Opowieść o Geralcie"
    )
    
    assert "Wiedźmin" in text
    assert "Andrzej Sapkowski" in text
    assert "Fantasy" in text


def test_recommendation_response_format():
    """Test recommendation response format."""
    from app.models import (
        RecommendationResponse, 
        RecommendationCategory, 
        RecommendedBook
    )
    
    book = RecommendedBook(
        title="Narrenturm",
        author="Andrzej Sapkowski",
        description="Historia Reinmara",
        language="pl",
        match_score=0.95
    )
    
    category = RecommendationCategory(
        category_title="Ponieważ czytałeś Wiedźmina",
        type="content_similarity",
        items=[book]
    )
    
    response = RecommendationResponse(recommendations=[category])
    
    assert len(response.recommendations) == 1
    assert response.recommendations[0].category_title == "Ponieważ czytałeś Wiedźmina"
    assert response.recommendations[0].items[0].match_score == 0.95
