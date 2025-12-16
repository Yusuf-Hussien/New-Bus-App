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

[TestFixture]
public class DriverConnectionBLLTests
{
    private Mock<IUnitOfWork> _mockUnitOfWork;
    private NewBusBLL.DriverConnection.DriverConnectionBLL _driverConnection;

    [SetUp]
    public void Setup()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _driverConnection = new NewBusBLL.DriverConnection.DriverConnectionBLL(_mockUnitOfWork.Object);
    }

    [Test]
    public async Task AddToConnectionDriverTable_ValidDriver_AddsConnection()
    {
        // Arrange
        string connectionId = "conn-123";
        int driverId = 1;
        var driver = new Driver { Id = driverId };

        _mockUnitOfWork.Setup(u => u.Drivers.GetByIdAsync(driverId))
            .ReturnsAsync(driver);
        _mockUnitOfWork.Setup(u => u.DriverConnections.AddAsync(It.IsAny<NewBusDAL.Models.DriverConnection>()))
            .Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

        // Act
        await _driverConnection.AddToConnectionDriverTable(connectionId, driverId);

        // Assert
        _mockUnitOfWork.Verify(u => u.DriverConnections.AddAsync(It.IsAny<NewBusDAL.Models.DriverConnection>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
    }

    [Test]
    public async Task RemoveFromConnectionDriverTable_ExistingConnection_RemovesConnection()
    {
        // Arrange
        string connectionId = "conn-123";
        var driverConn = new NewBusDAL.Models.DriverConnection
        {
            Id = 1,
            CoonectionId = connectionId
        };

        _mockUnitOfWork.Setup(u => u.DriverConnections.IsExist(
            It.IsAny<Expression<Func<NewBusDAL.Models.DriverConnection, bool>>>()))
            .ReturnsAsync(true);
        _mockUnitOfWork.Setup(u => u.DriverConnections.GetByAsync(
            It.IsAny<Expression<Func<NewBusDAL.Models.DriverConnection, bool>>>()))
            .ReturnsAsync(driverConn);
        _mockUnitOfWork.Setup(u => u.DriverConnections.RemoveAsync(driverConn.Id))
            .Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

        // Act
        await _driverConnection.RemoveFromConnectionDriverTable(connectionId);

        // Assert
        _mockUnitOfWork.Verify(u => u.DriverConnections.RemoveAsync(driverConn.Id), Times.Once);
        _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
    }
}