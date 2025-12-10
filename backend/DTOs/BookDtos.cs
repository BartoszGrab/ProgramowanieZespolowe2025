using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // class for displaying book information
    public class BookDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public List<string> Authors { get; set; } = new List<string>(); // Only first and last names
        public List<string> Genres { get; set; } = new List<string>();
        public string? Description { get; set; } 
        public double AverageRating { get; set; } // Calculated in the controller
    }

    // For adding a new book
    public class CreateBookDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(13)]
        public string ISBN { get; set; } = string.Empty;

        public int PageCount { get; set; }
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public DateTime? PublishedDate { get; set; }

        // When adding a book, provide the IDs of authors and genres that already exist in the database
        public List<Guid> AuthorIds { get; set; } = new List<Guid>();
        public List<int> GenreIds { get; set; } = new List<int>();
    }
}