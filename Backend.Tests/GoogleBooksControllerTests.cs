using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using backend.Controllers;
using backend.Services;

namespace backend.Tests.Controllers
{
    public class GoogleBooksControllerTests
    {
        [Fact]
        public async Task GetByIsbn_ReturnsBadRequest_WhenIsbnIsEmpty()
        {
            var svcMock = new Mock<IGoogleBooksService>();
            var ctrl = new GoogleBooksController(svcMock.Object);

            var result = await ctrl.GetByIsbn(string.Empty, CancellationToken.None);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task GetByIsbn_ReturnsNotFound_WhenServiceReturnsNull()
        {
            var svcMock = new Mock<IGoogleBooksService>();
            svcMock.Setup(s => s.GetByIsbnAsync("9788328706765", It.IsAny<CancellationToken>()))
                   .ReturnsAsync((BookDto?)null);

            var ctrl = new GoogleBooksController(svcMock.Object);

            var result = await ctrl.GetByIsbn("9788328706765", CancellationToken.None);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetByIsbn_ReturnsOk_WithBookDto()
        {
            var book = new BookDto(
                Isbn: "9788328706765",
                Title: "Example",
                Authors: new System.Collections.Generic.List<string> { "Autor" },
                Publisher: "Wydawnictwo",
                PublishedDate: "2020",
                Description: "Desc",
                PageCount: 123,
                Categories: new System.Collections.Generic.List<string> { "Fiction" },
                Thumbnail: "http://img"
            );

            var svcMock = new Mock<IGoogleBooksService>();
            svcMock.Setup(s => s.GetByIsbnAsync("9788328706765", It.IsAny<CancellationToken>()))
                   .ReturnsAsync(book);

            var ctrl = new GoogleBooksController(svcMock.Object);

            var result = await ctrl.GetByIsbn("9788328706765", CancellationToken.None);

            var ok = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<BookDto>(ok.Value);
            Assert.Equal(book.Isbn, returned.Isbn);
            Assert.Equal(book.Title, returned.Title);
        }
        [Fact]
        public async Task GoogleBooksApi_ShouldRespond()
        {
            using var client = new HttpClient();
            var url = "https://www.googleapis.com/books/v1/volumes?q=isbn:9788328706765";

            var response = await client.GetAsync(url);

            Assert.True(response.IsSuccessStatusCode);
        }
    }
}