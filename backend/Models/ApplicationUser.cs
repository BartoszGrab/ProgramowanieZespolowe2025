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

        /// <summary>
        /// 
        /// </summary>
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        // --- Social ---
        
        /// <summary>
        /// Collection of posts created by the user
        /// </summary>
        public ICollection<Post> Posts { get; set; } = new List<Post>();

        /// <summary>
        /// Collection of comments made by the user
        /// </summary>
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();

        /// <summary>
        /// Collection of likes given by the user
        /// </summary>
        public ICollection<Like> Likes { get; set; } = new List<Like>();

        /// <summary>
        /// Collection of notifications received by the user
        /// </summary>
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        /// <summary>
        /// Collection of users that this user is following
        /// </summary>
        public ICollection<UserFollow> Following { get; set; } = new List<UserFollow>();

        /// <summary>
        /// Collection of users who are following this user
        /// </summary>
        public ICollection<UserFollow> Followers { get; set; } = new List<UserFollow>();

        // --- Library ---
        
        /// <summary>
        /// Collection of shelves created by the user
        /// </summary>
        public ICollection<Shelf> Shelves { get; set; } = new List<Shelf>();

        /// <summary>
        /// Collection of reviews written by the user
        /// </summary>
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}