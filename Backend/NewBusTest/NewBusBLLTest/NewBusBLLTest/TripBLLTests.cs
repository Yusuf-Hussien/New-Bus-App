using Moq;
using NewBusBLL.Exceptions;
using NewBusBLL.Trip;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Trip.DTO;
using NUnit.Framework;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;

namespace NewBusBLL.Tests.Trips
{
    [TestFixture]
    public class TripBLLTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private TripBLL _tripBLL;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _tripBLL = new TripBLL(_mockUnitOfWork.Object);
        }

        #region AddTrip Tests

        [Test]
        public async Task AddTrip_ValidData_AddsTrip()
        {
            // Arrange
            var dtoTripCreate = new DtoTripCreate
            {
                RouteID = 1,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1
            };

            var addedTrip = new NewBusDAL.Models.Trip
            {
                Id = 1,
                RouteID = 1,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1,
                StartAt = DateTime.Now
            };

            _mockUnitOfWork.Setup(u => u.Routes.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Route, bool>>>()))
                .ReturnsAsync(true);

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(true);

            _mockUnitOfWork.Setup(u => u.Trips.AddAsync(It.IsAny<NewBusDAL.Models.Trip>()))
                .Callback<NewBusDAL.Models.Trip>(t => t.Id = 1)
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            var result = await _tripBLL.AddTrip(dtoTripCreate);

            // Assert
            Assert.That(result, Is.GreaterThan(0));
            _mockUnitOfWork.Verify(u => u.Trips.AddAsync(It.IsAny<NewBusDAL.Models.Trip>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void AddTrip_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.AddTrip(null));
        }

        [Test]
        public void AddTrip_InvalidStatusTrip_ThrowsValidationException()
        {
            // Arrange
            var dtoTripCreate = new DtoTripCreate
            {
                RouteID = 1,
                StatusTripId = 999, // Invalid status
                CreatedByDriverId = 1
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.AddTrip(dtoTripCreate));
        }

        [Test]
        public void AddTrip_InvalidRouteID_ThrowsValidationException()
        {
            // Arrange
            var dtoTripCreate = new DtoTripCreate
            {
                RouteID = -1,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.AddTrip(dtoTripCreate));
        }

        [Test]
        public void AddTrip_ZeroRouteID_ThrowsValidationException()
        {
            // Arrange
            var dtoTripCreate = new DtoTripCreate
            {
                RouteID = 0,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.AddTrip(dtoTripCreate));
        }

        [Test]
        public void AddTrip_RouteNotFound_ThrowsValidationException()
        {
            // Arrange
            var dtoTripCreate = new DtoTripCreate
            {
                RouteID = 999,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1
            };

            _mockUnitOfWork.Setup(u => u.Routes.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Route, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.AddTrip(dtoTripCreate));
        }

        [Test]
        public void AddTrip_DriverNotFound_ThrowsValidationException()
        {
            // Arrange
            var dtoTripCreate = new DtoTripCreate
            {
                RouteID = 1,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 999
            };

            _mockUnitOfWork.Setup(u => u.Routes.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Route, bool>>>()))
                .ReturnsAsync(true);

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.AddTrip(dtoTripCreate));
        }

        [Test]
        public async Task AddTrip_WithCompletedStatus_AddsTrip()
        {
            // Arrange
            var dtoTripCreate = new DtoTripCreate
            {
                RouteID = 1,
                StatusTripId = (int)enStatusTrip.Completed,
                CreatedByDriverId = 1
            };

            _mockUnitOfWork.Setup(u => u.Routes.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Route, bool>>>()))
                .ReturnsAsync(true);

            _mockUnitOfWork.Setup(u => u.Drivers.IsExist(It.IsAny<Expression<Func<NewBusDAL.Models.Driver, bool>>>()))
                .ReturnsAsync(true);

            _mockUnitOfWork.Setup(u => u.Trips.AddAsync(It.IsAny<NewBusDAL.Models.Trip>()))
                .Callback<NewBusDAL.Models.Trip>(t => t.Id = 1)
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            var result = await _tripBLL.AddTrip(dtoTripCreate);

            // Assert
            Assert.That(result, Is.GreaterThan(0));
        }

        #endregion

        #region CancelTrip Tests

        [Test]
        public async Task CancelTrip_ValidId_CancelsTrip()
        {
            // Arrange
            int tripId = 1;
            var trip = new NewBusDAL.Models.Trip
            {
                Id = tripId,
                StartAt = DateTime.Now,
                EndAt = null,
                IsCancel = false
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(tripId))
                .ReturnsAsync(trip);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _tripBLL.CancelTrip(tripId);

            // Assert
            Assert.That(trip.IsCancel, Is.True);
            Assert.That(trip.CancelAt, Is.Not.Null);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void CancelTrip_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.CancelTrip(-1));
        }

        [Test]
        public void CancelTrip_ZeroId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.CancelTrip(0));
        }

        [Test]
        public void CancelTrip_TripNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int tripId = 999;

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(tripId))
                .ReturnsAsync((NewBusDAL.Models.Trip)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _tripBLL.CancelTrip(tripId));
        }

        [Test]
        public void CancelTrip_FinishedTrip_ThrowsValidationException()
        {
            // Arrange
            int tripId = 1;
            var trip = new NewBusDAL.Models.Trip
            {
                Id = tripId,
                StartAt = DateTime.Now.AddHours(-2),
                EndAt = DateTime.Now,
                IsCancel = false
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(tripId))
                .ReturnsAsync(trip);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.CancelTrip(tripId));
        }

        #endregion

        #region GetAllTrips Tests

        [Test]
        public async Task GetAllTrips_HasTrips_ReturnsAllTrips()
        {
            // Arrange
            var trips = new List<DtoTripRead>
            {
                new DtoTripRead { Id = 1},
                new DtoTripRead { Id = 2 }
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetAllTrips())
                .ReturnsAsync(trips);

            // Act
            var result = await _tripBLL.GetAllTrips();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(2));
        }

        [Test]
        public void GetAllTrips_NoTrips_ThrowsNotFoundException()
        {
            // Arrange
            _mockUnitOfWork.Setup(u => u.Trips.GetAllTrips())
                .ReturnsAsync((IEnumerable<DtoTripRead>)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _tripBLL.GetAllTrips());
        }

        [Test]
        public async Task GetAllTrips_EmptyList_ReturnsEmptyList()
        {
            // Arrange
            var emptyList = new List<DtoTripRead>();

            _mockUnitOfWork.Setup(u => u.Trips.GetAllTrips())
                .ReturnsAsync(emptyList);

            // Act
            var result = await _tripBLL.GetAllTrips();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(0));
        }

        #endregion

        #region GetTripByID Tests

        [Test]
        public async Task GetTripByID_ValidId_ReturnsTrip()
        {
            // Arrange
            int tripId = 1;
            var trip = new DtoTripRead
            {
                Id = tripId,
                StatusTrip = enStatusTrip.NonComplete.ToString()
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetTripById(tripId))
                .ReturnsAsync(trip);

            // Act
            var result = await _tripBLL.GetTripByID(tripId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.StatusTrip, Is.EqualTo(enStatusTrip.NonComplete.ToString()));
        }

        [Test]
        public void GetTripByID_TripNotFound_ThrowsValidationException()
        {
            // Arrange
            int tripId = 999;

            _mockUnitOfWork.Setup(u => u.Trips.GetTripById(tripId))
                .ReturnsAsync((DtoTripRead)null);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.GetTripByID(tripId));
        }

        #endregion

        #region UpdateStatusTrip Tests

        [Test]
        public async Task UpdateStatusTrip_ValidData_UpdatesStatus()
        {
            // Arrange
            var dtoUpdateStatus = new DtoTripUpdateStatus
            {
                Id = 1,
                StatusTripId = (int)enStatusTrip.Completed,
                CreatedByDriverID = 1
            };

            var trip = new NewBusDAL.Models.Trip
            {
                Id = 1,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(dtoUpdateStatus.Id))
                .ReturnsAsync(trip);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _tripBLL.UpdateStatusTrip(dtoUpdateStatus);

            // Assert
            Assert.That(trip.StatusTripId, Is.EqualTo((int)enStatusTrip.Completed));
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateStatusTrip_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.UpdateStatusTrip(null));
        }

        [Test]
        public void UpdateStatusTrip_InvalidId_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdateStatus = new DtoTripUpdateStatus
            {
                Id = -1,
                StatusTripId = (int)enStatusTrip.Completed,
                CreatedByDriverID = 1
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.UpdateStatusTrip(dtoUpdateStatus));
        }

        [Test]
        public void UpdateStatusTrip_ZeroId_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdateStatus = new DtoTripUpdateStatus
            {
                Id = 0,
                StatusTripId = (int)enStatusTrip.Completed,
                CreatedByDriverID = 1
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.UpdateStatusTrip(dtoUpdateStatus));
        }

        [Test]
        public void UpdateStatusTrip_TripNotFound_ThrowsNotFoundException()
        {
            // Arrange
            var dtoUpdateStatus = new DtoTripUpdateStatus
            {
                Id = 999,
                StatusTripId = (int)enStatusTrip.Completed,
                CreatedByDriverID = 1
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(dtoUpdateStatus.Id))
                .ReturnsAsync((NewBusDAL.Models.Trip)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _tripBLL.UpdateStatusTrip(dtoUpdateStatus));
        }

        [Test]
        public void UpdateStatusTrip_DifferentDriver_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdateStatus = new DtoTripUpdateStatus
            {
                Id = 1,
                StatusTripId = (int)enStatusTrip.Completed,
                CreatedByDriverID = 2
            };

            var trip = new NewBusDAL.Models.Trip
            {
                Id = 1,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(dtoUpdateStatus.Id))
                .ReturnsAsync(trip);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.UpdateStatusTrip(dtoUpdateStatus));
        }

        [Test]
        public void UpdateStatusTrip_InvalidStatus_ThrowsValidationException()
        {
            // Arrange
            var dtoUpdateStatus = new DtoTripUpdateStatus
            {
                Id = 1,
                StatusTripId = 999, // Invalid status
                CreatedByDriverID = 1
            };

            var trip = new NewBusDAL.Models.Trip
            {
                Id = 1,
                StatusTripId = (int)enStatusTrip.NonComplete,
                CreatedByDriverId = 1
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(dtoUpdateStatus.Id))
                .ReturnsAsync(trip);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.UpdateStatusTrip(dtoUpdateStatus));
        }

        #endregion

        #region FinishTrip Tests

        [Test]
        public async Task FinishTrip_ValidId_FinishesTrip()
        {
            // Arrange
            int tripId = 1;
            var trip = new NewBusDAL.Models.Trip
            {
                Id = tripId,
                StartAt = DateTime.Now,
                EndAt = null,
                IsCancel = false
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(tripId))
                .ReturnsAsync(trip);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _tripBLL.FinishTrip(tripId);

            // Assert
            Assert.That(trip.EndAt, Is.Not.Null);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void FinishTrip_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.FinishTrip(-1));
        }

        [Test]
        public void FinishTrip_ZeroId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.FinishTrip(0));
        }

        [Test]
        public void FinishTrip_TripNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int tripId = 999;

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(tripId))
                .ReturnsAsync((NewBusDAL.Models.Trip)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _tripBLL.FinishTrip(tripId));
        }

        [Test]
        public void FinishTrip_CanceledTrip_ThrowsValidationException()
        {
            // Arrange
            int tripId = 1;
            var trip = new NewBusDAL.Models.Trip
            {
                Id = tripId,
                StartAt = DateTime.Now,
                EndAt = null,
                IsCancel = true,
                CancelAt = DateTime.Now
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(tripId))
                .ReturnsAsync(trip);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _tripBLL.FinishTrip(tripId));
        }

        [Test]
        public async Task FinishTrip_AlreadyFinished_OverwritesEndDate()
        {
            // Arrange
            int tripId = 1;
            var oldEndDate = DateTime.Now.AddHours(-1);
            var trip = new NewBusDAL.Models.Trip
            {
                Id = tripId,
                StartAt = DateTime.Now.AddHours(-2),
                EndAt = oldEndDate,
                IsCancel = false
            };

            _mockUnitOfWork.Setup(u => u.Trips.GetByIdAsync(tripId))
                .ReturnsAsync(trip);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _tripBLL.FinishTrip(tripId);

            // Assert
            Assert.That(trip.EndAt, Is.Not.EqualTo(oldEndDate));
            Assert.That(trip.EndAt, Is.Not.Null);
        }

        #endregion
    }
}