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
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReviewsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // POST: api/reviews
        [HttpPost]
        public async Task<ActionResult> AddOrUpdateReview([FromBody] CreateReviewDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            try 
            {
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.BookId == dto.BookId && r.UserId == userId);

                if (existingReview != null)
                {
                    // Update existing
                    existingReview.Rating = dto.Rating;
                    existingReview.Comment = dto.Comment;
                    existingReview.CreatedAt = DateTime.UtcNow; 
                }
                else
                {
                    // Create new
                    var review = new Review
                    {
                        UserId = userId,
                        BookId = dto.BookId,
                        Rating = dto.Rating,
                        Comment = dto.Comment,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Reviews.Add(review);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Recenzja zapisana." });
            }
            catch (Exception ex)
            {
                // Log exception (console for now)
                Console.Error.WriteLine($"Error saving review: {ex.Message}");
                return StatusCode(500, "Internal server error while saving review.");
            }
        }

        // GET: api/reviews/my/{bookId}
        [HttpGet("my/{bookId}")]
        public async Task<ActionResult<ReviewDto>> GetMyReview(Guid bookId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var review = await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.BookId == bookId && r.UserId == userId);

            if (review == null) return NotFound();

            return Ok(new ReviewDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                UserName = review.User.UserName ?? "Unknown",
                UserAvatarUrl = review.User.ProfilePictureUrl,
                CreatedAt = review.CreatedAt,
                BookId = review.BookId
            });
        }

        // GET: api/reviews/{bookId}
        [HttpGet("{bookId}")]
        [AllowAnonymous] // Anyone can see reviews? Let's say yes, or Auth required as per class attribute
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetBookReviews(Guid bookId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    UserName = r.User.UserName ?? "Unknown",
                    UserAvatarUrl = r.User.ProfilePictureUrl,
                    CreatedAt = r.CreatedAt,
                    BookId = r.BookId
                })
                .ToListAsync();

            return Ok(reviews);
        }
    }
}
