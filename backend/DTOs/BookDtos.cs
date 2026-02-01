using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Data transfer object used to return book information to clients.
    /// </summary>
    public class BookDto
    {
        /// <summary>
        /// Unique identifier of the book (local DB GUID). For externally-sourced books this may be Guid.Empty.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Book title.
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// ISBN identifier (typically 10 or 13 characters).
        /// </summary>
        public string ISBN { get; set; } = string.Empty;

        /// <summary>
        /// URL to the cover image if available.
        /// </summary>
        public string? CoverUrl { get; set; }

        /// <summary>
        /// List of author names (first and last name strings).
        /// </summary>
        public List<string> Authors { get; set; } = new List<string>();

        /// <summary>
        /// List of genre names.
        /// </summary>
        public List<string> Genres { get; set; } = new List<string>();

        /// <summary>
        /// Optional description or summary of the book.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Number of pages in the book.
        /// </summary>
        public int PageCount { get; set; }

        /// <summary>
        /// Average rating calculated from reviews; 0 when no reviews exist.
        /// </summary>
        public double AverageRating { get; set; }

        /// <summary>
        /// External Google Books ID when the item comes from Google Books.
        /// </summary>
        public string? GoogleBookId { get; set; }
    }

    /// <summary>
    /// DTO used to create a new local book entry.
    /// </summary>
    public class CreateBookDto
    {
        /// <summary>Title of the book (required, max length 200).</summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>ISBN for the book (required, max length 13).</summary>
        [Required]
        [MaxLength(13)]
        public string ISBN { get; set; } = string.Empty;

        /// <summary>Number of pages (optional).</summary>
        public int PageCount { get; set; }

        /// <summary>Optional description.</summary>
        public string? Description { get; set; }

        /// <summary>Optional cover image URL.</summary>
        public string? CoverUrl { get; set; }

        /// <summary>Optional published date.</summary>
        public DateTime? PublishedDate { get; set; }

        /// <summary>IDs of existing authors to associate with this book.</summary>
        public List<Guid> AuthorIds { get; set; } = new List<Guid>();

        /// <summary>IDs of existing genres to associate with this book.</summary>
        public List<int> GenreIds { get; set; } = new List<int>();
    }
}