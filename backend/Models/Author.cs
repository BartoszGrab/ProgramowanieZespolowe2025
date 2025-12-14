using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Author
    {
        /// <summary>
        /// Author's Id
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Author's first name
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Authors last name
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Author's bio
        /// </summary>
        public string? Bio { get; set; }
        
        /// <summary>
        /// Author's date of birth
        /// </summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>
        /// Collection of book-author relationships representing books written by this author
        /// </summary>
        public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    }
}
