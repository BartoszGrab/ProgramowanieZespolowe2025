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
        [HttpGet]
        public async Task<ActionResult<List<UserCommunityDto>>> GetUsers()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var users = await _userManager.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Where(u => u.Id != currentUserId) // Exclude current user
                .ToListAsync();

            var userDtos = users.Select(u => new UserCommunityDto
            {
                Id = u.Id,
                DisplayName = u.DisplayName ?? u.UserName ?? "User",
                Bio = u.Bio,
                ProfilePictureUrl = u.ProfilePictureUrl,
                FollowersCount = u.Followers.Count,
                FollowingCount = u.Following.Count,
                IsFollowing = u.Followers.Any(f => f.ObserverId == currentUserId)
            }).ToList();

            return Ok(userDtos);
        }

        [HttpPost("{id}/follow")]
        public async Task<IActionResult> FollowUser(string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == id) return BadRequest("You cannot follow yourself");

            var targetUser = await _userManager.FindByIdAsync(id);
            if (targetUser == null) return NotFound("User not found");

            var existingFollow = await _context.UserFollows
                .FirstOrDefaultAsync(f => f.ObserverId == currentUserId && f.TargetId == id);

            if (existingFollow != null) return BadRequest("You are already following this user");

            var follow = new UserFollow
            {
                ObserverId = currentUserId,
                TargetId = id
            };

            _context.UserFollows.Add(follow);
            
            // Update counts manually or rely on DB triggers/computed columns? 
            // For now, let's keep it simple and rely on Count() queries or explicit properties if mapped properly.
            // But ApplicationUser has properties like FollowersCount, we should update them if they are stored columns.
            // Checking ApplicationUser.cs, FollowersCount has { get; set; } = 0; implying it's a stored column.
            
           // However, keeping counts in sync can be tricky. Ideally we should use the count of the collection.
            // But let's check ApplicationUser.cs again. It seems they are properties. 
            // I will update them to be safe, but typically we'd calculate them.
            // Let's increment them for now.
            /* 
            // TODO: Better to calculate these dynamically or use a service method to ensure consistency
            // But for this quick implementation:
             var currentUser = await _userManager.FindByIdAsync(currentUserId);
             currentUser.FollowingCount++;
             targetUser.FollowersCount++; 
            */

            await _context.SaveChangesAsync();

            return Ok(new { message = "Followed successfully" });
        }

        [HttpDelete("{id}/follow")]
        public async Task<IActionResult> UnfollowUser(string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var follow = await _context.UserFollows
                .FirstOrDefaultAsync(f => f.ObserverId == currentUserId && f.TargetId == id);

            if (follow == null) return BadRequest("You are not following this user");

            _context.UserFollows.Remove(follow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Unfollowed successfully" });
        }
    }
}
