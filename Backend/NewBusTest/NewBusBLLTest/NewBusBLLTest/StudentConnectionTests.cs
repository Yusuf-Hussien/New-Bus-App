using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using NewBusBLL.Admins.BLL;
using NewBusBLL.EmailService;
using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.StudentConnection;
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
using System.Threading.Tasks;
namespace NewBusBLL.Tests.studentconnection
{
    [TestFixture]
    public class StudentConnectionTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private NewBusBLL.StudentConnection.StudentConnection _studentConnection;

        [SetUp]
        public async Task Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _studentConnection = new NewBusBLL.StudentConnection.StudentConnection(_mockUnitOfWork.Object);
        }

        [Test]
        public async Task AddToConnectionStudentTable_ValidStudent_AddsConnection()
        {
            // Arrange
            string connectionId = "conn-123";
            int studentId = 1;
            var student = new Student { Id = studentId };

            _mockUnitOfWork.Setup(u => u.Students.GetByIdAsync(studentId))
                .ReturnsAsync(student);
            _mockUnitOfWork.Setup(u => u.StudentConnections.AddAsync(It.IsAny<NewBusDAL.Models.StudentConnection>()))
                .Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _studentConnection.AddToConnectionStudentTable(connectionId, studentId);

            // Assert
            _mockUnitOfWork.Verify(u => u.StudentConnections.AddAsync(It.IsAny<NewBusDAL.Models.StudentConnection>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public async Task AddToConnectionStudentTable_InvalidStudent_DoesNotAddConnection()
        {
            // Arrange
            string connectionId = "conn-123";
            int studentId = 999;

            _mockUnitOfWork.Setup(u => u.Students.GetByIdAsync(studentId))
                .ReturnsAsync((Student)null);

            // Act
            await _studentConnection.AddToConnectionStudentTable(connectionId, studentId);

            // Assert
            _mockUnitOfWork.Verify(u => u.StudentConnections.AddAsync(It.IsAny<NewBusDAL.Models.StudentConnection>()), Times.Never);
        }

        [Test]
        public async Task RemoveFromConnectionStudentTable_ExistingConnection_RemovesConnection()
        {
            // Arrange
            string connectionId = "conn-123";
            var studentConn = new NewBusDAL.Models.StudentConnection
            {
                Id = 1,
                CoonectionId = connectionId
            };

            _mockUnitOfWork.Setup(u => u.StudentConnections.IsExist(
                It.IsAny<Expression<Func<NewBusDAL.Models.StudentConnection, bool>>>()))
                .ReturnsAsync(true);
            _mockUnitOfWork.Setup(u => u.StudentConnections.GetByAsync(
                It.IsAny<Expression<Func<NewBusDAL.Models.StudentConnection, bool>>>()))
                .ReturnsAsync(studentConn);
            _mockUnitOfWork.Setup(u => u.StudentConnections.RemoveAsync(studentConn.Id))
                .Returns(Task.CompletedTask);
            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _studentConnection.RemoveFromConnectionStudentTable(connectionId);

            // Assert
            _mockUnitOfWork.Verify(u => u.StudentConnections.RemoveAsync(studentConn.Id), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public async Task RemoveFromConnectionStudentTable_NonExistingConnection_DoesNotRemove()
        {
            // Arrange
            string connectionId = "conn-123";

            _mockUnitOfWork.Setup(u => u.StudentConnections.IsExist(
                It.IsAny<Expression<Func<NewBusDAL.Models.StudentConnection, bool>>>()))
                .ReturnsAsync(false);

            // Act
            await _studentConnection.RemoveFromConnectionStudentTable(connectionId);

            // Assert
            _mockUnitOfWork.Verify(u => u.StudentConnections.RemoveAsync(It.IsAny<int>()), Times.Never);
        }
    }
}