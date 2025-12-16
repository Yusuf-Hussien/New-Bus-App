using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using NewBusBLL.AdminConnection;
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

namespace NewBusBLLTest
{

    [TestFixture]
    public class AdminConnectionBLLTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private AdminConnectionBLL _adminConnection;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _adminConnection = new AdminConnectionBLL(_mockUnitOfWork.Object);
        }

        [Test]
        public async Task AddToConnectionAdminTable_ValidAdmin_AddsConnection()
        {
            // Arrange
            string connectionId = "conn-123";
            int adminId = 1;
            var admin = new Admin { Id = adminId };

            _mockUnitOfWork.Setup(u => u.Admins.GetByIdAsync(adminId))
                .ReturnsAsync(admin);
            _mockUnitOfWork.Setup(u => u.AdminConnections.AddAsync(It.IsAny<NewBusDAL.Models.AdminConnections>()))
                .Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _adminConnection.AddToConnectionAdminTable(connectionId, adminId);

            // Assert
            _mockUnitOfWork.Verify(u => u.AdminConnections.AddAsync(It.IsAny<NewBusDAL.Models.AdminConnections>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }
    }
}
