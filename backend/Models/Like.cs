namespace backend.Models;
public class Like
{
    /// <summary>
    /// Foreign key for the user who liked the post
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Navigation property to the user who liked the post
    /// </summary>
    public ApplicationUser User { get; set; } = null!;

    /// <summary>
    /// Foreign key for the post that was liked
    /// </summary>
    public Guid PostId { get; set; }

    /// <summary>
    /// Navigation property to the post that was liked
    /// </summary>
    public Post Post { get; set; } = null!;
}