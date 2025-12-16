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

namespace NewBusBLL.Tests
{
    [TestFixture]
    public class StationTripTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IMapper> _mockMapper;
        private NewBusBLL.StationTrips.StationTrip _stationTrip;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockMapper = new Mock<IMapper>();
            _stationTrip = new NewBusBLL.StationTrips.StationTrip(_mockUnitOfWork.Object, _mockMapper.Object);
        }



        [Test]
        public async Task AddStationTrip_ExistingStationTrip_ReturnsFalse()
        {
            // Arrange
            var dto = new DtoStationTrip
            {
                StationId = 1,
                TripId = 1
            };

            var existingStationTrip = new NewBusDAL.Models.StationTrip
            {
                StationId = 1,
                TripId = 1
            };

            _mockUnitOfWork.Setup(u => u.StationTrips.GetByAsync(
             It.IsAny<Expression<Func<NewBusDAL.Models.StationTrip, bool>>>()))
             .ReturnsAsync(existingStationTrip);

            // Act
            var result = await _stationTrip.AddStationTrip(dto);

            // Assert
            Assert.That(result, Is.False);
            _mockUnitOfWork.Verify(u => u.StationTrips.AddAsync(It.IsAny<NewBusDAL.Models.StationTrip>()), Times.Never);
        }

        [Test]
        public async Task GetStationTrip_Exists_ReturnsStationTrip()
        {
            // Arrange
            int stationId = 1;
            int tripId = 1;

            var stationTrip = new NewBusDAL.Models.StationTrip
            {
                StationId = stationId,
                TripId = tripId,
                IsVisited = true
            };

            var dto = new DtoStationTrip
            {
                StationId = stationId,
                TripId = tripId
            };

            _mockUnitOfWork.Setup(u => u.StationTrips.GetByAsync(
                It.IsAny<Expression<Func<NewBusDAL.Models.StationTrip, bool>>>()))
                .ReturnsAsync(stationTrip);

            _mockMapper.Setup(m => m.Map<DtoStationTrip>(stationTrip))
                .Returns(dto);

            // Act
            var result = await _stationTrip.GetStationTrip(stationId, tripId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.StationId, Is.EqualTo(stationId));
            Assert.That(result.TripId, Is.EqualTo(tripId));
        }

        [Test]
        public async Task GetStationTrip_NotExists_ReturnsNull()
        {
            // Arrange
            int stationId = 1;
            int tripId = 1;

            _mockUnitOfWork.Setup(u => u.StationTrips.GetByAsync(
                It.IsAny<Expression<Func<NewBusDAL.Models.StationTrip, bool>>>()))
                .ReturnsAsync((NewBusDAL.Models.StationTrip)null);

            // Act
            var result = await _stationTrip.GetStationTrip(stationId, tripId);

            // Assert
            Assert.That(result, Is.Null);
        }
    }

}