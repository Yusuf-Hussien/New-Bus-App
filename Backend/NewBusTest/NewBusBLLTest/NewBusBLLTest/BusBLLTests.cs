using AutoMapper;
using Moq;
using NewBusBLL.AdminConnection;
using NewBusBLL.Bus.BusBll;
using NewBusBLL.DriverConnection;
using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.LogoutService;
using NewBusBLL.Route.Route;
using NewBusBLL.StationTrips;
using NewBusBLL.StudentConnection;
using NewBusDAL.Bus.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.StationTrip;
using NUnit.Framework;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;

namespace NewBusBLL.Tests.BusBLLTest
{
    #region BusBLL Tests

    [TestFixture]
    public class BusBLLTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IMapper> _mockMapper;
        private BusBLL _busBLL;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockMapper = new Mock<IMapper>();
            _busBLL = new BusBLL(_mockUnitOfWork.Object, _mockMapper.Object);
        }

        [Test]
        public async Task AddBusAsync_ValidBus_AddsBus()
        {
            // Arrange
            var bus = new NewBusDAL.Models.Bus
            {
                PlateNo = "ABC123",
                Capacity = 50,
                Status = (int)enStatusBus.Active
            };

            _mockUnitOfWork.Setup(u => u.Buses.AddAsync(bus))
                .Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _busBLL.AddBusAsync(bus);

            // Assert
            _mockUnitOfWork.Verify(u => u.Buses.AddAsync(bus), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void AddBusAsync_NullBus_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.AddBusAsync(null));
        }

        [Test]
        public void AddBusAsync_EmptyPlateNo_ThrowsValidationException()
        {
            // Arrange
            var bus = new NewBusDAL.Models.Bus
            {
                PlateNo = "",
                Capacity = 50,
                Status = (int)enStatusBus.Active
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.AddBusAsync(bus));
        }

        [Test]
        public void AddBusAsync_ZeroCapacity_ThrowsValidationException()
        {
            // Arrange
            var bus = new NewBusDAL.Models.Bus
            {
                PlateNo = "ABC123",
                Capacity = 0,
                Status = (int)enStatusBus.Active
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.AddBusAsync(bus));
        }

        [Test]
        public void AddBusAsync_InvalidStatus_ThrowsValidationException()
        {
            // Arrange
            var bus = new NewBusDAL.Models.Bus
            {
                PlateNo = "ABC123",
                Capacity = 50,
                Status = 999
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.AddBusAsync(bus));
        }

        [Test]
        public async Task GetAllBusesAsync_HasBuses_ReturnsAllBuses()
        {
            // Arrange
            var buses = new List<NewBusDAL.Models.Bus>
            {
                new NewBusDAL.Models.Bus { Id = 1, PlateNo = "ABC123" },
                new NewBusDAL.Models.Bus { Id = 2, PlateNo = "XYZ789" }
            };
            var busDtos = new List<DtoBusRead>
            {
                new DtoBusRead { ID = 1, PlateNo = "ABC123" },
                new DtoBusRead { ID = 2, PlateNo = "XYZ789" }
            };

            _mockUnitOfWork.Setup(u => u.Buses.GetAllAsync())
                .ReturnsAsync(buses);
            _mockMapper.Setup(m => m.Map<IEnumerable<DtoBusRead>>(buses))
                .Returns(busDtos);

            // Act
            var result = await _busBLL.GetAllBusesAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(2));
        }

        [Test]
        public void GetAllBusesAsync_NoBuses_ThrowsNotFoundException()
        {
            // Arrange
            var emptyList = new List<NewBusDAL.Models.Bus>();
            _mockUnitOfWork.Setup(u => u.Buses.GetAllAsync())
                .ReturnsAsync(emptyList);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _busBLL.GetAllBusesAsync());
        }

        [Test]
        public async Task GetBusByIdAsync_ValidId_ReturnsBus()
        {
            // Arrange
            int busId = 1;
            var bus = new NewBusDAL.Models.Bus { Id = busId, PlateNo = "ABC123" };
            var busDto = new DtoBusRead { ID = busId, PlateNo = "ABC123" };

            _mockUnitOfWork.Setup(u => u.Buses.GetByIdAsync(busId))
                .ReturnsAsync(bus);
            _mockMapper.Setup(m => m.Map<DtoBusRead>(bus))
                .Returns(busDto);

            // Act
            var result = await _busBLL.GetBusByIdAsync(busId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ID, Is.EqualTo(busId));
        }

        [Test]
        public void GetBusByIdAsync_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.GetBusByIdAsync(-1));
        }

        [Test]
        public void GetBusByIdAsync_BusNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int busId = 999;
            _mockUnitOfWork.Setup(u => u.Buses.GetByIdAsync(busId))
                .ReturnsAsync((NewBusDAL.Models.Bus)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _busBLL.GetBusByIdAsync(busId));
        }

        [Test]
        public async Task RemoveBusAsync_ValidId_RemovesBus()
        {
            // Arrange
            int busId = 1;
            var bus = new NewBusDAL.Models.Bus { Id = busId };

            _mockUnitOfWork.Setup(u => u.Buses.GetByIdAsync(busId))
                .ReturnsAsync(bus);
            _mockUnitOfWork.Setup(u => u.Buses.RemoveAsync(busId))
                .Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _busBLL.RemoveBusAsync(busId);

            // Assert
            _mockUnitOfWork.Verify(u => u.Buses.RemoveAsync(busId), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void RemoveBusAsync_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.RemoveBusAsync(-1));
        }

        [Test]
        public async Task UpdateBusAsync_ValidData_UpdatesBus()
        {
            // Arrange
            var dtoBusUpdate = new DtoBusUpdate
            {
                ID = 1,
                Status = (int)enStatusBus.UnderMaintenance
            };
            var existingBus = new NewBusDAL.Models.Bus
            {
                Id = 1,
                Status = (int)enStatusBus.Active
            };

            _mockUnitOfWork.Setup(u => u.Buses.GetByIdAsync(dtoBusUpdate.ID))
                .ReturnsAsync(existingBus);
            _mockUnitOfWork.Setup(u => u.Buses.UpdateAsync(existingBus))
                .Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _busBLL.UpdateBusAsync(dtoBusUpdate);

            // Assert
            Assert.That(existingBus.Status, Is.EqualTo((int)enStatusBus.UnderMaintenance));
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateBusAsync_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.UpdateBusAsync(null));
        }

        [Test]
        public void UpdateBusAsync_InvalidStatus_ThrowsValidationException()
        {
            // Arrange
            var dtoBusUpdate = new DtoBusUpdate
            {
                ID = 1,
                Status = 999
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _busBLL.UpdateBusAsync(dtoBusUpdate));
        }

        [Test]
        public async Task GetStatusBusAsync_HasBuses_ReturnsStatusBuses()
        {
            // Arrange
            var buses = new List<NewBusDAL.Models.Bus>
            {
                new NewBusDAL.Models.Bus { Id = 1, Status = (int)enStatusBus.Active }
            };
            var statusBuses = new List<DTOStatusBus>
            {
                new DTOStatusBus { Id = 1, Status = Convert.ToString(enStatusBus.Active )!}
            };

            _mockUnitOfWork.Setup(u => u.Buses.GetAllAsync())
                .ReturnsAsync(buses);
            _mockMapper.Setup(m => m.Map<IEnumerable<DTOStatusBus>>(buses))
                .Returns(statusBuses);

            // Act
            var result = await _busBLL.GetStatusBusAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }
    }

    #endregion
}