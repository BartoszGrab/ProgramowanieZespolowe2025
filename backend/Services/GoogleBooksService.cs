using System.Text.Json;

namespace backend.Services
{
    public record BookDto(
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
        Task<BookDto?> GetByIsbnAsync(string isbn, CancellationToken ct = default);
    }

    public class GoogleBooksService : IGoogleBooksService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;

        public GoogleBooksService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _config = config;
        }

        public async Task<BookDto?> GetByIsbnAsync(string isbn, CancellationToken ct = default)
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
            var info = item.GetProperty("volumeInfo");

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

            var dto = new BookDto(
                Isbn: extractIsbn(),
                Title: info.GetProperty("title").GetString(),
                Authors: info.TryGetProperty("authors", out var a) ? readStringList(a) : new List<string>(),
                Publisher: info.TryGetProperty("publisher", out var p) ? p.GetString() : null,
                PublishedDate: info.TryGetProperty("publishedDate", out var pd) ? pd.GetString() : null,
                Description: info.TryGetProperty("description", out var d) ? d.GetString() : null,
                PageCount: info.TryGetProperty("pageCount", out var pc) && pc.ValueKind == JsonValueKind.Number ? pc.GetInt32() : null,
                Categories: info.TryGetProperty("categories", out var c) ? readStringList(c) : new List<string>(),
                Thumbnail: info.TryGetProperty("imageLinks", out var il) && il.TryGetProperty("thumbnail", out var t) ? t.GetString() : null
            );

            return dto;
        }
    }
}