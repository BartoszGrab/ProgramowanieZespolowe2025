using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Book
    {
        /// <summary>
        /// Unique identifier for the book
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Title of the book
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// International Standard Book Number
        /// </summary>
        [Required]
        [MaxLength(13)] // ISBN-13
        public string ISBN { get; set; } = string.Empty;

        /// <summary>
        /// Total number of pages in the book
        /// </summary>
        public int PageCount { get; set; }

        /// <summary>
        /// Description or summary of the book
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// URL to the book's cover image
        /// </summary>
        public string? CoverUrl { get; set; }

        /// <summary>
        /// Date when the book was published
        /// </summary>
        public DateTime? PublishedDate { get; set; }

        /// <summary>
        /// Collection of book-author relationships representing authors of this book
        /// </summary>
        public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();

        /// <summary>
        /// Collection of book-genre relationships representing genres associated with this book
        /// </summary>
        public ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();

        /// <summary>
        /// Collection of reviews written for this book
        /// </summary>
        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        /// <summary>
        /// Collection of shelf-book relationships representing shelves containing this book
        /// </summary>
        public ICollection<ShelfBook> ShelfBooks { get; set; } = new List<ShelfBook>();
    }
}