using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class RefreshToken
    {
        /// <summary>
        /// Unique identifier for the refresh token
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// The refresh token value
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Date and time when the token expires
        /// </summary>
        public DateTime ExpiryDate { get; set; }

        /// <summary>
        /// Indicates whether the token has been revoked
        /// </summary>
        public bool IsRevoked { get; set; } = false;

        /// <summary>
        /// Date and time when the token was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Foreign key for the user who owns the token
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property to the user who owns the token
        /// </summary>
        public ApplicationUser User { get; set; } = null!;
    }
}