using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class RegisterDto
    {

        ///<summary>
        /// User's email address
        /// </summary>
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [RegularExpression(@"^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$",
            ErrorMessage = "Email must be in valid format (e.g., user@example.com)")]
        public string Email { get; set; } = string.Empty;

        ///<summary>
        /// User's password
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        public string Password { get; set; } = string.Empty;

        ///<summary>
        /// User's password confirmation
        /// </summary>
        [Required(ErrorMessage = "Confirm password is required")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;

        ///<summary>
        /// User's display name
        /// </summary>
        [Required(ErrorMessage = "Display name is required")]
        [MinLength(3, ErrorMessage = "Display name must be at least 3 characters long")]
        [MaxLength(30, ErrorMessage = "Display name cannot exceed 30 characters")]
        [RegularExpression(@"^[\p{L}\p{N}](?:[\p{L}\p{N} ._-]*[\p{L}\p{N}])?$", ErrorMessage = "Display name can contain letters, numbers, spaces, dots, underscores or hyphens, and cannot start or end with a space.")]
        public string DisplayName { get; set; } = string.Empty;
    }
}
