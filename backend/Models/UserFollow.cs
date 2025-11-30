public class UserFollow
{
    /// <summary>
    /// Foreign key for the user who is following (observer)
    /// </summary>
    public string ObserverId { get; set; } = string.Empty;

    /// <summary>
    /// Navigation property to the user who is following (observer)
    /// </summary>
    public ApplicationUser Observer { get; set; } = null!;

    /// <summary>
    /// Foreign key for the user being followed (target)
    /// </summary>
    public string TargetId { get; set; } = string.Empty;

    /// <summary>
    /// Navigation property to the user being followed (target)
    /// </summary>
    public ApplicationUser Target { get; set; } = null!;

    /// <summary>
    /// Date and time when the follow relationship was established
    /// </summary>
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
}