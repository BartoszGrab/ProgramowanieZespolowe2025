using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ShelvesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IGoogleBooksService _googleBooksService; // Changed from UserManager to IGoogleBooksService

        public ShelvesController(ApplicationDbContext context, IGoogleBooksService googleBooksService) // Changed constructor signature
        {
            _context = context;
            _googleBooksService = googleBooksService;
        }

        // GET: api/shelves (Get MY shelves)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShelfDto>>> GetMyShelves()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Extract ID from JWT token
            var shelves = await _context.Shelves
                .Where(s => s.UserId == userId)
                .Include(s => s.ShelfBooks)
                .Select(s => new ShelfDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    BookCount = s.ShelfBooks.Count
                })
                .ToListAsync();

            return Ok(shelves);
        }

        // GET: api/shelves/{id}/books
        [HttpGet("{id}/books")]
        public async Task<ActionResult<ShelfDto>> GetShelfBooks(Guid id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var shelf = await _context.Shelves
                .Include(s => s.ShelfBooks)
                    .ThenInclude(sb => sb.Book)
                        .ThenInclude(b => b.BookAuthors)
                            .ThenInclude(ba => ba.Author)
                .Include(s => s.ShelfBooks)
                    .ThenInclude(sb => sb.Book)
                        .ThenInclude(b => b.BookGenres)
                            .ThenInclude(bg => bg.Genre)
                .Include(s => s.ShelfBooks)
                    .ThenInclude(sb => sb.Book)
                        .ThenInclude(b => b.Reviews)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (shelf == null) return NotFound("Półka nie istnieje.");
            
            // Allow only owner to see it (for now)
            if (shelf.UserId != userId) return Forbid();

            var shelfDto = new ShelfDto
            {
                Id = shelf.Id,
                Name = shelf.Name,
                BookCount = shelf.ShelfBooks.Count,
                Books = shelf.ShelfBooks.Select(sb => new ShelfBookDto
                {
                    Id = sb.Book.Id,
                    Title = sb.Book.Title,
                    ISBN = sb.Book.ISBN,
                    CoverUrl = sb.Book.CoverUrl,
                    Authors = sb.Book.BookAuthors.Select(ba => $"{ba.Author.FirstName} {ba.Author.LastName}").ToList(),
                    Genres = sb.Book.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                    Description = sb.Book.Description,
                    PageCount = sb.Book.PageCount,
                    AverageRating = sb.Book.Reviews.Any() ? sb.Book.Reviews.Average(r => r.Rating) : 0,
                    CurrentPage = sb.CurrentPage,
                    AddedAt = sb.AddedAt
                }).ToList()
            };

            return Ok(shelfDto);
        }

        [HttpPost]
        public async Task<ActionResult<ShelfDto>> CreateShelf([FromBody] CreateShelfDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // check if shelf with the same name already exists for the user
            if (await _context.Shelves.AnyAsync(s => s.UserId == userId && s.Name == dto.Name))
                return BadRequest("Masz już półkę o tej nazwie.");

            var shelf = new Shelf
            {
                Name = dto.Name,
                UserId = userId
            };

            _context.Shelves.Add(shelf);
            await _context.SaveChangesAsync();

            var shelfDto = new ShelfDto
            {
                Id = shelf.Id,
                Name = shelf.Name,
                BookCount = 0,
                Books = new List<ShelfBookDto>() 
            };

            return Ok(shelfDto);
        }

        // POST: api/shelves/{shelfId}/books (Dodaj książkę do półki)
        [HttpPost("{shelfId}/books")]
        public async Task<ActionResult> AddBookToShelf(Guid shelfId, [FromBody] AddBookToShelfDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // check if shelf exists and belongs to the user
            var shelf = await _context.Shelves
                .FirstOrDefaultAsync(s => s.Id == shelfId && s.UserId == userId);

            if (shelf == null) return NotFound("Półka nie istnieje lub nie należy do Ciebie.");

            Guid targetBookId;

            if (dto.BookId.HasValue && dto.BookId != Guid.Empty)
            {
                targetBookId = dto.BookId.Value;
                // Check if the book exists
                var bookExists = await _context.Books.AnyAsync(b => b.Id == targetBookId);
                if (!bookExists) return NotFound("Książka nie istnieje.");
            }
            else if (!string.IsNullOrEmpty(dto.GoogleBookId))
            {
                 // Try to fetch by Google ID directly to ensure we get the right book even without standard ISBN
                 var gBook = await _googleBooksService.GetByGoogleIdAsync(dto.GoogleBookId);
                 if (gBook == null) return NotFound($"Book with Google ID {dto.GoogleBookId} not found.");

                 // Check if we already have this book by ISBN (if available)
                 Book? existingBook = null;
                 if (!string.IsNullOrEmpty(gBook.Isbn))
                 {
                     existingBook = await _context.Books.FirstOrDefaultAsync(b => b.ISBN == gBook.Isbn);
                 }

                 if (existingBook != null)
                 {
                     targetBookId = existingBook.Id;
                 }
                 else
                 {
                     // Create new Book
                     targetBookId = await CreateBookFromGoogleBook(gBook);
                 }
            }
            else if (!string.IsNullOrEmpty(dto.Isbn))
            {
                // Try to find by ISBN
                var existingBook = await _context.Books.FirstOrDefaultAsync(b => b.ISBN == dto.Isbn);
                if (existingBook != null)
                {
                    targetBookId = existingBook.Id;
                }
                else
                {
                    // Fetch from Google
                    var gBook = await _googleBooksService.GetByIsbnAsync(dto.Isbn);
                    if (gBook == null) return NotFound($"Book with ISBN {dto.Isbn} not found in Google Books.");
                    
                    targetBookId = await CreateBookFromGoogleBook(gBook);
                }
            }
            else
            {
                return BadRequest("Musisz podać BookId, GoogleBookId lub ISBN.");
            }

            // Check if the book is already on the shelf
            var alreadyOnShelf = await _context.ShelfBooks
                .AnyAsync(sb => sb.ShelfId == shelfId && sb.BookId == targetBookId);

            if (alreadyOnShelf) return BadRequest("Ta książka już jest na tej półce.");

            // Add the book to the shelf
            _context.ShelfBooks.Add(new ShelfBook
            {
                ShelfId = shelfId,
                BookId = targetBookId,
                AddedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Książka dodana do półki", bookId = targetBookId });
        }

        // DELETE: api/shelves/{shelfId}/books/{bookId}
        [HttpDelete("{shelfId}/books/{bookId}")]
        public async Task<ActionResult> RemoveBookFromShelf(Guid shelfId, Guid bookId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var shelfBook = await _context.ShelfBooks
                .Include(sb => sb.Shelf)
                .FirstOrDefaultAsync(sb => sb.ShelfId == shelfId && sb.BookId == bookId && sb.Shelf.UserId == userId);

            if (shelfBook == null)
            {
                return NotFound("Książka nie znajduje się na tej półce lub półka nie należy do Ciebie.");
            }

            _context.ShelfBooks.Remove(shelfBook);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Książka usunięta z półki." });
        }

        // PUT: api/shelves/{shelfId}/books/{bookId}/progress
        [HttpPut("{shelfId}/books/{bookId}/progress")]
        public async Task<ActionResult> UpdateBookProgress(Guid shelfId, Guid bookId, [FromBody] UpdateShelfBookProgressDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var shelfBook = await _context.ShelfBooks
                .Include(sb => sb.Shelf)
                .Include(sb => sb.Book)
                .FirstOrDefaultAsync(sb => sb.ShelfId == shelfId && sb.BookId == bookId && sb.Shelf.UserId == userId);

            if (shelfBook == null) return NotFound("Nie znaleziono książki na Twojej półce.");

            if (dto.CurrentPage > shelfBook.Book.PageCount)
                return BadRequest($"Obecna strona ({dto.CurrentPage}) nie może być większa niż liczba stron w książce ({shelfBook.Book.PageCount}).");

            shelfBook.CurrentPage = dto.CurrentPage;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Postęp zaktualizowany." });
        }
        private async Task<Guid> CreateBookFromGoogleBook(backend.Services.GoogleBook gBook)
        {
            var newBook = new Book
            {
                Title = gBook.Title ?? "Unknown",
                ISBN = gBook.Isbn ?? "TMP_" + Guid.NewGuid().ToString("N").Substring(0, 9), // Fallback if no ISBN (max 13 chars)
                CoverUrl = gBook.Thumbnail,
                Description = gBook.Description,
                PageCount = gBook.PageCount ?? 0,
                PublishedDate = DateTime.TryParse(gBook.PublishedDate, out var d) ? d.ToUniversalTime() : null
            };

            // Handle Authors
            foreach (var authorName in gBook.Authors ?? new List<string>())
            {
                var parts = authorName.Split(' ');
                var lastNameRaw = parts.Last();
                var firstNameRaw = parts.Length > 1 ? string.Join(" ", parts.Take(parts.Length - 1)) : "";
                if (string.IsNullOrEmpty(firstNameRaw)) firstNameRaw = authorName;

                var lastName = lastNameRaw.Length > 100 ? lastNameRaw.Substring(0, 100) : lastNameRaw;
                var firstName = firstNameRaw.Length > 100 ? firstNameRaw.Substring(0, 100) : firstNameRaw;

                var author = await _context.Authors.FirstOrDefaultAsync(a => a.FirstName == firstName && a.LastName == lastName);
                if (author == null)
                {
                    author = new Author { FirstName = firstName, LastName = lastName };
                    _context.Authors.Add(author);
                }
                newBook.BookAuthors.Add(new BookAuthor { Author = author, Book = newBook });
            }

            // Handle Genres (Categories)
            foreach (var genreNameRaw in gBook.Categories ?? new List<string>())
            {
                 // Truncate to 50 chars to fit DB
                 var genreName = genreNameRaw.Length > 50 ? genreNameRaw.Substring(0, 50) : genreNameRaw;

                 var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName);
                 if (genre == null)
                 {
                     genre = new Genre { Name = genreName };
                     _context.Genres.Add(genre);
                 }
                 newBook.BookGenres.Add(new BookGenre { Genre = genre, Book = newBook });
            }

            _context.Books.Add(newBook);
            await _context.SaveChangesAsync();
            return newBook.Id;
        }
    }
}