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
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateAvatarDto
    {
        [Required]
        [Url]
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }
}
