using System.Security.Claims;
using System.Text.Json;
using backend.Controllers;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace backend.Tests.Controllers
{
    public class RecommendationsControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<IBooksRecService> _booksRecMock;
        private readonly Mock<ILogger<RecommendationsController>> _loggerMock;
        private readonly RecommendationsController _controller;

        public RecommendationsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _booksRecMock = new Mock<IBooksRecService>();
            _loggerMock = new Mock<ILogger<RecommendationsController>>();

            _controller = new RecommendationsController(_booksRecMock.Object, _context, _loggerMock.Object);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetRecommendations_ReturnsOk_WhenServiceReturnsData()
        {
            // Arrange
            var req = new RecommendationRequestDto 
            { 
                History = new List<BookInputDto> 
                { 
                    new BookInputDto { Title = "Book1", Author = "Auth1" } 
                } 
            };
            var svcResponse = new RecommendationResponseDto
            {
                Recommendations = new List<RecommendationCategoryDto>
                {
                    new RecommendationCategoryDto 
                    { 
                        CategoryTitle = "Top Picks", 
                        Type = "top", 
                        Items = new List<RecommendedBookDto> 
                        { 
                            new RecommendedBookDto { Title = "RecBook1" } 
                        } 
                    }
                }
            };

            _booksRecMock.Setup(s => s.GetRecommendationsAsync(It.IsAny<RecommendationRequestDto>()))
                .ReturnsAsync(svcResponse);

            // Act
            var result = await _controller.GetRecommendations(req);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returned = Assert.IsType<RecommendationResponseDto>(okResult.Value);
            Assert.Single(returned.Recommendations);
            
            // Verify DB save
            var saved = await _context.UserRecommendations.ToListAsync();
            Assert.Single(saved);
            Assert.Equal("Top Picks", saved[0].CategoryTitle);
        }

        [Fact]
        public async Task GetRecommendations_Returns503_WhenServiceFails()
        {
            // Arrange
            _booksRecMock.Setup(s => s.GetRecommendationsAsync(It.IsAny<RecommendationRequestDto>()))
                .ReturnsAsync((RecommendationResponseDto?)null);

            // Act
            var result = await _controller.GetRecommendations(new RecommendationRequestDto 
            { 
                History = new List<BookInputDto> 
                { 
                    new BookInputDto { Title = "X", Author = "Y" } 
                } 
            });

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(503, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetSavedRecommendations_ReturnsData_WhenExists()
        {
            // Arrange
            var rec = new UserRecommendation
            {
                 UserId = "test-user-id",
                 CategoryTitle = "Saved Cat",
                 CategoryType = "saved",
                 RecommendationsJson = JsonSerializer.Serialize(new List<RecommendedBookDto>()),
                 GeneratedAt = DateTime.UtcNow
            };
            _context.UserRecommendations.Add(rec);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetSavedRecommendations();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<RecommendationResponseDto>(okResult.Value);
            Assert.Single(dto.Recommendations);
            Assert.Equal("Saved Cat", dto.Recommendations[0].CategoryTitle);
        }
    }
}
