public class ShelfBook
{
    /// <summary>
    /// Foreign key for the shelf
    /// </summary>
    public Guid ShelfId { get; set; }

    /// <summary>
    /// Navigation property to the shelf
    /// </summary>
    public Shelf Shelf { get; set; } = null!;

    /// <summary>
    /// Foreign key for the book
    /// </summary>
    public Guid BookId { get; set; }

    /// <summary>
    /// Navigation property to the book
    /// </summary>
    public Book Book { get; set; } = null!;

    /// <summary>
    /// Current reading progress page number
    /// </summary>
    public int CurrentPage { get; set; } = 0;

    /// <summary>
    /// Date and time when the book was added to the shelf
    /// </summary>
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}