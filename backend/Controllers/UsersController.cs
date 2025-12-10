using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public UsersController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserProfileDto>> GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null) return NotFound("User not found");

            // Calculate stats
            // Shelves Count
            var shelvesCount = await _context.Shelves.CountAsync(s => s.UserId == userId);

            // Unique Books Count: distinct BookId across all user's shelves
            var uniqueBooksCount = await _context.ShelfBooks
                .Where(sb => sb.Shelf.UserId == userId)
                .Select(sb => sb.BookId)
                .Distinct()
                .CountAsync();

            return Ok(new UserProfileDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName ?? user.UserName ?? "User",
                Email = user.Email ?? "",
                Bio = user.Bio,
                ProfilePictureUrl = user.ProfilePictureUrl,
                ShelvesCount = shelvesCount,
                UniqueBooksCount = uniqueBooksCount,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpPut("me/avatar")]
        public async Task<IActionResult> UpdateAvatar([FromBody] UpdateAvatarDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null) return NotFound("User not found");

            user.ProfilePictureUrl = dto.ProfilePictureUrl;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { message = "Avatar updated successfully", profilePictureUrl = user.ProfilePictureUrl });
            }

            return BadRequest("Failed to update avatar");
        }
    }
}
