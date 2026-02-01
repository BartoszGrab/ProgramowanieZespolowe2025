using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using backend.Controllers;
using backend.Services;
using backend.DTOs;

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
                   .ReturnsAsync((GoogleBook?)null);

            var ctrl = new GoogleBooksController(svcMock.Object);

            var result = await ctrl.GetByIsbn("9788328706765", CancellationToken.None);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetByIsbn_ReturnsOk_WithBook()
        {
            var book = new GoogleBook(
                Id: "123",
                Isbn: "9788328706765",
                Title: "Example",
                Authors: new List<string> { "Autor" },
                Publisher: "Wydawnictwo",
                PublishedDate: "2020",
                Description: "Desc",
                PageCount: 123,
                Categories: new List<string> { "Fiction" },
                Thumbnail: "http://img"
            );

            var svcMock = new Mock<IGoogleBooksService>();
            svcMock.Setup(s => s.GetByIsbnAsync("9788328706765", It.IsAny<CancellationToken>()))
                   .ReturnsAsync(book);

            var ctrl = new GoogleBooksController(svcMock.Object);

            var result = await ctrl.GetByIsbn("9788328706765", CancellationToken.None);

            var ok = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<GoogleBook>(ok.Value);
            Assert.Equal(book.Isbn, returned.Isbn);
            Assert.Equal(book.Title, returned.Title);
        }

    }
}