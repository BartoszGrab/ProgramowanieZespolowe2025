using System.Text.Json;

namespace backend.Services
{
    /// <summary>
    /// Lightweight representation of a book as returned by the Google Books API.
    /// </summary>
    /// <param name="Id">Volume identifier assigned by Google Books.</param>
    /// <param name="Isbn">Primary ISBN (preferably ISBN-13) when available.</param>
    /// <param name="Title">Book title.</param>
    /// <param name="Authors">List of author names.</param>
    /// <param name="Publisher">Publisher name.</param>
    /// <param name="PublishedDate">Raw published date string from Google Books.</param>
    /// <param name="Description">Book description or summary.</param>
    /// <param name="PageCount">Number of pages when available.</param>
    /// <param name="Categories">List of category names (genres).</param>
    /// <param name="Thumbnail">URL for a small thumbnail image.</param>
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

    /// <summary>
    /// Abstraction for querying Google Books for book metadata.
    /// </summary>
    public interface IGoogleBooksService
    {
        /// <summary>
        /// Looks up a single Google Book entry by ISBN.
        /// </summary>
        /// <param name="isbn">ISBN to search for.</param>
        /// <param name="ct">Optional cancellation token.</param>
        /// <returns>A <see cref="GoogleBook"/> when found; otherwise <c>null</c>.</returns>
        Task<GoogleBook?> GetByIsbnAsync(string isbn, CancellationToken ct = default);

        /// <summary>
        /// Retrieves a Google Book by its Google volume ID.
        /// </summary>
        /// <param name="googleId">Google Books volume identifier.</param>
        /// <param name="ct">Optional cancellation token.</param>
        /// <returns>A <see cref="GoogleBook"/> when found; otherwise <c>null</c>.</returns>
        Task<GoogleBook?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default);

        /// <summary>
        /// Searches Google Books for a query string and returns a list of matches.
        /// </summary>
        /// <param name="query">Search query term(s).</param>
        /// <param name="maxResults">Maximum number of results to return.</param>
        /// <param name="ct">Optional cancellation token.</param>
        /// <returns>List of matching <see cref="GoogleBook"/> items (may be empty).</returns>
        Task<List<GoogleBook>> SearchBooksAsync(string query, int maxResults = 10, CancellationToken ct = default);
    }

    /// <summary>
    /// Implementation of <see cref="IGoogleBooksService"/> that calls the Google Books REST API.
    /// </summary>
    public class GoogleBooksService : IGoogleBooksService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;

        /// <summary>
        /// Initializes a new <see cref="GoogleBooksService"/>.
        /// </summary>
        /// <param name="http">An <see cref="HttpClient"/> configured for the Google Books API base address.</param>
        /// <param name="config">Configuration providing the optional API key.</param>
        public GoogleBooksService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _config = config;
        }

        /// <summary>
        /// Searches Google Books for a text query and returns up to <paramref name="maxResults"/> matches.
        /// </summary>
        /// <param name="query">Search term(s).</param>
        /// <param name="maxResults">Maximum number of results to return (default 10).</param>
        /// <param name="ct">Optional cancellation token.</param>
        /// <returns>List of <see cref="GoogleBook"/> results (empty list when none or on non-successful HTTP responses).</returns>
        public async Task<List<GoogleBook>> SearchBooksAsync(string query, int maxResults = 10, CancellationToken ct = default)
        {
            var key = _config["GoogleBooks:ApiKey"];
            var url = $"volumes?q={Uri.EscapeDataString(query)}&maxResults={maxResults}" + (string.IsNullOrEmpty(key) ? "" : $"&key={key}");

            using var res = await _http.GetAsync(url, ct);
            if (!res.IsSuccessStatusCode) return new List<GoogleBook>();

            using var stream = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("items", out var items) || items.ValueKind != JsonValueKind.Array)
                return new List<GoogleBook>();

            var results = new List<GoogleBook>();
            foreach (var item in items.EnumerateArray())
            {
                 var book = ParseVolume(item);
                 if (book != null) results.Add(book);
            }
            return results;
        }

        /// <summary>
        /// Looks up a single Google Books volume by its ISBN.
        /// </summary>
        /// <param name="isbn">ISBN to lookup (e.g. ISBN-10 or ISBN-13).</param>
        /// <param name="ct">Optional cancellation token.</param>
        /// <returns>The matched <see cref="GoogleBook"/> or <c>null</c> when not found or on non-successful HTTP responses.</returns>
        public async Task<GoogleBook?> GetByIsbnAsync(string isbn, CancellationToken ct = default)
        {
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

        /// <summary>
        /// Retrieves a Google Books volume by its Google volume identifier.
        /// </summary>
        /// <param name="googleId">Google Books volume ID.</param>
        /// <param name="ct">Optional cancellation token.</param>
        /// <returns>The <see cref="GoogleBook"/> when found; otherwise <c>null</c>.</returns>
        public async Task<GoogleBook?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default)
        {
            var key = _config["GoogleBooks:ApiKey"];
            var url = $"volumes/{googleId}" + (string.IsNullOrEmpty(key) ? "" : $"?key={key}");

            using var res = await _http.GetAsync(url, ct);
            if (!res.IsSuccessStatusCode) return null;

            using var stream = await res.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement; // The root is the volume object itself for this endpoint

            return ParseVolume(root);
        }

        /// <summary>
        /// Parses a JSON element representing a Google Books volume into a <see cref="GoogleBook"/> record.
        /// </summary>
        /// <param name="item">JSON element containing volume and volumeInfo fields.</param>
        /// <returns>A <see cref="GoogleBook"/> or <c>null</c> when mandatory information is missing.</returns>
        private GoogleBook? ParseVolume(JsonElement item)
        {
             // ID is usually at root level of item, volumeInfo is property
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