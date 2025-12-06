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
        public List<BookDto> Books { get; set; } = new List<BookDto>();
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
}