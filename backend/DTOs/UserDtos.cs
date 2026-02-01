using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    /// <summary>
    /// Public profile information for the current authenticated user.
    /// </summary>
    public class UserProfileDto
    {
        /// <summary>User identifier.</summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>Display name shown in the UI.</summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>Primary email address.</summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>Optional user biography.</summary>
        public string? Bio { get; set; }

        /// <summary>URL of the user's profile picture.</summary>
        public string? ProfilePictureUrl { get; set; }

        /// <summary>Number of shelves owned by the user.</summary>
        public int ShelvesCount { get; set; }

        /// <summary>Number of unique books across all user shelves.</summary>
        public int UniqueBooksCount { get; set; }

        /// <summary>Number of followers the user has.</summary>
        public int FollowersCount { get; set; }

        /// <summary>Number of users this user is following.</summary>
        public int FollowingCount { get; set; }

        /// <summary>UTC timestamp when the user account was created.</summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>The user's favorite book, when set.</summary>
        public BookDto? FavoriteBook { get; set; }
    }

    /// <summary>
    /// DTO for updating a user's avatar (profile picture URL).
    /// </summary>
    public class UpdateAvatarDto
    {
        /// <summary>New profile picture URL (required).</summary>
        [Required]
        [Url]
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO used to update profile fields such as bio and favorite book.
    /// </summary>
    public class UpdateUserProfileDto
    {
        /// <summary>Optional biography text (max 500 characters).</summary>
        [MaxLength(500)]
        public string? Bio { get; set; }

        /// <summary>Optional identifier of an existing local book to mark as favorite.</summary>
        public Guid? FavoriteBookId { get; set; }

        /// <summary>Optional Google Books ID used to import a favorite book from Google Books.</summary>
        public string? GoogleBookId { get; set; }
    }

    /// <summary>
    /// DTO used to present users in community lists and search results.
    /// </summary>
    public class UserCommunityDto
    {
        /// <summary>User identifier.</summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>Display name shown in lists.</summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>Optional short biography.</summary>
        public string? Bio { get; set; }

        /// <summary>URL to small profile image, if any.</summary>
        public string? ProfilePictureUrl { get; set; }

        /// <summary>Number of followers the user has.</summary>
        public int FollowersCount { get; set; }

        /// <summary>Number of users this user follows.</summary>
        public int FollowingCount { get; set; }

        /// <summary>Whether the current caller is following this user.</summary>
        public bool IsFollowing { get; set; }
    }

    /// <summary>
    /// Detailed public information about a user, used on profile pages.
    /// </summary>
    public class UserDetailDto
    {
        /// <summary>User identifier.</summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>Display name.</summary>
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>Optional biography text.</summary>
        public string? Bio { get; set; }

        /// <summary>URL to the user's profile image.</summary>
        public string? ProfilePictureUrl { get; set; }

        /// <summary>Number of shelves the user has created.</summary>
        public int ShelvesCount { get; set; }

        /// <summary>Number of unique books across the user's shelves.</summary>
        public int UniqueBooksCount { get; set; }

        /// <summary>Number of followers.</summary>
        public int FollowersCount { get; set; }

        /// <summary>Number of followings.</summary>
        public int FollowingCount { get; set; }

        /// <summary>UTC account creation timestamp.</summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>Indicates whether the current caller is following the user.</summary>
        public bool IsFollowing { get; set; }

        /// <summary>The user's favorite book, if set.</summary>
        public BookDto? FavoriteBook { get; set; }
    }
}
