using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public int ShelvesCount { get; set; }
        public int UniqueBooksCount { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public BookDto? FavoriteBook { get; set; }
    }

    public class UpdateAvatarDto
    {
        [Required]
        [Url]
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }

    public class UpdateUserProfileDto
    {
        [MaxLength(500)]
        public string? Bio { get; set; }
        public Guid? FavoriteBookId { get; set; }
        public string? GoogleBookId { get; set; }
    }

    public class UserCommunityDto
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public bool IsFollowing { get; set; }
    }

    public class UserDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public int ShelvesCount { get; set; }
        public int UniqueBooksCount { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsFollowing { get; set; }
        public BookDto? FavoriteBook { get; set; }
    }
}
