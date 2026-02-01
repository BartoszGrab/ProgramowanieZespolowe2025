using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    /// <summary>
    /// API controller responsible for managing authors.
    /// Provides endpoints for listing and creating authors.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorsController : ControllerBase
    {
        /// <summary>
        /// Database context used to access author data.
        /// </summary>
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthorsController"/> class.
        /// </summary>
        /// <param name="context">The application database context.</param>
        public AuthorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all authors from the database.
        /// </summary>
        /// <returns>200 OK with a list of authors.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Authors.ToListAsync());
        }

        /// <summary>
        /// Creates a new author record.
        /// </summary>
        /// <param name="author">Author model to be created.</param>
        /// <returns>200 OK with the created author on success. Requires authorization.</returns>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(Author author)
        {
            _context.Authors.Add(author);
            await _context.SaveChangesAsync();
            return Ok(author);
        }
    }
}