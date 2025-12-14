using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Post
    {
        /// <summary>
        /// Unique identifier for the post
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Content of the post
        /// </summary>
        [Required]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Date and time when the post was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Foreign key for the user who created the post
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property to the user who created the post
        /// </summary>
        public ApplicationUser User { get; set; } = null!;

        /// <summary>
        /// Foreign key for the related book (optional)
        /// </summary>
        public Guid? RelatedBookId { get; set; }

        /// <summary>
        /// Navigation property to the related book (optional)
        /// </summary>
        public Book? RelatedBook { get; set; }

        /// <summary>
        /// Collection of comments on this post
        /// </summary>
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();

        /// <summary>
        /// Collection of likes on this post
        /// </summary>
        public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
}