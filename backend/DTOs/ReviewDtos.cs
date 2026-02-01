using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// DTO representing a persisted review returned to clients.
    /// </summary>
    public class ReviewDto
    {
        /// <summary>Unique identifier of the review.</summary>
        public Guid Id { get; set; }

        /// <summary>Rating given by the user (1-5).</summary>
        public int Rating { get; set; }

        /// <summary>Optional text comment for the review.</summary>
        public string? Comment { get; set; }

        /// <summary>Username of the reviewer.</summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>URL to the reviewer's avatar image, if available.</summary>
        public string? UserAvatarUrl { get; set; }

        /// <summary>UTC timestamp when the review was created.</summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>Identifier of the reviewed book.</summary>
        public Guid BookId { get; set; }
    }

    /// <summary>
    /// DTO used to create or update a review.
    /// </summary>
    public class CreateReviewDto
    {
        /// <summary>Book identifier the review is associated with.</summary>
        [Required]
        public Guid BookId { get; set; }

        /// <summary>Rating value (required, between 1 and 5).</summary>
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        /// <summary>Optional review text.</summary>
        public string? Comment { get; set; }
    }
}
