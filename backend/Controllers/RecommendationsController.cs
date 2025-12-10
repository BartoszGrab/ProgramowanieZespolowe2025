using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly BooksRecService _booksRecService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RecommendationsController> _logger;

        public RecommendationsController(
            BooksRecService booksRecService, 
            ApplicationDbContext context,
            ILogger<RecommendationsController> logger)
        {
            _booksRecService = booksRecService;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get book recommendations based on user's reading history.
        /// Recommendations are saved to the database for later retrieval.
        /// </summary>
        /// <param name="request">Reading history and preferences</param>
        /// <returns>Netflix-style categorized recommendations</returns>
        [HttpPost]
        public async Task<ActionResult<RecommendationResponseDto>> GetRecommendations([FromBody] RecommendationRequestDto request)
        {
            if (request.History == null || request.History.Count == 0)
            {
                return BadRequest("At least one book in history is required");
            }

            try
            {
                var recommendations = await _booksRecService.GetRecommendationsAsync(request);
                
                if (recommendations == null)
                {
                    return StatusCode(503, new { error = "Books recommendation service unavailable" });
                }

                // Save recommendations to database
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // null if not authenticated
                
                // Delete old recommendations for this user
                var oldRecommendations = await _context.UserRecommendations
                    .Where(r => r.UserId == userId)
                    .ToListAsync();
                _context.UserRecommendations.RemoveRange(oldRecommendations);

                // Save new recommendations
                foreach (var category in recommendations.Recommendations)
                {
                    var userRec = new UserRecommendation
                    {
                        UserId = userId,
                        CategoryTitle = category.CategoryTitle,
                        CategoryType = category.Type,
                        RecommendationsJson = JsonSerializer.Serialize(category.Items),
                        GeneratedAt = DateTime.UtcNow
                    };
                    _context.UserRecommendations.Add(userRec);
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Saved {Count} recommendation categories", recommendations.Recommendations.Count);

                return Ok(recommendations);
            }
            catch (HttpRequestException)
            {
                return StatusCode(503, new { 
                    error = "Cannot connect to books recommendation service",
                    hint = "Make sure books-rec service is running on the configured URL"
                });
            }
        }

        /// <summary>
        /// Get saved recommendations from the database.
        /// </summary>
        [HttpGet("saved")]
        public async Task<ActionResult<RecommendationResponseDto>> GetSavedRecommendations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var savedRecs = await _context.UserRecommendations
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.GeneratedAt)
                .ToListAsync();

            if (!savedRecs.Any())
            {
                return NotFound(new { message = "No saved recommendations found. Generate some first using POST /api/recommendations" });
            }

            var response = new RecommendationResponseDto
            {
                Recommendations = savedRecs.Select(r => new RecommendationCategoryDto
                {
                    CategoryTitle = r.CategoryTitle,
                    Type = r.CategoryType,
                    Items = JsonSerializer.Deserialize<List<RecommendedBookDto>>(r.RecommendationsJson) ?? new List<RecommendedBookDto>()
                }).ToList()
            };

            return Ok(response);
        }

        /// <summary>
        /// Check health of the books-rec microservice.
        /// </summary>
        [HttpGet("health")]
        public async Task<ActionResult<BooksRecHealthDto>> CheckHealth()
        {
            var health = await _booksRecService.CheckHealthAsync();
            return Ok(health);
        }
    }
}
