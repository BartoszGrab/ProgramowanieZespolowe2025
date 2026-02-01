using System.Security.Claims;
using backend.Controllers;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace backend.Tests.Controllers
{
    public class ShelvesControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<IGoogleBooksService> _googleBooksMock;
        private readonly ShelvesController _controller;
        private readonly ClaimsPrincipal _userPrincipal;

        public ShelvesControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
                .Options;

            _context = new ApplicationDbContext(options);
            _googleBooksMock = new Mock<IGoogleBooksService>();

            // Setup User Context
            var userId = "test-user-id";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, "TestUser")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            _userPrincipal = new ClaimsPrincipal(identity);

            _controller = new ShelvesController(_context, _googleBooksMock.Object);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = _userPrincipal }
            };
        }

        [Fact]
        public async Task GetMyShelves_ReturnsOnlyMyShelves()
        {
            // Arrange
            _context.Shelves.Add(new Shelf { Id = Guid.NewGuid(), Name = "My Shelf", UserId = "test-user-id" });
            _context.Shelves.Add(new Shelf { Id = Guid.NewGuid(), Name = "Other Shelf", UserId = "other-user-id" });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetMyShelves();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var shelves = Assert.IsType<List<ShelfDto>>(okResult.Value);
            
            Assert.Single(shelves);
            Assert.Equal("My Shelf", shelves[0].Name);
        }

        [Fact]
        public async Task CreateShelf_CreatesShelf_WhenNameIsUnique()
        {
            // Arrange
            var dto = new CreateShelfDto { Name = "New Shelf" };

            // Act
            var result = await _controller.CreateShelf(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var shelf = Assert.IsType<ShelfDto>(okResult.Value);
            Assert.Equal("New Shelf", shelf.Name);

            var dbShelf = await _context.Shelves.FirstOrDefaultAsync(s => s.Name == "New Shelf");
            Assert.NotNull(dbShelf);
            Assert.Equal("test-user-id", dbShelf.UserId);
        }

        [Fact]
        public async Task CreateShelf_ReturnsBadRequest_WhenNameExists()
        {
            // Arrange
            _context.Shelves.Add(new Shelf { Name = "Existing", UserId = "test-user-id" });
            await _context.SaveChangesAsync();

            var dto = new CreateShelfDto { Name = "Existing" };

            // Act
            var result = await _controller.CreateShelf(dto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Masz już półkę o tej nazwie.", badRequest.Value);
        }

        [Fact]
        public async Task RemoveBookFromShelf_RemovesBook_WhenOwned()
        {
            // Arrange
            var shelfId = Guid.NewGuid();
            var bookId = Guid.NewGuid();
            
            var shelf = new Shelf { Id = shelfId, UserId = "test-user-id" };
            var book = new Book { Id = bookId, Title = "B", ISBN = "1", CoverUrl = "u", Description = "d" };
            
            _context.Shelves.Add(shelf);
            _context.Books.Add(book);
            _context.ShelfBooks.Add(new ShelfBook { ShelfId = shelfId, BookId = bookId, AddedAt = DateTime.UtcNow });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.RemoveBookFromShelf(shelfId, bookId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            var exists = await _context.ShelfBooks.AnyAsync(sb => sb.ShelfId == shelfId && sb.BookId == bookId);
            Assert.False(exists);
        }
    }
}
