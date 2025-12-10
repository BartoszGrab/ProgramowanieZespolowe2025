using backend.Data;
using backend.DTOs;
using backend.Models;
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
        private readonly UserManager<ApplicationUser> _userManager;

        public ShelvesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
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
                Books = shelf.ShelfBooks.Select(sb => new BookDto
                {
                    Id = sb.Book.Id,
                    Title = sb.Book.Title,
                    ISBN = sb.Book.ISBN,
                    CoverUrl = sb.Book.CoverUrl,
                    Authors = sb.Book.BookAuthors.Select(ba => $"{ba.Author.FirstName} {ba.Author.LastName}").ToList(),
                    Genres = sb.Book.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                    Description = sb.Book.Description,
                    AverageRating = sb.Book.Reviews.Any() ? sb.Book.Reviews.Average(r => r.Rating) : 0
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
                Books = new List<BookDto>() 
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

            // Check if the book exists
            var bookExists = await _context.Books.AnyAsync(b => b.Id == dto.BookId);
            if (!bookExists) return NotFound("Książka nie istnieje.");

            // Check if the book is already on the shelf
            var alreadyOnShelf = await _context.ShelfBooks
                .AnyAsync(sb => sb.ShelfId == shelfId && sb.BookId == dto.BookId);

            if (alreadyOnShelf) return BadRequest("Ta książka już jest na tej półce.");

            // Add the book to the shelf
            _context.ShelfBooks.Add(new ShelfBook
            {
                ShelfId = shelfId,
                BookId = dto.BookId,
                AddedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Książka dodana do półki" });
        }
    }
}