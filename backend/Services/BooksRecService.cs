using System.Net.Http.Json;
using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// HTTP client service for communicating with the books-rec microservice.
    /// </summary>
    public class BooksRecService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BooksRecService> _logger;

        public BooksRecService(HttpClient httpClient, ILogger<BooksRecService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        /// <summary>
        /// Get book recommendations from the books-rec service.
        /// </summary>
        public async Task<RecommendationResponseDto?> GetRecommendationsAsync(RecommendationRequestDto request)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("/recommend", request);
                
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<RecommendationResponseDto>();
                }

                var error = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Books-rec service returned {StatusCode}: {Error}", 
                    response.StatusCode, error);
                
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to books-rec service");
                throw;
            }
        }

        /// <summary>
        /// Check the health of the books-rec service.
        /// </summary>
        public async Task<BooksRecHealthDto?> CheckHealthAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/health");
                return await response.Content.ReadFromJsonAsync<BooksRecHealthDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to check books-rec service health");
                return new BooksRecHealthDto
                {
                    Status = "unavailable",
                    Error = ex.Message,
                    Hint = "Make sure books-rec service is running"
                };
            }
        }
    }
}
