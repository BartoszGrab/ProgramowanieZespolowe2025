using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Notification
    {
        /// <summary>
        /// Unique identifier for the notification
        /// </summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Content of the notification
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Indicates whether the notification has been read
        /// </summary>
        public bool IsRead { get; set; } = false;

        /// <summary>
        /// Date and time when the notification was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Type of the notification (e.g., "NewFollower", "Like")
        /// </summary>
        public string Type { get; set; } = string.Empty; // np. "NewFollower", "Like"

        /// <summary>
        /// Foreign key for the user who receives the notification
        /// </summary>
        [ForeignKey(nameof(ApplicationUser))]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property to the user who receives the notification
        /// </summary>
        public ApplicationUser User { get; set; } = null!;
    }
}