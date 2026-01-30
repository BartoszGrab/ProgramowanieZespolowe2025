/**
 * Represents a user review associated with a specific book.
 */
export interface Review {
    /** Unique identifier for the review. */
    id: string;
    /** Numeric rating given by the user (e.g., 1-5 stars). */
    rating: number;
    /** Optional text content explaining the rating. */
    comment?: string;
    /** Display name of the reviewer. */
    userName: string;
    /** Optional URL to the reviewer's avatar image. */
    userAvatarUrl?: string;
    /** ISO timestamp indicating when the review was submitted. */
    createdAt: string;
    /** Foreign key linking the review to a specific book. */
    bookId: string;
}

/**
 * Represents the core metadata for a book entity.
 */
export interface Book {
    /** Unique identifier for the book. */
    id: string;
    title: string;
    /** International Standard Book Number (unique identifier). */
    isbn: string;
    /** URL to the external cover image resource. */
    coverUrl?: string;
    /** Array of author names associated with the book. */
    authors: string[];     // Names
    /** Array of genre categories (e.g., "Fiction", "Sci-Fi"). */
    genres: string[];      // Names
    /** Brief synopsis or summary of the book content. */
    description?: string;
    /** Total number of physical pages. */
    pageCount: number;
    /** Aggregated average score derived from all user reviews. */
    averageRating: number;
}

/**
 * Represents a book contextually placed on a user's shelf.
 * Extends the base {@link Book} interface with user-specific progress data.
 */
export interface ShelfBook extends Book {
    // Shelf specific
    /** The page number the user is currently on (reading progress). */
    currentPage: number;
    /** ISO timestamp indicating when the user added this book to the shelf. */
    addedAt: string;
}

/**
 * Represents a collection of books organized by the user (e.g., "Favorites", "To Read").
 */
export interface ShelfData {
    /** Unique identifier for the shelf. */
    id: string;
    /** Display name of the shelf. */
    name: string;
    /** Cached count of total books in this shelf. */
    bookCount: number;
    /** Optional description of what this shelf is used for. */
    description?: string;
    /** List of books currently assigned to this shelf. */
    books: ShelfBook[];
}