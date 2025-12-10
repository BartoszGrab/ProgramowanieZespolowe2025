export interface Review {
    id: string;
    rating: number;
    comment?: string;
    userName: string;
    createdAt: string;
    bookId: string;
}

export interface Book {
    id: string;
    title: string;
    isbn: string;
    coverUrl?: string;
    authors: string[];     // Names
    genres: string[];      // Names
    description?: string;
    pageCount: number;
    averageRating: number;
}

export interface ShelfBook extends Book {
    // Shelf specific
    currentPage: number;
    addedAt: string;
}

export interface ShelfData {
    id: string;
    name: string;
    bookCount: number;
    description?: string;
    books: ShelfBook[];
}
