from collections import Counter
from dataclasses import dataclass
from threading import Lock
from typing import Dict, List, Optional, Set

from app.models import BookInput
from app.config import settings


@dataclass(frozen=True)
class BookSnapshot:
    title: str
    author: str
    genre: Optional[str]
    language: str


class UserHistoryStore:
    """In-memory store for user book history and co-occurrence."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._user_books: Dict[str, Set[str]] = {}
        self._book_users: Dict[str, Set[str]] = {}
        self._book_info: Dict[str, BookSnapshot] = {}
        self._book_ratings: Dict[str, Dict[str, int]] = {}

    def _make_key(self, title: str, author: str) -> str:
        return f"{title.strip().lower()}|{author.strip().lower()}"

    def record_history(
        self,
        user_id: str,
        books: List[BookInput],
        language: str
    ) -> None:
        """Persist user's history to support collaborative recommendations."""
        with self._lock:
            user_set = self._user_books.setdefault(user_id, set())
            for book in books:
                key = self._make_key(book.title, book.author)
                user_set.add(key)
                self._book_users.setdefault(key, set()).add(user_id)
                if key not in self._book_info:
                    self._book_info[key] = BookSnapshot(
                        title=book.title,
                        author=book.author,
                        genre=book.genre,
                        language=language
                    )
                if book.rating is not None:
                    self._book_ratings.setdefault(key, {})[user_id] = book.rating

    def recommend_from_cooccurrence(
        self,
        seed_books: List[BookInput],
        exclude_user_id: str,
        exclude_titles: Set[str],
        limit: int
    ) -> List[Dict[str, object]]:
        """Recommend books based on co-occurrence and reviews from other users."""
        seed_keys = {self._make_key(b.title, b.author) for b in seed_books}

        with self._lock:
            other_users: Set[str] = set()
            for key in seed_keys:
                other_users.update(self._book_users.get(key, set()))
            other_users.discard(exclude_user_id)

            counts: Counter[str] = Counter()
            for user in other_users:
                for book_key in self._user_books.get(user, set()):
                    if book_key in seed_keys:
                        continue
                    info = self._book_info.get(book_key)
                    if not info:
                        continue
                    if info.title in exclude_titles:
                        continue
                    counts[book_key] += 1

            if not counts:
                return []

            max_count = max(counts.values())
            ranked: List[tuple] = []
            for book_key, count in counts.items():
                info = self._book_info.get(book_key)
                if not info:
                    continue
                base_score = min(1.0, count / max_count)
                ratings = self._book_ratings.get(book_key, {})
                rating_values = [
                    value for uid, value in ratings.items()
                    if uid != exclude_user_id
                ]
                if rating_values:
                    avg_rating = sum(rating_values) / len(rating_values)
                    if avg_rating < settings.PEOPLE_ALSO_MIN_AVG_RATING:
                        continue
                    rating_score = max(0.0, min(1.0, avg_rating / 5.0))
                    weight_total = max(
                        settings.COOCCURRENCE_WEIGHT + settings.RATING_WEIGHT,
                        0.0
                    )
                    if weight_total > 0.0:
                        score = (
                            settings.COOCCURRENCE_WEIGHT * base_score
                            + settings.RATING_WEIGHT * rating_score
                        ) / weight_total
                    else:
                        score = base_score
                    score = round(score, 2)
                else:
                    score = round(base_score, 2)
                ranked.append((score, count, book_key))

            ranked.sort(reverse=True)
            results: List[Dict[str, object]] = []
            for score, _, book_key in ranked:
                info = self._book_info.get(book_key)
                if not info:
                    continue
                results.append({
                    "title": info.title,
                    "author": info.author,
                    "genre": info.genre,
                    "language": info.language,
                    "score": score
                })
                if len(results) >= limit:
                    break

            return results


user_history_store = UserHistoryStore()
