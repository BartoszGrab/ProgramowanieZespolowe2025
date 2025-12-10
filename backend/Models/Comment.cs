using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Comment
    {
        /// <summary>
        /// Unique identifier for the comment
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Content of the comment
        /// </summary>
        [Required]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Date and time when the comment was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Foreign key for the user who created the comment
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property to the user who created the comment
        /// </summary>
        public ApplicationUser User { get; set; } = null!;

        /// <summary>
        /// Foreign key for the post this comment belongs to
        /// </summary>
        public Guid PostId { get; set; }

        /// <summary>
        /// Navigation property to the post this comment belongs to
        /// </summary>
        public Post Post { get; set; } = null!;
    }
}