using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/books/google")]
    public class GoogleBooksController : ControllerBase
    {
        private readonly IGoogleBooksService _svc;

        public GoogleBooksController(IGoogleBooksService svc) => _svc = svc;

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