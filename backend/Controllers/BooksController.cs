using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    /// <summary>
    /// API controller responsible for managing books and searching external sources (Google Books).
    /// Provides endpoints to list, retrieve and create books.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        /// <summary>
        /// Database context used to access and persist book data.
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Service used to query the Google Books API for external book information.
        /// </summary>
        private readonly backend.Services.IGoogleBooksService _googleBooksService;

        /// <summary>
        /// Initializes a new instance of the <see cref="BooksController"/> class.
        /// </summary>
        /// <param name="context">Application database context.</param>
        /// <param name="googleBooksService">Service used to query Google Books.</param>
        public BooksController(ApplicationDbContext context, backend.Services.IGoogleBooksService googleBooksService)
        {
            _context = context;
            _googleBooksService = googleBooksService;
        }

        /// <summary>
        /// Retrieves a list of books. Optionally performs a search against local data and Google Books.
        /// </summary>
        /// <param name="search">Optional search term to filter by title or ISBN; if provided, also queries Google Books for additional results.</param>
        /// <returns>200 OK with a list of <see cref="BookDto"/> items.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks([FromQuery] string? search)
        {
            var query = _context.Books
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                .Include(b => b.Reviews)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(b => b.Title.Contains(search) || b.ISBN.Contains(search));
            }

            var localBooks = await query.Select(b => new BookDto
            {
                Id = b.Id,
                Title = b.Title,
                ISBN = b.ISBN,
                CoverUrl = b.CoverUrl,
                // Get author names from the join table
                Authors = b.BookAuthors.Select(ba => $"{ba.Author.FirstName} {ba.Author.LastName}").ToList(),
                Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                Description = b.Description,
                PageCount = b.PageCount,
                // Calculate average rating if there are reviews
                AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0
            }).ToListAsync();

            if (!string.IsNullOrEmpty(search))
            {
                try 
                {
                    Console.WriteLine($"[Search] Querying Google Books for: {search}");
                    var googleBooks = await _googleBooksService.SearchBooksAsync(search);
                    Console.WriteLine($"[Search] Found {googleBooks.Count} results from Google Books.");
                    
                    foreach (var gb in googleBooks)
                    {
                        // Avoid duplicates if ISBN matches a local book
                        if (localBooks.Any(lb => lb.ISBN == gb.Isbn)) 
                        {
                            Console.WriteLine($"[Search] Skipping duplicate ISBN: {gb.Isbn}");
                            continue;
                        }

                        localBooks.Add(new BookDto
                        {
                            Id = Guid.Empty, // Indicator that it's external
                            Title = gb.Title ?? "Unknown Title",
                            ISBN = gb.Isbn ?? "",
                            CoverUrl = gb.Thumbnail,
                            Authors = gb.Authors ?? new List<string>(),
                            Genres = gb.Categories ?? new List<string>(),
                            Description = gb.Description,
                            PageCount = gb.PageCount ?? 0,
                            AverageRating = 0,
                            GoogleBookId = gb.Id
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"[Search] Google Books Search Failed: {ex.Message}");
                    Console.Error.WriteLine(ex.StackTrace);
                }
            }

            return Ok(localBooks);
        }

        /// <summary>
        /// Retrieves detailed information about a single book by its identifier.
        /// </summary>
        /// <param name="id">Identifier of the book to retrieve.</param>
        /// <returns>200 OK with <see cref="BookDto"/> when found; 404 NotFound when the book does not exist.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(Guid id)
        {
            var book = await _context.Books
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookGenres).ThenInclude(bg => bg.Genre)
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null) return NotFound();

            var bookDto = new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN,
                CoverUrl = book.CoverUrl,
                Authors = book.BookAuthors.Select(ba => $"{ba.Author.FirstName} {ba.Author.LastName}").ToList(),
                Genres = book.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                Description = book.Description,
                AverageRating = book.Reviews.Any() ? book.Reviews.Average(r => r.Rating) : 0
            };

            return Ok(bookDto);
        }

        /// <summary>
        /// Creates a new book record. Requires an authenticated user.
        /// </summary>
        /// <param name="dto">Data transfer object containing book creation details, including author and genre IDs.</param>
        /// <returns>
        /// Returns 201 Created with location header pointing to the new book on success; 400 Bad Request when a book with the same ISBN exists.
        /// </returns>
        [Authorize] 
        [HttpPost]
        public async Task<ActionResult> CreateBook([FromBody] CreateBookDto dto)
        {
            // check if book with the same ISBN already exists
            if (await _context.Books.AnyAsync(b => b.ISBN == dto.ISBN))
                return BadRequest("Książka o podanym ISBN już istnieje.");

            // make new book
            var book = new Book
            {
                Title = dto.Title,
                ISBN = dto.ISBN,
                PageCount = dto.PageCount,
                Description = dto.Description,
                CoverUrl = dto.CoverUrl,
                PublishedDate = dto.PublishedDate
            };

            // add authors and genres
            if (dto.AuthorIds.Any())
            {
                foreach (var authorId in dto.AuthorIds)
                {
                    book.BookAuthors.Add(new BookAuthor { AuthorId = authorId });
                }
            }

            if (dto.GenreIds.Any())
            {
                foreach (var genreId in dto.GenreIds)
                {
                    book.BookGenres.Add(new BookGenre { GenreId = genreId });
                }
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, new { id = book.Id, title = book.Title });
        }
    }
}