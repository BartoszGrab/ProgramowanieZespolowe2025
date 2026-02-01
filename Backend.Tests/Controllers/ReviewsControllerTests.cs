using System.Security.Claims;
using backend.Controllers;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace backend.Tests.Controllers
{
    public class ReviewsControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly ReviewsController _controller;
        private readonly ClaimsPrincipal _userPrincipal;

        public ReviewsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);

            var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            _controller = new ReviewsController(_context, _userManagerMock.Object);

            var userId = "test-user-id";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            _userPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = _userPrincipal }
            };
        }

        [Fact]
        public async Task AddOrUpdateReview_AddsNewReview_WhenNoneExists()
        {
            // Arrange
            var dto = new CreateReviewDto { BookId = Guid.NewGuid(), Rating = 5, Comment = "Great!" };

            // Act
            var result = await _controller.AddOrUpdateReview(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var review = await _context.Reviews.FirstOrDefaultAsync();
            Assert.NotNull(review);
            Assert.Equal("Great!", review.Comment);
            Assert.Equal(5, review.Rating);
        }

        [Fact]
        public async Task AddOrUpdateReview_UpdatesExisting_WhenExists()
        {
            // Arrange
            var bookId = Guid.NewGuid();
            var existingReview = new Review
            {
                UserId = "test-user-id", // Matches controller user
                BookId = bookId,
                Rating = 1,
                Comment = "Bad"
            };
            _context.Reviews.Add(existingReview);
            await _context.SaveChangesAsync();

            var dto = new CreateReviewDto { BookId = bookId, Rating = 4, Comment = "Better" };

            // Act
            var result = await _controller.AddOrUpdateReview(dto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            var review = await _context.Reviews.FirstAsync();
            Assert.Equal(4, review.Rating);
            Assert.Equal("Better", review.Comment);
            Assert.Equal(1, await _context.Reviews.CountAsync()); // Still only 1 review
        }

        [Fact]
        public async Task GetMyReview_ReturnsReview_WhenExists()
        {
             // Arrange
            var bookId = Guid.NewGuid();
             var user = new ApplicationUser { Id = "test-user-id", UserName = "Tester" };
            _context.Users.Add(user);
            
            var existingReview = new Review
            {
                UserId = "test-user-id",
                BookId = bookId,
                Rating = 5,
                Comment = "Found it",
                CreatedAt = DateTime.UtcNow
            };
            _context.Reviews.Add(existingReview);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetMyReview(bookId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<ReviewDto>(okResult.Value);
            Assert.Equal("Found it", dto.Comment);
        }
    }
}
