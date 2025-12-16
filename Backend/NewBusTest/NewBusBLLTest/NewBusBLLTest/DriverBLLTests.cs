using Microsoft.EntityFrameworkCore;
using Moq;
using NewBusBLL.Driver.Driver;
using NewBusBLL.EmailService;
using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.Token.IToken;
using NewBusDAL.Constant;
using NewBusDAL.Driver.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NUnit.Framework;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;

namespace NewBusBLL.Tests.Drivers
{
    [TestFixture]
    public class DriverBLLTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IToken> _mockToken;
        private Mock<IhashingBLL> _mockHash;
        private Mock<Iemail> _mockEmail;
        private DriverBLL _driverBLL;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockToken = new Mock<IToken>();
            _mockHash = new Mock<IhashingBLL>();
            _mockEmail = new Mock<Iemail>();
            _driverBLL = new DriverBLL(_mockUnitOfWork.Object, _mockToken.Object,
                _mockHash.Object, _mockEmail.Object);
        }

        #region AddDriver Tests

        [Test]
        public async Task AddDriver_ValidData_AddsDriver()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "driver1",
                Password = "password123",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                BusId = 1,
                CreatedByAdminID = 1
            };

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false);
            _mockUnitOfWork.Setup(u => u.Buses.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Bus, bool>>>()))
                .ReturnsAsync(true);
            _mockUnitOfWork.Setup(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(true);

            _mockHash.Setup(h => h.GenerateSaltString(8)).Returns("salttoken");

            _mockEmail.Setup(e => e.SendVerificationEmailDriver(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Drivers.AddAsync(It.IsAny<NewBusDAL.Models.Driver>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _driverBLL.AddDriver(dtoDriverCreate);

            // Assert
            _mockUnitOfWork.Verify(u => u.Drivers.AddAsync(It.IsAny<NewBusDAL.Models.Driver>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
            _mockEmail.Verify(e => e.SendVerificationEmailDriver(dtoDriverCreate.Email, "salttoken"), Times.Once);
        }

        [Test]
        public void AddDriver_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(null));
        }

        [Test]
        public void AddDriver_EmptyUsername_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "",
                Password = "password123"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
        }

        [Test]
        public void AddDriver_DuplicateUsername_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "existingdriver",
                Password = "password123",
                Email = "test@example.com",
                Phone = "1234567890"
            };

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
        }

        [Test]
        public void AddDriver_DuplicatePhone_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "newdriver",
                Password = "password123",
                Email = "test@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male
            };

            _mockUnitOfWork.SetupSequence(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false) // Username check
                .ReturnsAsync(true); // Phone check

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
        }

        [Test]
        public void AddDriver_DuplicateEmail_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "newdriver",
                Password = "password123",
                Email = "existing@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male
            };

            _mockUnitOfWork.SetupSequence(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false) // Username check
                .ReturnsAsync(false) // Phone check
                .ReturnsAsync(true); // Email check

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
        }

        [Test]
        public void AddDriver_InvalidGender_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "newdriver",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = 99 // Invalid gender
            };

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
        }

        [Test]
        public void AddDriver_InvalidBusId_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "newdriver",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                BusId = 999
            };

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false);
            _mockUnitOfWork.Setup(u => u.Buses.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Bus, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
        }

        [Test]
        public void AddDriver_InvalidAdminId_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "newdriver",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                BusId = 1,
                CreatedByAdminID = 999
            };

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false);
            _mockUnitOfWork.Setup(u => u.Buses.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Bus, bool>>>()))
                .ReturnsAsync(true);
            _mockUnitOfWork.Setup(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
        }

        [Test]
        public void AddDriver_EmailSendFailure_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverCreate = new DTODriverCreate
            {
                UserName = "newdriver",
                Password = "password123",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                BusId = 1,
                CreatedByAdminID = 1
            };

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false);
            _mockUnitOfWork.Setup(u => u.Buses.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Bus, bool>>>()))
                .ReturnsAsync(true);
            _mockUnitOfWork.Setup(u => u.Admins.IsExist(It.IsAny<Expression<Func<Admin, bool>>>()))
                .ReturnsAsync(true);

            _mockHash.Setup(h => h.GenerateSaltString(8)).Returns("salttoken");

            _mockEmail.Setup(e => e.SendVerificationEmailDriver(It.IsAny<string>(), It.IsAny<string>()))
                .ThrowsAsync(new Exception("Email service error"));

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.AddDriver(dtoDriverCreate));
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

            var driver = new NewBusDAL.Models.Driver
            {
                Id = 1,
                Password = BCrypt.Net.BCrypt.HashPassword(oldPassword)
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync(driver);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword);

            // Assert
            Assert.That(BCrypt.Net.BCrypt.Verify(newPassword, driver.Password), Is.True);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdatePasswordAsync_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.UpdatePasswordAsync(null));
        }

        [Test]
        public void UpdatePasswordAsync_EmptyPasswords_ThrowsValidationException()
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
                await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword));
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
                await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword));
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
                await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        [Test]
        public void UpdatePasswordAsync_DriverNotFound_ThrowsNotFoundException()
        {
            // Arrange
            var dtoUpdatePassword = new DTOUpdatePassword
            {
                ID = 999,
                OldPassword = "oldpass123",
                NewPassword = "newpass456"
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync((NewBusDAL.Models.Driver)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword));
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

            var driver = new NewBusDAL.Models.Driver
            {
                Id = 1,
                Password = BCrypt.Net.BCrypt.HashPassword(samePassword)
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync(driver);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword));
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

            var driver = new NewBusDAL.Models.Driver
            {
                Id = 1,
                Password = BCrypt.Net.BCrypt.HashPassword("correctpassword")
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync(driver);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword));
        }

        #endregion

        #region GetCurrentLocation Tests

        [Test]
        public async Task GetCurrentLocation_ValidId_ReturnsLocation()
        {
            // Arrange
            int driverId = 1;
            var driver = new NewBusDAL.Models.Driver
            {
                Id = driverId,
                Lat = 30.1234,
                Lang = 31.5678
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(driverId))
                .ReturnsAsync(driver);

            // Act
            var result = await _driverBLL.GetCurrentLocation(driverId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Latitude, Is.EqualTo(30.1234));
            Assert.That(result.Longitude, Is.EqualTo(31.5678));
        }

        [Test]
        public void GetCurrentLocation_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.GetCurrentLocation(-1));
        }

        [Test]
        public void GetCurrentLocation_DriverNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int driverId = 999;

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(driverId))
                .ReturnsAsync((NewBusDAL.Models.Driver)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _driverBLL.GetCurrentLocation(driverId));
        }

        #endregion

        #region DeleteDriver Tests

        [Test]
        public async Task DeleteDriver_ValidId_DeletesDriver()
        {
            // Arrange
            int driverId = 1;
            var driver = new NewBusDAL.Models.Driver { Id = driverId };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(driverId))
                .ReturnsAsync(driver);

            _mockUnitOfWork.Setup(u => u.Drivers.RemoveAsync(driverId))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _driverBLL.DeleteDriver(driverId);

            // Assert
            _mockUnitOfWork.Verify(u => u.Drivers.RemoveAsync(driverId), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void DeleteDriver_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.DeleteDriver(-1));
        }

        [Test]
        public void DeleteDriver_ZeroId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.DeleteDriver(0));
        }

        [Test]
        public void DeleteDriver_DriverNotFound_ThrowsValidationException()
        {
            // Arrange
            int driverId = 999;

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(driverId))
                .ReturnsAsync((NewBusDAL.Models.Driver)null);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.DeleteDriver(driverId));
        }

        #endregion

        #region GetAllDriver Tests

        [Test]
        public async Task GetAllDriver_HasDrivers_ReturnsAllDrivers()
        {
            // Arrange
            var drivers = new List<DTODriverRead>
            {
                new DTODriverRead { ID = 1, UserName = "driver1" },
                new DTODriverRead { ID = 2, UserName = "driver2" }
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetAllDriver())
                .ReturnsAsync(drivers);

            // Act
            var result = await _driverBLL.GetAllDriver();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(2));
        }

        [Test]
        public void GetAllDriver_NoDrivers_ThrowsNotFoundException()
        {
            // Arrange
            var emptyList = new List<DTODriverRead>();

            _mockUnitOfWork.Setup(u => u.Drivers.GetAllDriver())
                .ReturnsAsync(emptyList);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _driverBLL.GetAllDriver());
        }

        #endregion

        #region GetDriverByFirstName Tests

        [Test]
        public async Task GetDriverByFirstName_ValidName_ReturnsDrivers()
        {
            // Arrange
            string firstName = "John";
            var drivers = new List<DTODriverRead>
            {
                new DTODriverRead { ID = 1, FirstName = firstName }
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetDriverByFirstName(firstName))
                .ReturnsAsync(drivers);

            // Act
            var result = await _driverBLL.GetDriverByFirstName(firstName);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        [Test]
        public void GetDriverByFirstName_EmptyName_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.GetDriverByFirstName(""));
        }

        [Test]
        public void GetDriverByFirstName_NullName_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.GetDriverByFirstName(null));
        }

        [Test]
        public void GetDriverByFirstName_NotFound_ThrowsNotFoundException()
        {
            // Arrange
            string firstName = "NonExistent";

            _mockUnitOfWork.Setup(u => u.Drivers.GetDriverByFirstName(firstName))
                .ReturnsAsync((IEnumerable<DTODriverRead>)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _driverBLL.GetDriverByFirstName(firstName));
        }

        #endregion

        #region GetDriverByID Tests

        [Test]
        public async Task GetDriverByID_ValidId_ReturnsDriver()
        {
            // Arrange
            int driverId = 1;
            var driver = new DTODriverRead { ID = driverId, UserName = "driver1" };

            _mockUnitOfWork.Setup(u => u.Drivers.GetDriverByID(driverId))
                .ReturnsAsync(driver);

            // Act
            var result = await _driverBLL.GetDriverByID(driverId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ID, Is.EqualTo(driverId));
        }

        [Test]
        public void GetDriverByID_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.GetDriverByID(-1));
        }

        [Test]
        public void GetDriverByID_NotFound_ThrowsNotFoundException()
        {
            // Arrange
            int driverId = 999;

            _mockUnitOfWork.Setup(u => u.Drivers.GetDriverByID(driverId))
                .ReturnsAsync((DTODriverRead)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _driverBLL.GetDriverByID(driverId));
        }

        #endregion

        #region GetDriverByLastName Tests

        [Test]
        public async Task GetDriverByLastName_ValidName_ReturnsDrivers()
        {
            // Arrange
            string lastName = "Smith";
            var drivers = new List<DTODriverRead>
            {
                new DTODriverRead { ID = 1, LastName = lastName }
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetDriverByLastName(lastName))
                .ReturnsAsync(drivers);

            // Act
            var result = await _driverBLL.GetDriverByLastName(lastName);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        [Test]
        public void GetDriverByLastName_EmptyName_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.GetDriverByLastName(""));
        }

        #endregion

        #region GetDriverByPhone Tests

        [Test]
        public async Task GetDriverByPhone_ValidPhone_ReturnsDriver()
        {
            // Arrange
            string phone = "1234567890";
            var driver = new DTODriverRead { ID = 1, Phone = phone };

            _mockUnitOfWork.Setup(u => u.Drivers.GetDriverByPhone(phone))
                .ReturnsAsync(driver);

            // Act
            var result = await _driverBLL.GetDriverByPhone(phone);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Phone, Is.EqualTo(phone));
        }

        [Test]
        public void GetDriverByPhone_EmptyPhone_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.GetDriverByPhone(""));
        }

        #endregion

        #region GetDriverByUsername Tests

        [Test]
        public async Task GetDriverByUsername_ValidUsername_ReturnsDriver()
        {
            // Arrange
            string username = "driver1";
            var driver = new DTODriverRead { ID = 1, UserName = username };

            _mockUnitOfWork.Setup(u => u.Drivers.GetDriverByUsername(username))
                .ReturnsAsync(driver);

            // Act
            var result = await _driverBLL.GetDriverByUsername(username);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.UserName, Is.EqualTo(username));
        }

        [Test]
        public void GetDriverByUsername_EmptyUsername_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.GetDriverByUsername(""));
        }

        #endregion

        #region UpdateDriver Tests

        [Test]
        public async Task UpdateDriver_ValidData_UpdatesDriver()
        {
            // Arrange
            var dtoDriverUpdate = new DtoDriverUpdate
            {
                ID = 1,
                UsertName = "updateddriver",
                FirstName = "Jane",
                SecondName = "Marie",
                ThirdName = "Anne",
                LastName = "Smith"
            };

            var driver = new NewBusDAL.Models.Driver
            {
                Id = 1,
                Username = "olddriver",
                Person = new Person()
            };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(dtoDriverUpdate.ID))
                .ReturnsAsync(driver);

            _mockUnitOfWork.Setup(u => u.Drivers.UpdateAsync(driver))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _driverBLL.UpdateDriver(dtoDriverUpdate);

            // Assert
            Assert.That(driver.Username, Is.EqualTo("updateddriver"));
            Assert.That(driver.Person.FirstName, Is.EqualTo("Jane"));
            Assert.That(driver.Person.LastName, Is.EqualTo("Smith"));
            _mockUnitOfWork.Verify(u => u.Drivers.UpdateAsync(driver), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateDriver_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.UpdateDriver(null));
        }

        [Test]
        public void UpdateDriver_InvalidId_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverUpdate = new DtoDriverUpdate { ID = -1 };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.UpdateDriver(dtoDriverUpdate));
        }

        [Test]
        public void UpdateDriver_DriverNotFound_ThrowsValidationException()
        {
            // Arrange
            var dtoDriverUpdate = new DtoDriverUpdate { ID = 999 };

            _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(dtoDriverUpdate.ID))
                .ReturnsAsync((NewBusDAL.Models.Driver)null);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _driverBLL.UpdateDriver(dtoDriverUpdate));
        }
    }
}
#endregion

//#region UpdateDriverBus Tests

//[Test]
//public async Task UpdateDriverBus_ValidData_UpdatesBus()
//{
//    // Arrange
//    var dtoUpdateBus = new DTODriverUpdateBus
//    {
//        Id = 1,
//        BusId = 2
//    };

//    var driver = new NewBusDAL.Models.Driver
//    {
//        Id = 1,
//        BusId = 1
//    };

//    _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(dtoUpdateBus.Id))
//        .ReturnsAsync(driver);

//    _mockUnitOfWork.Setup(u => u.Drivers.UpdateAsync(driver))
//        .Returns(Task.CompletedTask);

//    _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

// Act
//await _driverBLL.UpdateDriverBus(dtoUpdateBus);

// Assert

