using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    /// <summary>
    /// Controller for querying Google Books API and returning external book information.
    /// </summary>
    [ApiController]
    [Route("api/books/google")]
    public class GoogleBooksController : ControllerBase
    {
        /// <summary>
        /// Service used to query Google Books for book data.
        /// </summary>
        private readonly IGoogleBooksService _svc;

        /// <summary>
        /// Initializes a new instance of the <see cref="GoogleBooksController"/> class.
        /// </summary>
        /// <param name="svc">Service used to query Google Books.</param>
        public GoogleBooksController(IGoogleBooksService svc) => _svc = svc;

        /// <summary>
        /// Retrieves book metadata from Google Books by ISBN.
        /// </summary>
        /// <param name="isbn">ISBN of the book to look up. This parameter is required.</param>
        /// <param name="ct">Cancellation token for the request.</param>
        /// <returns>
        /// 200 OK with book data when found; 400 Bad Request when isbn is missing; 404 Not Found if the book is not found.
        /// </returns>
        [HttpGet]
        public async Task<IActionResult> GetByIsbn([FromQuery] string isbn, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(isbn)) return BadRequest("isbn required");
            var book = await _svc.GetByIsbnAsync(isbn, ct);
            if (book is null) return NotFound();
            return Ok(book);
        }
    }
}