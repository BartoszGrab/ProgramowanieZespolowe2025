using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Genre
    {
        /// <summary>
        /// Unique identifier for the genre
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Name of the genre
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Collection of book-genre relationships representing books associated with this genre
        /// </summary>
        public ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();
    }
}