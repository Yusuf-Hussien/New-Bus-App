using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using NewBusBLL.Admins.BLL;
using NewBusBLL.EmailService;
using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.Token.IToken;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Constant;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NUnit.Framework;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;

namespace NewBusBLL.Tests.Admins
{
    [TestFixture]
    public class AdminBLLTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IMapper> _mockMapper;
        private Mock<IToken> _mockToken;
        private Mock<Iemail> _mockEmail;
        private Mock<IhashingBLL> _mockHash;
        private AdminBLL _adminBLL;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockMapper = new Mock<IMapper>();
            _mockToken = new Mock<IToken>();
            _mockEmail = new Mock<Iemail>();
            _mockHash = new Mock<IhashingBLL>();
            _adminBLL = new AdminBLL(_mockUnitOfWork.Object, _mockMapper.Object,
                _mockToken.Object, _mockEmail.Object, _mockHash.Object);
        }

        #region GetAdminByIdAsync Tests

        [Test]
        public async Task GetAdminByIdAsync_ValidId_ReturnsAdmin()
        {
            // Arrange
            int adminId = 1;
            var admin = new Admin { Id = adminId, Username = "testuser", Person = new Person() };
            var adminDto = new DTOAdminRead { ID = adminId, UserName = "testuser" };

            var mockAdmins = new List<Admin> { admin }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            _mockMapper.Setup(m => m.Map<DTOAdminRead>(admin)).Returns(adminDto);

            // Act
            var result = await _adminBLL.GetAdminByIdAsync(adminId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ID, Is.EqualTo(adminId));
            Assert.That(result.UserName, Is.EqualTo("testuser"));
        }

        [Test]
        public void GetAdminByIdAsync_InvalidId_ThrowsValidationException()
        {
            // Arrange
            int invalidId = -1;

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.GetAdminByIdAsync(invalidId));
        }

        [Test]
        public void GetAdminByIdAsync_AdminNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int adminId = 999;
            var emptyList = new List<Admin>().AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(emptyList.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.GetAdminByIdAsync(adminId));
        }

        #endregion

        #region GetAdminByFirstName Tests

        [Test]
        public async Task GetAdminByFirstName_ValidName_ReturnsAdmins()
        {
            // Arrange
            string firstName = "John";
            var admins = new List<Admin>
            {
                new Admin { Id = 1, Username = "john1", Person = new Person { FirstName = firstName } }
            };
            var adminDtos = new List<DTOAdminRead>
            {
                new DTOAdminRead { ID = 1, UserName = "john1" }
            };

            var mockAdmins = admins.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            _mockMapper.Setup(m => m.Map<List<DTOAdminRead>>(admins)).Returns(adminDtos);

            // Act
            var result = await _adminBLL.GetAdminByFirstName(firstName);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        [Test]
        public void GetAdminByFirstName_NullName_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.GetAdminByFirstName(null));
        }

        [Test]
        public void GetAdminByFirstName_NoAdminsFound_ThrowsNotFoundException()
        {
            // Arrange
            string firstName = "NonExistent";
            var emptyList = new List<Admin>().AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(emptyList.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.GetAdminByFirstName(firstName));
        }

        #endregion

        #region GetAdminByLastName Tests

        [Test]
        public async Task GetAdminByLastName_ValidName_ReturnsAdmins()
        {
            // Arrange
            string lastName = "Smith";
            var admins = new List<Admin>
            {
                new Admin { Id = 1, Username = "smith1", Person = new Person { LastName = lastName } }
            };
            var adminDtos = new List<DTOAdminRead>
            {
                new DTOAdminRead { ID = 1, UserName = "smith1" }
            };

            var mockAdmins = admins.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            _mockMapper.Setup(m => m.Map<List<DTOAdminRead>>(admins)).Returns(adminDtos);

            // Act
            var result = await _adminBLL.GetAdminByLastName(lastName);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        #endregion

        #region GetAdminByPhone Tests

        [Test]
        public async Task GetAdminByPhone_ValidPhone_ReturnsAdmin()
        {
            // Arrange
            string phone = "1234567890";
            var admin = new Admin { Id = 1, Username = "testuser", Person = new Person { Phone = phone } };
            var adminDto = new DTOAdminRead { ID = 1, UserName = "testuser" };

            var mockAdmins = new List<Admin> { admin }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            _mockMapper.Setup(m => m.Map<DTOAdminRead>(admin)).Returns(adminDto);

            // Act
            var result = await _adminBLL.GetAdminByPhone(phone);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ID, Is.EqualTo(1));
        }

        #endregion

        #region GetAdminByUsernameAsync Tests

        [Test]
        public async Task GetAdminByUsernameAsync_ValidUsername_ReturnsAdmin()
        {
            // Arrange
            string username = "testuser";
            var admin = new Admin { Id = 1, Username = username, Person = new Person() };
            var adminDto = new DTOAdminRead { ID = 1, UserName = username };

            var mockAdmins = new List<Admin> { admin }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            _mockMapper.Setup(m => m.Map<DTOAdminRead>(admin)).Returns(adminDto);

            // Act
            var result = await _adminBLL.GetAdminByUsernameAsync(username);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.UserName, Is.EqualTo(username));
        }

        #endregion

        #region GetAllAdminsAsync Tests

        [Test]
        public async Task GetAllAdminsAsync_HasAdmins_ReturnsAllAdmins()
        {
            // Arrange
            var admins = new List<Admin>
            {
                new Admin { Id = 1, Username = "user1", Person = new Person() },
                new Admin { Id = 2, Username = "user2", Person = new Person() }
            };
            var adminDtos = new List<DTOAdminRead>
            {
                new DTOAdminRead { ID = 1, UserName = "user1" },
                new DTOAdminRead { ID = 2, UserName = "user2" }
            };

            var mockAdmins = admins.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(null, It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            _mockMapper.Setup(m => m.Map<IEnumerable<DTOAdminRead>>(admins)).Returns(adminDtos);

            // Act
            var result = await _adminBLL.GetAllAdminsAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(2));
        }

        #endregion

        #region VerifyEmail Tests

        [Test]
        public async Task VerifyEmail_ValidToken_ReturnsTrue()
        {
            // Arrange
            string plainToken = "testtoken123";
            string hashedToken = BCrypt.Net.BCrypt.HashPassword(plainToken);

            var admins = new List<Admin>
            {
                new Admin { Id = 1, Token = hashedToken, Isverified = false }
            };

            var mockAdmins = admins.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                null))
                .Returns(mockAdmins.Object);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            var result = await _adminBLL.VerifyEmail(plainToken);

            // Assert
            Assert.That(result, Is.True);
            Assert.That(admins[0].Isverified, Is.True);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public async Task VerifyEmail_InvalidToken_ReturnsFalse()
        {
            // Arrange
            string invalidToken = "invalidtoken";
            var admins = new List<Admin>
            {
                new Admin { Id = 1, Token = BCrypt.Net.BCrypt.HashPassword("differenttoken"), Isverified = false }
            };

            var mockAdmins = admins.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                null))
                .Returns(mockAdmins.Object);

            // Act
            var result = await _adminBLL.VerifyEmail(invalidToken);

            // Assert
            Assert.That(result, Is.False);
            Assert.That(admins[0].Isverified, Is.False);
        }

        #endregion

        #region AddAdminAsync Tests

        [Test]
        public async Task AddAdminAsync_ValidData_AddsAdmin()
        {
            // Arrange
            var dtoAdminCreate = new DTOAdminCreate
            {
                UserName = "newuser",
                Password = "password123",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male
            };

            _mockUnitOfWork.Setup(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(false);

            _mockHash.Setup(h => h.GenerateSaltString(8)).Returns("salttoken");

            _mockEmail.Setup(e => e.SendVerificationEmailAdmin(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Admins.AddAsync(It.IsAny<Admin>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _adminBLL.AddAdminAsync(dtoAdminCreate);

            // Assert
            _mockUnitOfWork.Verify(u => u.Admins.AddAsync(It.IsAny<Admin>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
            _mockEmail.Verify(e => e.SendVerificationEmailAdmin(dtoAdminCreate.Email, "salttoken"), Times.Once);
        }

        [Test]
        public void AddAdminAsync_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.AddAdminAsync(null));
        }

        [Test]
        public void AddAdminAsync_EmptyUsername_ThrowsValidationException()
        {
            // Arrange
            var dtoAdminCreate = new DTOAdminCreate
            {
                UserName = "",
                Password = "password123"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.AddAdminAsync(dtoAdminCreate));
        }

        [Test]
        public void AddAdminAsync_DuplicateUsername_ThrowsValidationException()
        {
            // Arrange
            var dtoAdminCreate = new DTOAdminCreate
            {
                UserName = "existinguser",
                Password = "password123",
                Email = "test@example.com",
                Phone = "1234567890"
            };

            _mockUnitOfWork.Setup(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.AddAdminAsync(dtoAdminCreate));
        }

        [Test]
        public void AddAdminAsync_DuplicateEmail_ThrowsValidationException()
        {
            // Arrange
            var dtoAdminCreate = new DTOAdminCreate
            {
                UserName = "newuser",
                Password = "password123",
                Email = "existing@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male
            };

            _mockUnitOfWork.SetupSequence(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(false) // Username check
                .ReturnsAsync(false) // Phone check
                .ReturnsAsync(true); // Email check

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.AddAdminAsync(dtoAdminCreate));
        }

        [Test]
        public void AddAdminAsync_DuplicatePhone_ThrowsValidationException()
        {
            // Arrange
            var dtoAdminCreate = new DTOAdminCreate
            {
                UserName = "newuser",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male
            };

            _mockUnitOfWork.SetupSequence(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(false) // Username check
                .ReturnsAsync(true); // Phone check

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.AddAdminAsync(dtoAdminCreate));
        }

        [Test]
        public void AddAdminAsync_InvalidGender_ThrowsValidationException()
        {
            // Arrange
            var dtoAdminCreate = new DTOAdminCreate
            {
                UserName = "newuser",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = 99 // Invalid gender
            };

            _mockUnitOfWork.Setup(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.AddAdminAsync(dtoAdminCreate));
        }

        [Test]
        public void AddAdminAsync_EmailSendFailure_ThrowsValidationException()
        {
            // Arrange
            var dtoAdminCreate = new DTOAdminCreate
            {
                UserName = "newuser",
                Password = "password123",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male
            };

            _mockUnitOfWork.Setup(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(false);

            _mockHash.Setup(h => h.GenerateSaltString(8)).Returns("salttoken");

            _mockEmail.Setup(e => e.SendVerificationEmailAdmin(It.IsAny<string>(), It.IsAny<string>()))
                .ThrowsAsync(new Exception("Email service error"));

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.AddAdminAsync(dtoAdminCreate));
        }

        #endregion

        #region UpdateAdminAsync Tests

        [Test]
        public async Task UpdateAdminAsync_ValidData_UpdatesAdmin()
        {
            // Arrange
            var dtoAdminUpdate = new DTOAdminUpdate
            {
                ID = 1,
                UsertName = "updateduser",
                FirstName = "Jane",
                SecondName = "Marie",
                ThirdName = "Anne",
                LastName = "Smith",
                Gender = enGender.Female.ToString()
            };

            var admin = new Admin
            {
                Id = 1,
                Username = "olduser",
                Person = new Person()
            };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(dtoAdminUpdate.ID))
                .ReturnsAsync(admin);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _adminBLL.UpdateAdminAsync(dtoAdminUpdate);

            // Assert
            Assert.That(admin.Username, Is.EqualTo("updateduser"));
            Assert.That(admin.Person.FirstName, Is.EqualTo("Jane"));
            Assert.That(admin.Person.LastName, Is.EqualTo("Smith"));
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateAdminAsync_AdminNotFound_ThrowsNotFoundException()
        {
            // Arrange
            var dtoAdminUpdate = new DTOAdminUpdate { ID = 999 };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(dtoAdminUpdate.ID))
                .ReturnsAsync((Admin)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.UpdateAdminAsync(dtoAdminUpdate));
        }

        #endregion

        #region DeleteAdminAsync Tests

        [Test]
        public async Task DeleteAdminAsync_ValidId_DeletesAdmin()
        {
            // Arrange
            int adminId = 1;
            var admin = new Admin { Id = adminId };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(adminId))
                .ReturnsAsync(admin);

            _mockUnitOfWork.Setup(u => u.Admins.RemoveAsync(adminId))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _adminBLL.DeleteAdminAsync(adminId);

            // Assert
            _mockUnitOfWork.Verify(u => u.Admins.RemoveAsync(adminId), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void DeleteAdminAsync_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.DeleteAdminAsync(-1));
        }

        [Test]
        public void DeleteAdminAsync_ZeroId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.DeleteAdminAsync(0));
        }

        [Test]
        public void DeleteAdminAsync_AdminNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int adminId = 999;

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(adminId))
                .ReturnsAsync((Admin)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.DeleteAdminAsync(adminId));
        }

        #endregion

        #region UpdatePasswordAsync Tests

        [Test]
        public async Task UpdatePasswordAsync_ValidData_UpdatesPassword()
        {
            // Arrange
            string oldPassword = "oldpass123";
            string newPassword = "newpass456";

            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = 1,
                OldPassword = oldPassword,
                NewPassword = newPassword
            };

            var admin = new Admin
            {
                Id = 1,
                Password = BCrypt.Net.BCrypt.HashPassword(oldPassword)
            };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync(admin);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword);

            // Assert
            Assert.That(BCrypt.Net.BCrypt.Verify(newPassword, admin.Password), Is.True);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdatePasswordAsync_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.UpdatePasswordAsync(null));
        }

        [Test]
        public void UpdatePasswordAsync_EmptyOldPassword_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = 1,
                OldPassword = "",
                NewPassword = "newpass456"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        [Test]
        public void UpdatePasswordAsync_ShortPassword_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = 1,
                OldPassword = "short",
                NewPassword = "short2"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        [Test]
        public void UpdatePasswordAsync_InvalidId_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = -1,
                OldPassword = "oldpass123",
                NewPassword = "newpass456"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        [Test]
        public void UpdatePasswordAsync_AdminNotFound_ThrowsNotFoundException()
        {
            // Arrange
            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = 999,
                OldPassword = "oldpass123",
                NewPassword = "newpass456"
            };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync((Admin)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        [Test]
        public void UpdatePasswordAsync_WrongOldPassword_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = 1,
                OldPassword = "wrongpassword",
                NewPassword = "newpass456"
            };

            var admin = new Admin
            {
                Id = 1,
                Password = BCrypt.Net.BCrypt.HashPassword("correctpassword")
            };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync(admin);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        [Test]
        public void UpdatePasswordAsync_SamePassword_ThrowsValidationException()
        {
            // Arrange
            string samePassword = "password123";

            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = 1,
                OldPassword = samePassword,
                NewPassword = samePassword
            };

            var admin = new Admin
            {
                Id = 1,
                Password = BCrypt.Net.BCrypt.HashPassword(samePassword)
            };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync(admin);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        #endregion

        #region Login Tests

        [Test]
        public async Task Login_ValidCredentials_ReturnsToken()
        {
            // Arrange
            string username = "testuser";
            string password = "password123";

            var dtoLogin = new DTOLogin
            {
                UserName = username,
                Password = password
            };

            var admin = new Admin
            {
                Id = 1,
                Username = username,
                Password = BCrypt.Net.BCrypt.HashPassword(password),
                Isverified = true,
                Person = new Person()
            };

            var tokenResponse = new DTOReturnLogin { AccessToken = "jwt-token-here" };

            var mockAdmins = new List<Admin> { admin }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            _mockToken.Setup(t => t.GenerateToken(dtoLogin, Roles.Admin))
                .ReturnsAsync(tokenResponse);

            // Act
            var result = await _adminBLL.Login(dtoLogin);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.AccessToken, Is.EqualTo("jwt-token-here"));
        }

        [Test]
        public void Login_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.Login(null));
        }

        [Test]
        public void Login_NullUsername_ThrowsValidationException()
        {
            // Arrange
            var dtoLogin = new DTOLogin
            {
                UserName = null,
                Password = "password123"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _adminBLL.Login(dtoLogin));
        }

        [Test]
        public void Login_InvalidUsername_ThrowsNotFoundException()
        {
            // Arrange
            var dtoLogin = new DTOLogin
            {
                UserName = "nonexistent",
                Password = "password123"
            };

            var emptyList = new List<Admin>().AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(emptyList.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.Login(dtoLogin));
        }

        [Test]
        public void Login_InvalidPassword_ThrowsNotFoundException()
        {
            // Arrange
            var dtoLogin = new DTOLogin
            {
                UserName = "testuser",
                Password = "wrongpassword"
            };

            var admin = new Admin
            {
                Id = 1,
                Username = "testuser",
                Password = BCrypt.Net.BCrypt.HashPassword("correctpassword"),
                Isverified = true,
                Person = new Person()
            };

            var mockAdmins = new List<Admin> { admin }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockAdmins.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.Login(dtoLogin));
        }

        [Test]
        public void Login_UnverifiedAdmin_ThrowsNotFoundException()
        {
            // Arrange
            var dtoLogin = new DTOLogin
            {
                UserName = "testuser",
                Password = "password123"
            };

            var admin = new Admin
            {
                Id = 1,
                Username = "testuser",
                Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                Isverified = false,
                Person = new Person()
            };

            var emptyList = new List<Admin>().AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Admins.getallIncludeBy(
                It.IsAny<Expression<Func<Admin, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(emptyList.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _adminBLL.Login(dtoLogin));
        }

        #endregion
    }

    // Helper extension to mock DbSet for testing
    public static class MockDbSetExtensions
    {
        public static Mock<DbSet<T>> BuildMockDbSet<T>(this IQueryable<T> data) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IAsyncEnumerable<T>>()
                .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
                .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));

            mockSet.As<IQueryable<T>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<T>(data.Provider));

            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(data.GetEnumerator());

            return mockSet;
        }
    }

    // Helper classes for async LINQ operations
    internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;

        internal TestAsyncQueryProvider(IQueryProvider inner)
        {
            _inner = inner;
        }

        public IQueryable CreateQuery(Expression expression)
        {
            return new TestAsyncEnumerable<TEntity>(expression);
        }

        public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
        {
            return new TestAsyncEnumerable<TElement>(expression);
        }

        public object Execute(Expression expression)
        {
            return _inner.Execute(expression);
        }

        public TResult Execute<TResult>(Expression expression)
        {
            return _inner.Execute<TResult>(expression);
        }

        public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
        {
            var resultType = typeof(TResult).GetGenericArguments()[0];
            var executionResult = typeof(IQueryProvider)
                .GetMethod(
                    name: nameof(IQueryProvider.Execute),
                    genericParameterCount: 1,
                    types: new[] { typeof(Expression) })
                .MakeGenericMethod(resultType)
                .Invoke(this, new[] { expression });

            return (TResult)typeof(Task).GetMethod(nameof(Task.FromResult))
                ?.MakeGenericMethod(resultType)
                .Invoke(null, new[] { executionResult });
        }
    }

    internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable) { }

        public TestAsyncEnumerable(Expression expression) : base(expression) { }

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        {
            return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        }

        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }

    internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;

        public TestAsyncEnumerator(IEnumerator<T> inner)
        {
            _inner = inner;
        }

        public ValueTask DisposeAsync()
        {
            _inner.Dispose();
            return ValueTask.CompletedTask;
        }

        public ValueTask<bool> MoveNextAsync()
        {
            return ValueTask.FromResult(_inner.MoveNext());
        }

        public T Current => _inner.Current;
    }
}