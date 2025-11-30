public class BookAuthor
{
    /// <summary>
    /// Foreign key for the Book entity
    /// </summary>
    public Guid BookId { get; set; }

    /// <summary>
    /// Navigation property to the Book entity
    /// </summary>
    public Book Book { get; set; } = null!;

    /// <summary>
    /// Foreign key for the Author entity
    /// </summary>
    public Guid AuthorId { get; set; }

    /// <summary>
    /// Navigation property to the Author entity
    /// </summary>
    public Author Author { get; set; } = null!;
}