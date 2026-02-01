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
    /// <summary>
    /// Controller for managing book reviews. By default this controller requires authentication.
    /// Provides endpoints to add or update a review and to retrieve reviews for a book or for the current user.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        /// <summary>
        /// Database context for accessing reviews and related entities.
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// User manager used to lookup user information.
        /// </summary>
        private readonly UserManager<ApplicationUser> _userManager;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReviewsController"/> class.
        /// </summary>
        /// <param name="context">The application database context.</param>
        /// <param name="userManager">The user manager for user lookups.</param>
        public ReviewsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        /// <summary>
        /// Adds a new review or updates the current user's review for a given book.
        /// </summary>
        /// <param name="dto">Review creation DTO containing BookId, Rating and optional Comment.</param>
        /// <returns>
        /// 200 OK when the review is saved successfully; 401 Unauthorized when the user can't be identified; 500 on server errors.
        /// </returns>
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

        /// <summary>
        /// Retrieves the current authenticated user's review for a specific book.
        /// </summary>
        /// <param name="bookId">Identifier of the book to query.</param>
        /// <returns>200 OK with <see cref="ReviewDto"/> when found; 404 NotFound when no review exists for the user/book pair.</returns>
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

        /// <summary>
        /// Retrieves all reviews for a specific book. This endpoint is allowed for anonymous access.
        /// </summary>
        /// <param name="bookId">Identifier of the book to retrieve reviews for.</param>
        /// <returns>200 OK with a list of <see cref="ReviewDto"/>. Returns an empty list when there are no reviews.</returns>
        [HttpGet("{bookId}")]
        [AllowAnonymous] // Anyone can see reviews
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
