using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services
{
    public record GoogleBook(
        string Id, // Volume ID
        string? Isbn,
        string? Title,
        List<string>? Authors,
        string? Publisher,
        string? PublishedDate,
        string? Description,
        int? PageCount,
        List<string>? Categories,
        string? Thumbnail
    );

    public interface IGoogleBooksService
    {
        Task<GoogleBook?> GetByIsbnAsync(string isbn, CancellationToken ct = default);
        Task<GoogleBook?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default);
        Task<List<GoogleBook>> SearchBooksAsync(string query, int maxResults = 10, CancellationToken ct = default);
    }

    public class GoogleBooksService : IGoogleBooksService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;
        private readonly ILogger<GoogleBooksService> _logger;

        public GoogleBooksService(HttpClient http, IConfiguration config, IMemoryCache cache, ILogger<GoogleBooksService> logger)
        {
            _http = http;
            _config = config;
            _cache = cache;
            _logger = logger;
        }

        public async Task<List<GoogleBook>> SearchBooksAsync(string query, int maxResults = 10, CancellationToken ct = default)
        {
            var cacheKey = $"search_{query}_{maxResults}";
            if (_cache.TryGetValue(cacheKey, out List<GoogleBook>? cachedResults) && cachedResults != null)
            {
                _logger.LogInformation($"[Cache] Hit for query: {query}");
                return cachedResults;
            }

            _logger.LogInformation($"[Search] Querying Google Books for: {query}");

            var key = _config["GoogleBooks:ApiKey"];
            var url = $"volumes?q={Uri.EscapeDataString(query)}&maxResults={maxResults}" + (string.IsNullOrEmpty(key) ? "" : $"&key={key}");

            using var res = await _http.GetAsync(url, ct);
            if (!res.IsSuccessStatusCode)
            {
                var errorContent = await res.Content.ReadAsStringAsync(ct);
                _logger.LogError($"[GoogleBooks API Error] Status: {res.StatusCode}, Content: {errorContent}");
                return new List<GoogleBook>();
            }

            using var stream = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("items", out var items) || items.ValueKind != JsonValueKind.Array)
            {
                _logger.LogWarning($"[Search] Found 0 results or invalid JSON structure for: {query}");
                return new List<GoogleBook>();
            }

            var results = new List<GoogleBook>();
            foreach (var item in items.EnumerateArray())
            {
                 var book = ParseVolume(item);
                 if (book != null) results.Add(book);
            }

            _cache.Set(cacheKey, results, TimeSpan.FromHours(1));
            _logger.LogInformation($"[Search] Cached {results.Count} results for: {query}");
            
            return results;
        }

        public async Task<GoogleBook?> GetByIsbnAsync(string isbn, CancellationToken ct = default)
        {
            // Similar caching logic could go here
            var key = _config["GoogleBooks:ApiKey"];
            var url = $"volumes?q=isbn:{isbn}" + (string.IsNullOrEmpty(key) ? "" : $"&key={key}");

            using var res = await _http.GetAsync(url, ct);
            if (!res.IsSuccessStatusCode) return null;

            using var stream = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("totalItems", out var total) || total.GetInt32() == 0) return null;
            var item = root.GetProperty("items")[0];
            return ParseVolume(item);
        }

        public async Task<GoogleBook?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default)
        {
            var key = _config["GoogleBooks:ApiKey"];
            var url = $"volumes/{googleId}" + (string.IsNullOrEmpty(key) ? "" : $"?key={key}");

            using var res = await _http.GetAsync(url, ct);
            if (!res.IsSuccessStatusCode) return null;

            using var stream = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement; 

            return ParseVolume(root);
        }

        private GoogleBook? ParseVolume(JsonElement item)
        {
            if (!item.TryGetProperty("volumeInfo", out var info)) return null;
            var volumeId = item.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : "";

            string? extractIsbn()
            {
                if (!info.TryGetProperty("industryIdentifiers", out var ids)) return null;
                foreach (var id in ids.EnumerateArray())
                {
                    if (id.TryGetProperty("type", out var t) && t.GetString() == "ISBN_13" &&
                        id.TryGetProperty("identifier", out var ident))
                        return ident.GetString();
                }
                var first = ids.EnumerateArray().FirstOrDefault();
                if (first.ValueKind != JsonValueKind.Undefined && first.TryGetProperty("identifier", out var ident2))
                    return ident2.GetString();
                return null;
            }

            List<string> readStringList(JsonElement elem)
            {
                return elem.ValueKind == JsonValueKind.Array
                    ? elem.EnumerateArray().Select(x => x.GetString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList()
                    : new List<string>();
            }

            return new GoogleBook(
                Id: volumeId,
                Isbn: extractIsbn(),
                Title: info.TryGetProperty("title", out var t) ? t.GetString() : null,
                Authors: info.TryGetProperty("authors", out var a) ? readStringList(a) : new List<string>(),
                Publisher: info.TryGetProperty("publisher", out var p) ? p.GetString() : null,
                PublishedDate: info.TryGetProperty("publishedDate", out var pd) ? pd.GetString() : null,
                Description: info.TryGetProperty("description", out var d) ? d.GetString() : null,
                PageCount: info.TryGetProperty("pageCount", out var pc) && pc.ValueKind == JsonValueKind.Number ? pc.GetInt32() : null,
                Categories: info.TryGetProperty("categories", out var c) ? readStringList(c) : new List<string>(),
                Thumbnail: info.TryGetProperty("imageLinks", out var il) && il.TryGetProperty("thumbnail", out var th) ? th.GetString() : null
            );
        }
    }
}