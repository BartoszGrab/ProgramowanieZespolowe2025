using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using MockQueryable.Moq;

namespace backend.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
        private readonly Mock<SignInManager<ApplicationUser>> _signInManagerMock;
        // private readonly Mock<JwtService> _jwtServiceMock; // Removed unused
        // JwtService is a class, let's see if we can instantiate it or need to mock it. 
        // It has dependencies IConfiguration. Better to Mock the service if we can, or use real one with mocked config.
        // For this test, let's use a real JwtService with mocked Config to ensure integration, OR mock it to focus on Controller.
        // Controller depends on it. Ideally verify it's called.
        
        // However, JwtService method GenerateToken is not virtual, so Moq might fail to mock it properly unless we wrap it in interface.
        // Checking JwtService... it's a class and GenerateToken is non-virtual.
        // CHANGE: I'll use a real JwtService with mocked IConfiguration for simplicity, or modify JwtService to be mockable.
        // BUT I cannot modify source code easily.
        // I will use real JwtService with Mock<IConfiguration>.
        
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
             var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);

            var contextAccessorMock = new Mock<IHttpContextAccessor>();
            var userPrincipalFactoryMock = new Mock<IUserClaimsPrincipalFactory<ApplicationUser>>();
            _signInManagerMock = new Mock<SignInManager<ApplicationUser>>(
                _userManagerMock.Object, contextAccessorMock.Object, userPrincipalFactoryMock.Object, null, null, null, null);

            var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            configMock.Setup(c => c["Jwt:Key"]).Returns("SuperSecretKeyForTesting12345678");
            configMock.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
            configMock.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");
            
            var jwtService = new JwtService(configMock.Object);

            _controller = new AuthController(_userManagerMock.Object, _signInManagerMock.Object, jwtService);
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenCredentialsAreValid()
        {
            // Arrange
            var loginDto = new LoginDto { Email = "test@example.com", Password = "Password123!" };
            var user = new ApplicationUser { Id = "1", Email = "test@example.com", DisplayName = "Test" };

            _userManagerMock.Setup(u => u.FindByEmailAsync(loginDto.Email))
                .ReturnsAsync(user);

            _signInManagerMock.Setup(s => s.CheckPasswordSignInAsync(user, loginDto.Password, true))
                .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            // Verify token is present
            // We can check returned object structure via reflection or dynamic
            var val = okResult.Value;
            var tokenProp = val.GetType().GetProperty("token");
            Assert.NotNull(tokenProp);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenUserNotFound()
        {
            // Arrange
            var loginDto = new LoginDto { Email = "unknown@example.com", Password = "pwd" };
            _userManagerMock.Setup(u => u.FindByEmailAsync(loginDto.Email))
                .ReturnsAsync((ApplicationUser)null);

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var dto = new RegisterDto { Email = "new@example.com", Password = "Pass123!", DisplayName = "NewUser" };
            
            // Mock Users for DisplayName check
            var users = new List<ApplicationUser>().AsQueryable().BuildMock();
            _userManagerMock.Setup(u => u.Users).Returns(users);
            
            _userManagerMock.Setup(u => u.FindByEmailAsync(dto.Email)).ReturnsAsync((ApplicationUser)null);
            _userManagerMock.Setup(u => u.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
                .ReturnsAsync(IdentityResult.Success);
            
            // Act
            var result = await _controller.Register(dto);
            
            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
        
        // Simplified Register test for invalid email (logic handled by controller)
        [Fact]
        public async Task Register_ReturnsBadRequest_WhenEmailInvalid()
        {
            var dto = new RegisterDto { Email = "invalid-email", Password = "pwd", DisplayName = "Name" };
            _controller.ModelState.AddModelError("Email", "Invalid"); 
            // Actually controller checks ModelState.IsValid first.
            
            var result = await _controller.Register(dto);
            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
// Helper for Async Enumerable if needed, but omitted for brevity.
