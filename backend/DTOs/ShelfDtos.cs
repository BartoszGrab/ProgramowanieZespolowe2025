using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // class for displaying shelf information
    public class ShelfDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int BookCount { get; set; }
        // list of books on the shelf
        public List<ShelfBookDto> Books { get; set; } = new List<ShelfBookDto>();
    }

    public class ShelfBookDto
    {
        // Book Details
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public List<string> Authors { get; set; } = new List<string>();
        public List<string> Genres { get; set; } = new List<string>();
        public string? Description { get; set; } 
        public double AverageRating { get; set; }
        public int PageCount { get; set; }

        // Shelf Specifics
        public int CurrentPage { get; set; }
        public DateTime AddedAt { get; set; }
    }

    // For creating a new shelf
    public class CreateShelfDto
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
    }

    // For adding a book to a shelf
    public class AddBookToShelfDto
    {
        [Required]
        public Guid BookId { get; set; }
    }

    // NEW: For updating reading progress
    public class UpdateShelfBookProgressDto
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int CurrentPage { get; set; }
    }
}