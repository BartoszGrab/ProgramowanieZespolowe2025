using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Review
    {
        /// <summary>
        /// Unique identifier for the review
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Rating given in the review (1-5)
        /// </summary>
        [Range(1, 5)]
        public int Rating { get; set; }

        /// <summary>
        /// Optional comment for the review
        /// </summary>
        public string? Comment { get; set; }

        /// <summary>
        /// Date and time when the review was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Foreign key for the user who wrote the review
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property to the user who wrote the review
        /// </summary>
        public ApplicationUser User { get; set; } = null!;

        /// <summary>
        /// Foreign key for the book being reviewed
        /// </summary>
        public Guid BookId { get; set; }

        /// <summary>
        /// Navigation property to the book being reviewed
        /// </summary>
        public Book Book { get; set; } = null!;
    }
}