using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Authors.ToListAsync());
        }

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