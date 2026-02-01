using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Models;
using backend.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace backend.Tests.Services
{
    public class JwtServiceTests
    {
        private readonly Mock<IConfiguration> _configMock;
        private readonly JwtService _service;

        public JwtServiceTests()
        {
            _configMock = new Mock<IConfiguration>();
            _configMock.Setup(c => c["Jwt:Key"]).Returns("ThisIsAVeryLongSecretKeyForTestingPurposeOnly!123");
            _configMock.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
            _configMock.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

            _service = new JwtService(_configMock.Object);
        }

        [Fact]
        public void GenerateToken_ReturnsValidToken()
        {
            // Arrange
            var user = new ApplicationUser
            {
                Id = "user1",
                Email = "test@example.com",
                DisplayName = "Test User"
            };

            // Act
            var token = _service.GenerateToken(user);

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(token));

            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            Assert.Equal("TestIssuer", jwt.Issuer);
            Assert.Equal("TestAudience", jwt.Audiences.First());
            Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "user1");
            Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "test@example.com");
            Assert.Contains(jwt.Claims, c => c.Type == "display_name" && c.Value == "Test User");
        }

        [Fact]
        public void GenerateToken_Throws_WhenKeyIsMissing()
        {
            // Arrange
            var configMock = new Mock<IConfiguration>();
            var service = new JwtService(configMock.Object); // No key setup

            // Act & Assert
            Assert.Throws<InvalidOperationException>(() => service.GenerateToken(new ApplicationUser()));
        }
    }
}
