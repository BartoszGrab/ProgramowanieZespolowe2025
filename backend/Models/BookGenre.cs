namespace backend.Models;
public class BookGenre
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
    /// Foreign key for the Genre entity
    /// </summary>
    public int GenreId { get; set; }

    /// <summary>
    /// Navigation property to the Genre entity
    /// </summary>
    public Genre Genre { get; set; } = null!;
}