using Moq;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.LogoutService;
using NewBusDAL.DTO_General;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NUnit.Framework;
namespace NewBusBLL.Tests.LogoutBLL
{
    [TestFixture]
    public class LogoutBLLTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IhashingBLL> _mockHash;
        private NewBusBLL.LogoutService.LogoutBLL _logoutBLL;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockHash = new Mock<IhashingBLL>();
            _logoutBLL = new NewBusBLL.LogoutService.LogoutBLL(_mockUnitOfWork.Object, _mockHash.Object);
        }

        [Test]
        public async Task Logout_ValidToken_DeactivatesToken()
        {
            // Arrange
            var dtoLogout = new DtoLogout { RefreshToken = "valid-token" };
            var tokens = new List<RefreshToken>
            {
                new RefreshToken { Id = 1, Token = "hashed-token", Salt = "salt", IsActive = true }
            };

            _mockUnitOfWork.Setup(u => u.RefreshTokens.GetAllAsync())
                .ReturnsAsync(tokens);
            _mockHash.Setup(h => h.IsPasswordCorrect("valid-token", "hashed-token", "salt"))
                .Returns(true);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _logoutBLL.Logout(dtoLogout);

            // Assert
            Assert.That(tokens[0].IsActive, Is.False);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }



        [Test]
        public async Task GetTokenByRefreshToken_ValidToken_ReturnsToken()
        {
            // Arrange
            string refreshToken = "valid-token";
            var tokens = new List<RefreshToken>
            {
                new RefreshToken { Id = 1, Token = "hashed-token", Salt = "salt", IsActive = true }
            };

            _mockUnitOfWork.Setup(u => u.RefreshTokens.GetAllAsync())
                .ReturnsAsync(tokens);
            _mockHash.Setup(h => h.IsPasswordCorrect(refreshToken, "hashed-token", "salt"))
                .Returns(true);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            var result = await _logoutBLL.GetTokenByRefreshToken(refreshToken);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(1));
        }

        [Test]
        public async Task GetTokenByRefreshToken_InvalidToken_ReturnsNull()
        {
            // Arrange
            string refreshToken = "invalid-token";
            var tokens = new List<RefreshToken>
            {
                new RefreshToken { Id = 1, Token = "hashed-token", Salt = "salt", IsActive = true }
            };

            _mockUnitOfWork.Setup(u => u.RefreshTokens.GetAllAsync())
                .ReturnsAsync(tokens);
            _mockHash.Setup(h => h.IsPasswordCorrect(refreshToken, "hashed-token", "salt"))
                .Returns(false);

            // Act
            var result = await _logoutBLL.GetTokenByRefreshToken(refreshToken);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task IsRefreshTokenActive_ActiveToken_ReturnsTrue()
        {
            // Arrange
            var token = new RefreshToken { IsActive = true };

            // Act
            var result = await _logoutBLL.IsRefreshTokenActive(token);

            // Assert
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task IsRefreshTokenActive_InactiveToken_ReturnsFalse()
        {
            // Arrange
            var token = new RefreshToken { IsActive = false };

            // Act
            var result = await _logoutBLL.IsRefreshTokenActive(token);

            // Assert
            Assert.That(result, Is.False);
        }
    }
}