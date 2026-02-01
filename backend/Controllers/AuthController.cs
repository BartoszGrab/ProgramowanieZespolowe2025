using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Models;
using backend.Services;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    /// <summary>
    /// API controller responsible for authentication-related operations such as login, registration and logout.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        /// <summary>
        /// User manager used to create, find and manage application users.
        /// </summary>
        private readonly UserManager<ApplicationUser> _userManager;

        /// <summary>
        /// Sign-in manager used to verify credentials and handle sign-in related operations.
        /// </summary>
        private readonly SignInManager<ApplicationUser> _signInManager;

        /// <summary>
        /// Service that generates JSON Web Tokens (JWT) for authenticated users.
        /// </summary>
        private readonly JwtService _jwtService;

        /// <summary>
        /// Strong email validation regular expression (simplified RFC 5322-compliant).
        /// The regex is compiled and uses a short timeout to mitigate ReDoS attacks.
        /// </summary>
        private static readonly Regex EmailRegex = new(
            @"^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase,
            TimeSpan.FromMilliseconds(250));

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthController"/> class.
        /// </summary>
        /// <param name="userManager">The user manager for managing users.</param>
        /// <param name="signInManager">The sign-in manager for handling authentication checks.</param>
        /// <param name="jwtService">The JWT service used to create tokens for authenticated users.</param>
        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        /// <summary>
        /// Attempts to sign in a user using email and password.
        /// </summary>
        /// <param name="loginDto">DTO containing the user's email and password.</param>
        /// <returns>
        /// Returns 200 OK with a JWT and basic user info on success; 400 Bad Request when validation fails;
        /// 401 Unauthorized when credentials are invalid or the account is locked out.
        /// </returns>
        /// <remarks>
        /// This action performs additional email format validation and enforces account lockout on repeated failed attempts.
        /// </remarks>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Validation failed",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            // Dodatkowa walidacja email
            if (!IsValidEmail(loginDto.Email))
            {
                return BadRequest(new { message = "Invalid email format" });
            }

            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: true);

            if (result.Succeeded)
            {
                var token = _jwtService.GenerateToken(user);
                return Ok(new
                {
                    message = "Login successful",
                    token,
                    userId = user.Id,
                    email = user.Email
                });
            }

            if (result.IsLockedOut)
            {
                return Unauthorized(new
                {
                    message = "Account locked due to multiple failed login attempts. Try again in 15 minutes."
                });
            }

            return Unauthorized(new { message = "Invalid email or password" });
        }

        /// <summary>
        /// Registers a new user with the provided email, display name and password.
        /// </summary>
        /// <param name="registerDto">DTO containing registration data.</param>
        /// <returns>
        /// Returns 200 OK with a JWT and basic user info on success; 400 Bad Request when validation fails or the user already exists.
        /// </returns>
        /// <remarks>
        /// This action validates display name uniqueness, enforces email format checks and prevents duplicate emails.
        /// </remarks>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    message = "Validation failed",
                    errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                });
            }

            var existingUserByDisplayName = await _userManager.Users.FirstOrDefaultAsync(u => u.DisplayName == registerDto.DisplayName);
            if (existingUserByDisplayName != null)
            {
                return BadRequest(new { message = "Display name is already taken" });
            }

            // Dodatkowa walidacja email
            if (!IsValidEmail(registerDto.Email))
            {
                return BadRequest(new { message = "Invalid email format. Please use a valid email address." });
            }

            // Sprawdź czy email już istnieje
            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "User with this email already exists" });
            }

            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                EmailConfirmed = true,
                DisplayName = registerDto.DisplayName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (result.Succeeded)
            {
                var token = _jwtService.GenerateToken(user);
                return Ok(new
                {
                    message = "Registration successful",
                    token,
                    userId = user.Id,
                    email = user.Email
                });
            }

            return BadRequest(new
            {
                message = "Registration failed",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        /// <summary>
        /// Signs out the currently authenticated user.
        /// </summary>
        /// <returns>Returns 200 OK on successful sign out.</returns>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logout successful" });
        }

        /// <summary>
        /// Validates if the provided string is a reasonable email address.
        /// </summary>
        /// <param name="email">Email address to validate.</param>
        /// <returns>True when the email appears valid; false otherwise or when the regex times out.</returns>
        /// <remarks>
        /// This method protects against ReDoS by bounding the regex execution time. It also enforces typical email length limits (RFC 5321).
        /// </remarks>
        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email) || email.Length > 254) // RFC 5321
                return false;

            try
            {
                return EmailRegex.IsMatch(email);
            }
            catch (RegexMatchTimeoutException)
            {
                return false; // Protect against ReDoS
            }
        }
    }
}