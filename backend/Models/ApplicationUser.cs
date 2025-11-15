using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        ///<summary>
        /// User's display name
        ///</summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// URL to the user's profile picture
        /// </summary>
        public string? ProfilePictureUrl { get; set; }

        /// <summary>
        /// Date and time when the user account was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Date and time of the user's last login
        /// </summary>
        public DateTime? LastLoginAt { get; set; }

        /// <summary>
        /// Indicates whether the user account is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// User's bio or description
        /// </summary>
        public string? Bio { get; set; }

        /// <summary>
        /// User's date of birth
        /// </summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>
        /// Number of followers the user has
        /// </summary>
        public int FollowersCount { get; set; } = 0;

        /// <summary>
        /// Number of users the user is following
        /// </summary>
        public int FollowingCount { get; set; } = 0;

        /// <summary>
        /// Number of posts the user has made
        /// </summary>
        public int PostsCount { get; set; } = 0;

        
    }
}