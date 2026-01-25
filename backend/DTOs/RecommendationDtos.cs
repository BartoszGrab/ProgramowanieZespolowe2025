using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.DTOs
{
    /// <summary>
    /// A book from user's reading history for recommendation request.
    /// </summary>
    public class BookInputDto
    {
        [Required]
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [JsonPropertyName("author")]
        public string Author { get; set; } = string.Empty;

        [JsonPropertyName("genre")]
        public string? Genre { get; set; }

        [JsonPropertyName("rating")]
        [Range(1, 5)]
        public int? Rating { get; set; }
    }

    /// <summary>
    /// Request for book recommendations.
    /// </summary>
    public class RecommendationRequestDto
    {
        [JsonPropertyName("user_id")]
        public string? UserId { get; set; }

        [JsonPropertyName("preferred_language")]
        public string PreferredLanguage { get; set; } = "pl";

        [Required]
        [MinLength(1)]
        [JsonPropertyName("history")]
        public List<BookInputDto> History { get; set; } = new List<BookInputDto>();
    }

    /// <summary>
    /// A recommended book from the books-rec service.
    /// </summary>
    public class RecommendedBookDto
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("author")]
        public string Author { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("genre")]
        public string? Genre { get; set; }

        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;

        [JsonPropertyName("match_score")]
        public double MatchScore { get; set; }
    }

    /// <summary>
    /// A Netflix-style recommendation category (shelf).
    /// </summary>
    public class RecommendationCategoryDto
    {
        [JsonPropertyName("category_title")]
        public string CategoryTitle { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("items")]
        public List<RecommendedBookDto> Items { get; set; } = new List<RecommendedBookDto>();
    }

    /// <summary>
    /// Full recommendation response with multiple categories.
    /// </summary>
    public class RecommendationResponseDto
    {
        [JsonPropertyName("recommendations")]
        public List<RecommendationCategoryDto> Recommendations { get; set; } = new List<RecommendationCategoryDto>();
    }

    /// <summary>
    /// Health check response from books-rec service.
    /// </summary>
    public class BooksRecHealthDto
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("books_indexed")]
        public int? BooksIndexed { get; set; }

        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("hint")]
        public string? Hint { get; set; }
    }
}
