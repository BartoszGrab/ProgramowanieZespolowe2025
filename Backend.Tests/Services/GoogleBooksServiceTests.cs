using System.Net;
using System.Text.Json;
using backend.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace backend.Tests.Services
{
    public class GoogleBooksServiceTests
    {
        private readonly Mock<HttpMessageHandler> _httpHandlerMock;
        private readonly HttpClient _httpClient;
        private readonly Mock<IConfiguration> _configMock;
        private readonly IMemoryCache _memoryCache;
        private readonly Mock<ILogger<GoogleBooksService>> _loggerMock;
        private readonly GoogleBooksService _service;

        public GoogleBooksServiceTests()
        {
            _httpHandlerMock = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_httpHandlerMock.Object)
            {
                BaseAddress = new Uri("https://www.googleapis.com/books/v1/")
            };

            _configMock = new Mock<IConfiguration>();
            _configMock.Setup(c => c["GoogleBooks:ApiKey"]).Returns("DummyKey");

            _memoryCache = new MemoryCache(new MemoryCacheOptions());
            _loggerMock = new Mock<ILogger<GoogleBooksService>>();

            _service = new GoogleBooksService(_httpClient, _configMock.Object, _memoryCache, _loggerMock.Object);
        }

        [Fact]
        public async Task SearchBooksAsync_ReturnsBooks_WhenApiReturnsResults()
        {
            // Arrange
            var jsonResponse = JsonSerializer.Serialize(new
            {
                items = new[]
                {
                    new
                    {
                        volumeInfo = new
                        {
                            title = "Test Book",
                            authors = new[] { "Test Author" },
                            industryIdentifiers = new[]
                            {
                                new { type = "ISBN_13", identifier = "9781234567890" }
                            }
                        }
                    }
                }
            });

            _httpHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(jsonResponse)
                });

            // Act
            var result = await _service.SearchBooksAsync("Harry Potter");

            // Assert
            Assert.Single(result);
            Assert.Equal("Test Book", result[0].Title);
            Assert.Equal("9781234567890", result[0].Isbn);
        }

        [Fact]
        public async Task SearchBooksAsync_ReturnsEmpty_WhenApiReturnsError()
        {
            // Arrange
            _httpHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.BadRequest
                });

            // Act
            var result = await _service.SearchBooksAsync("Invalid Query");

            // Assert
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetByIsbnAsync_ReturnsBook_WhenFound()
        {
             // Arrange
            var jsonResponse = JsonSerializer.Serialize(new
            {
                totalItems = 1,
                items = new[]
                {
                    new
                    {
                        volumeInfo = new
                        {
                            title = "Specific Book",
                            authors = new[] { "Author X" }
                        }
                    }
                }
            });

            _httpHandlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req => req.RequestUri!.ToString().Contains("isbn:978123")),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(jsonResponse)
                });

            // Act
            var result = await _service.GetByIsbnAsync("978123");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Specific Book", result!.Title);
        }
    }
}
