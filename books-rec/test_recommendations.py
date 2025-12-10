#!/usr/bin/env python3
"""
Test script for Book Recommendation API.
Run with: python test_recommendations.py
"""

import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000"


async def test_health():
    """Test health endpoint."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}/health")
        print("✅ Health:", r.json())
        return r.json()


async def test_stats():
    """Test stats endpoint."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE_URL}/stats")
        print("✅ Stats:", r.json())
        return r.json()


async def test_polish_recommendations():
    """Test Polish book recommendations."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        payload = {
            "preferred_language": "pl",
            "history": [
                {"title": "Wiedźmin", "author": "Andrzej Sapkowski", "genre": "Fantasy", "rating": 5},
                {"title": "Diuna", "author": "Frank Herbert", "genre": "Sci-Fi", "rating": 4}
            ]
        }
        r = await client.post(f"{BASE_URL}/recommend", json=payload)
        data = r.json()
        
        print("\n" + "="*60)
        print("📚 POLISH RECOMMENDATIONS")
        print("="*60)
        
        for category in data.get("recommendations", []):
            print(f"\n🏷️  {category['category_title']}")
            for item in category["items"][:3]:
                print(f"   • {item['title']} by {item['author']} (score: {item['match_score']})")
        
        return data


async def test_english_recommendations():
    """Test English book recommendations."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        payload = {
            "preferred_language": "en",
            "history": [
                {"title": "Dune", "author": "Frank Herbert", "genre": "Sci-Fi", "rating": 5}
            ]
        }
        r = await client.post(f"{BASE_URL}/recommend", json=payload)
        data = r.json()
        
        print("\n" + "="*60)
        print("📚 ENGLISH RECOMMENDATIONS")
        print("="*60)
        
        for category in data.get("recommendations", []):
            print(f"\n🏷️  {category['category_title']}")
            for item in category["items"][:3]:
                print(f"   • {item['title']} by {item['author']} (score: {item['match_score']})")
        
        return data


async def test_google_books_search():
    """Test Google Books search."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(f"{BASE_URL}/google-books/search", params={
            "query": "Stanisław Lem",
            "language": "pl",
            "max_results": 5
        })
        data = r.json()
        
        print("\n" + "="*60)
        print("🔍 GOOGLE BOOKS SEARCH: 'Stanisław Lem'")
        print("="*60)
        
        for book in data.get("books", []):
            print(f"   • {book['title']} by {book['author']}")
        
        return data


async def main():
    print("\n🧪 BOOK RECOMMENDATION API TESTS\n")
    
    try:
        await test_health()
        await test_stats()
        await test_polish_recommendations()
        await test_english_recommendations()
        await test_google_books_search()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60 + "\n")
        
    except httpx.ConnectError:
        print("❌ ERROR: Cannot connect to server. Is it running?")
        print("   Run: uvicorn app.main:app --reload")
    except Exception as e:
        print(f"❌ ERROR: {e}")


if __name__ == "__main__":
    asyncio.run(main())
