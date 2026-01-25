using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    /// <summary>
    /// Stores book recommendations generated for a user.
    /// </summary>
    public class UserRecommendation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Foreign key to the user who received the recommendations.
        /// Nullable for anonymous recommendations.
        /// </summary>
        public string? UserId { get; set; }

        /// <summary>
        /// The category title (e.g., "Ponieważ czytałeś: Wiedźmin")
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string CategoryTitle { get; set; } = string.Empty;

        /// <summary>
        /// The category type: content_similarity, author_based, serendipity
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string CategoryType { get; set; } = string.Empty;

        /// <summary>
        /// JSON string containing the list of recommended books.
        /// </summary>
        [Required]
        public string RecommendationsJson { get; set; } = "[]";

        /// <summary>
        /// When the recommendations were generated.
        /// </summary>
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ApplicationUser? User { get; set; }
    }
}
