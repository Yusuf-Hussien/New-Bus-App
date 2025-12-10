using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Moq;
using NewBusBLL.EmailService;
using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.Students.StudentBLL;
using NewBusBLL.Tests.Admins;
using NewBusBLL.Token.IToken;
using NewBusDAL.Constant;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Students.DTO;
using NUnit.Framework;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;

namespace NewBusBLL.Tests.Students
{
    [TestFixture]
    public class StudentBLLTests
    {
        private Mock<IUnitOfWork> _mockUnitOfWork;
        private Mock<IMapper> _mockMapper;
        private Mock<IToken> _mockToken;
        private Mock<IhashingBLL> _mockHash;
        private Mock<Iemail> _mockEmail;
        private StudentBLL _studentBLL;

        [SetUp]
        public void Setup()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockMapper = new Mock<IMapper>();
            _mockToken = new Mock<IToken>();
            _mockHash = new Mock<IhashingBLL>();
            _mockEmail = new Mock<Iemail>();
            _studentBLL = new StudentBLL(_mockMapper.Object, _mockUnitOfWork.Object,
                _mockToken.Object, _mockHash.Object, _mockEmail.Object);
        }

        #region GetStudentsinFacultyID Tests

        [Test]
        public async Task GetStudentsinFacultyID_ValidId_ReturnsStudents()
        {
            // Arrange
            int facultyId = 1;
            var students = new List<Student>
            {
                new Student { Id = 1, FacultyId = facultyId, Person = new Person(), Faculty = new NewBusDAL.Models.Faculty() }
            };
            var studentDtos = new List<DTOStudentRead>
            {
                new DTOStudentRead { ID = 1}
            };

            var mockStudents = students.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockMapper.Setup(m => m.Map<List<DTOStudentRead>>(students))
                .Returns(studentDtos);

            // Act
            var result = await _studentBLL.GetStudentsinFacultyID(facultyId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        [Test]
        public void GetStudentsinFacultyID_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.GetStudentsinFacultyID(-1));
        }

        [Test]
        public void GetStudentsinFacultyID_ZeroId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.GetStudentsinFacultyID(0));
        }

        #endregion

        #region AddStudentAsync Tests

  

        [Test]
        public void AddStudentAsync_NullData_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(null));
        }

        [Test]
        public void AddStudentAsync_EmptyUsername_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "",
                Password = "password123"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_EmptyPassword_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "student1",
                Password = ""
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_DuplicateUsername_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "existingstudent",
                Password = "password123",
                Email = "test@example.com",
                Phone = "1234567890"
            };

            _mockUnitOfWork.Setup(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_DuplicatePhone_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "newstudent",
                Password = "password123",
                Email = "test@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                FacultyId = 1,
                Level = 3
            };

            _mockUnitOfWork.SetupSequence(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(false) // Username check
                .ReturnsAsync(true); // Phone check

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_DuplicateEmail_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "newstudent",
                Password = "password123",
                Email = "existing@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                FacultyId = 1,
                Level = 3
            };

            _mockUnitOfWork.SetupSequence(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(false) // Username check
                .ReturnsAsync(false) // Phone check
                .ReturnsAsync(true); // Email check

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_InvalidFacultyId_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "newstudent",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                FacultyId = 999,
                Level = 3
            };

            _mockUnitOfWork.Setup(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_InvalidLevel_TooHigh_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "newstudent",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                FacultyId = 1,
                Level = 8 // Too high
            };

            _mockUnitOfWork.Setup(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_InvalidLevel_TooLow_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "newstudent",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                FacultyId = 1,
                Level = 0 // Too low
            };

            _mockUnitOfWork.Setup(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_InvalidGender_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "newstudent",
                Password = "password123",
                Email = "new@example.com",
                Phone = "1234567890",
                Gender = 99, // Invalid gender
                FacultyId = 1,
                Level = 3
            };

            _mockUnitOfWork.Setup(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        [Test]
        public void AddStudentAsync_EmailSendFailure_ThrowsValidationException()
        {
            // Arrange
            var dtoStudentCreate = new DTOStudentCreate
            {
                UserName = "newstudent",
                Password = "password123",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                Phone = "1234567890",
                Gender = (int)enGender.Male,
                FacultyId = 1,
                Level = 3
            };

            _mockUnitOfWork.Setup(u => u.Students.IsExist(It.IsAny<Expression<Func<Student, bool>>>()))
                .ReturnsAsync(false);

            _mockHash.Setup(h => h.GenerateSaltString(8)).Returns("salttoken");

            _mockEmail.Setup(e => e.SendVerificationEmailStudent(It.IsAny<string>(), It.IsAny<string>()))
                .ThrowsAsync(new Exception("Email service error"));

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.AddStudentAsync(dtoStudentCreate));
        }

        #endregion

        #region VerifyEmail Tests

        [Test]
        public async Task VerifyEmail_ValidToken_ReturnsTrue()
        {
            // Arrange
            string plainToken = "testtoken123";
            string hashedToken = BCrypt.Net.BCrypt.HashPassword(plainToken);

            var students = new List<Student>
            {
                new Student { Id = 1, Token = hashedToken, Isverified = false }
            };

            var mockStudents = students.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                null))
                .Returns(mockStudents.Object);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            var result = await _studentBLL.VerifyEmail(plainToken);

            // Assert
            Assert.That(result, Is.True);
            Assert.That(students[0].Isverified, Is.True);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public async Task VerifyEmail_InvalidToken_ReturnsFalse()
        {
            // Arrange
            string invalidToken = "invalidtoken";
            var students = new List<Student>
            {
                new Student { Id = 1, Token = BCrypt.Net.BCrypt.HashPassword("differenttoken"), Isverified = false }
            };

            var mockStudents = students.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                null))
                .Returns(mockStudents.Object);

            // Act
            var result = await _studentBLL.VerifyEmail(invalidToken);

            // Assert
            Assert.That(result, Is.False);
            Assert.That(students[0].Isverified, Is.False);
        }

        #endregion

        #region DeleteStudentAsync Tests

        [Test]
        public async Task DeleteStudentAsync_ValidId_DeletesStudent()
        {
            // Arrange
            int studentId = 1;
            var student = new Student { Id = studentId };

            _mockUnitOfWork.Setup(u => u.Students.GetByIdAsync(studentId))
                .ReturnsAsync(student);

            _mockUnitOfWork.Setup(u => u.Students.RemoveAsync(studentId))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _studentBLL.DeleteStudentAsync(studentId);

            // Assert
            _mockUnitOfWork.Verify(u => u.Students.RemoveAsync(studentId), Times.Once);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void DeleteStudentAsync_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.DeleteStudentAsync(-1));
        }

        [Test]
        public void DeleteStudentAsync_ZeroId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.DeleteStudentAsync(0));
        }

        [Test]
        public void DeleteStudentAsync_StudentNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int studentId = 999;

            _mockUnitOfWork.Setup(u => u.Students.GetByIdAsync(studentId))
                .ReturnsAsync((Student)null);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _studentBLL.DeleteStudentAsync(studentId));
        }

        #endregion

        #region GetAllStudentsAsync Tests

        [Test]
        public async Task GetAllStudentsAsync_HasStudents_ReturnsAllStudents()
        {
            // Arrange
            var students = new List<Student>
            {
                new Student { Id = 1, Username = "student1", Person = new Person(), Faculty = new NewBusDAL.Models.Faculty() },
                new Student { Id = 2, Username = "student2", Person = new Person(), Faculty = new NewBusDAL.Models.Faculty() }
            };
            var studentDtos = new List<DTOStudentRead>
            {
                new DTOStudentRead { ID = 1, UserName = "student1" },
                new DTOStudentRead { ID = 2, UserName = "student2" }
            };

            var mockStudents = students.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(null, It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockMapper.Setup(m => m.Map<IEnumerable<DTOStudentRead>>(students))
                .Returns(studentDtos);

            // Act
            var result = await _studentBLL.GetAllStudentsAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(2));
        }

        [Test]
        public void GetAllStudentsAsync_NoStudents_ThrowsNotFoundException()
        {
            // Arrange
            var emptyList = new List<Student>().AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(null, It.IsAny<string[]>()))
                .Returns(emptyList.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _studentBLL.GetAllStudentsAsync());
        }

        #endregion

        #region GetStudentByFirstName Tests

        [Test]
        public async Task GetStudentByFirstName_ValidName_ReturnsStudents()
        {
            // Arrange
            string firstName = "John";
            var students = new List<Student>
            {
                new Student { Id = 1, Username = "john1", Person = new Person { FirstName = firstName }, Faculty = new NewBusDAL.Models.Faculty() }
            };
            var studentDtos = new List<DTOStudentRead>
            {
                new DTOStudentRead { ID = 1, FirstName = firstName }
            };

            var mockStudents = students.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockMapper.Setup(m => m.Map<IEnumerable<DTOStudentRead>>(students))
                .Returns(studentDtos);

            // Act
            var result = await _studentBLL.GetStudentByFirstName(firstName);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        [Test]
        public void GetStudentByFirstName_NullName_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.GetStudentByFirstName(null));
        }

        #endregion

        #region GetStudentByIdAsync Tests

        [Test]
        public async Task GetStudentByIdAsync_ValidId_ReturnsStudent()
        {
            // Arrange
            int studentId = 1;
            var student = new Student { Id = studentId, Username = "student1", Person = new Person(), Faculty = new NewBusDAL.Models.Faculty() };
            var studentDto = new DTOStudentRead { ID = studentId, UserName = "student1" };

            var mockStudents = new List<Student> { student }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockMapper.Setup(m => m.Map<DTOStudentRead>(student)).Returns(studentDto);

            // Act
            var result = await _studentBLL.GetStudentByIdAsync(studentId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.ID, Is.EqualTo(studentId));
        }

        [Test]
        public void GetStudentByIdAsync_InvalidId_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.GetStudentByIdAsync(-1));
        }

        [Test]
        public void GetStudentByIdAsync_StudentNotFound_ThrowsNotFoundException()
        {
            // Arrange
            int studentId = 999;
            var emptyList = new List<Student>().AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(emptyList.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _studentBLL.GetStudentByIdAsync(studentId));
        }

        #endregion

        #region GetStudentByLastName Tests

        [Test]
        public async Task GetStudentByLastName_ValidName_ReturnsStudents()
        {
            // Arrange
            string lastName = "Smith";
            var students = new List<Student>
            {
                new Student { Id = 1, Username = "smith1", Person = new Person { LastName = lastName }, Faculty = new NewBusDAL.Models.Faculty() }
            };
            var studentDtos = new List<DTOStudentRead>
            {
                new DTOStudentRead { ID = 1, LastName = lastName }
            };

            var mockStudents = students.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockMapper.Setup(m => m.Map<IEnumerable<DTOStudentRead>>(students))
                .Returns(studentDtos);

            // Act
            var result = await _studentBLL.GetStudentByLastName(lastName);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(1));
        }

        [Test]
        public void GetStudentByLastName_NullName_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.GetStudentByLastName(null));
        }

        #endregion

        #region GetStudentByPhone Tests

        [Test]
        public async Task GetStudentByPhone_ValidPhone_ReturnsStudent()
        {
            // Arrange
            string phone = "1234567890";
            var student = new Student { Id = 1, Username = "student1", Person = new Person { Phone = phone }, Faculty = new NewBusDAL.Models.Faculty() };
            var studentDto = new DTOStudentRead { ID = 1, Phone = phone };

            var mockStudents = new List<Student> { student }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockMapper.Setup(m => m.Map<DTOStudentRead>(student)).Returns(studentDto);

            // Act
            var result = await _studentBLL.GetStudentByPhone(phone);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Phone, Is.EqualTo(phone));
        }

        [Test]
        public void GetStudentByPhone_NullPhone_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.GetStudentByPhone(null));
        }

        #endregion

        #region GetStudentByUsernameAsync Tests

        [Test]
        public async Task GetStudentByUsernameAsync_ValidUsername_ReturnsStudent()
        {
            // Arrange
            string username = "student1";
            var student = new Student { Id = 1, Username = username, Person = new Person(), Faculty = new NewBusDAL.Models.Faculty() };
            var studentDto = new DTOStudentRead { ID = 1, UserName = username };

            var mockStudents = new List<Student> { student }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(
                It.IsAny<Expression<Func<Student, bool>>>(),
                It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockMapper.Setup(m => m.Map<DTOStudentRead>(student)).Returns(studentDto);

            // Act
            var result = await _studentBLL.GetStudentByUsernameAsync(username);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.UserName, Is.EqualTo(username));
        }

        [Test]
        public void GetStudentByUsernameAsync_NullUsername_ThrowsValidationException()
        {
            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(async () =>
                await _studentBLL.GetStudentByUsernameAsync(null));
        }

        #endregion

        #region UpdateStudentAsync Tests

        [Test]
        public async Task UpdateStudentAsync_ValidData_UpdatesStudent()
        {
            // Arrange
            var dtoStudentUpdate = new DTOStudentUpdate
            {
                UserName = "updatedstudent",
                FirstName = "Jane",
                SecondName = "Marie",
                ThirdName = "Anne",
                LastName = "Smith",
                Email = "jane@example.com",
                Phone = "9876543210",
                LevelOfStudy = 4,
                Gender = (int)enGender.Female
            };

            var student = new Student
            {
                Id = 1,
                Username = "oldstudent",
                Person = new Person(),
                Faculty = new NewBusDAL.Models.Faculty()
            };

            var mockStudents = new List<Student> { student }.AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(null, It.IsAny<string[]>()))
                .Returns(mockStudents.Object);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _studentBLL.UpdateStudentAsync(dtoStudentUpdate);

            // Assert
            Assert.That(student.Username, Is.EqualTo("updatedstudent"));
            Assert.That(student.Person.FirstName, Is.EqualTo("Jane"));
            Assert.That(student.Person.LastName, Is.EqualTo("Smith"));
            Assert.That(student.Level, Is.EqualTo(4));
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }

        [Test]
        public void UpdateStudentAsync_StudentNotFound_ThrowsNotFoundException()
        {
            // Arrange
            var dtoStudentUpdate = new DTOStudentUpdate();
            var emptyList = new List<Student>().AsQueryable().BuildMockDbSet();

            _mockUnitOfWork.Setup(u => u.Students.getallIncludeBy(null, It.IsAny<string[]>()))
                .Returns(emptyList.Object);

            // Act & Assert
            Assert.ThrowsAsync<NotFoundException>(async () =>
                await _studentBLL.UpdateStudentAsync(dtoStudentUpdate));
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

            var student = new Student
            {
                Id = 1,
                Password = BCrypt.Net.BCrypt.HashPassword(oldPassword)
            };

            _mockUnitOfWork.Setup(u => u.Students.GetByIdAsync(dtoUpdatePassword.ID))
                .ReturnsAsync(student);

            _mockUnitOfWork.Setup(u => u.Complete()).ReturnsAsync(1);

            // Act
            await _studentBLL.UpdatePasswordAsync(dtoUpdatePassword);

            // Assert
            Assert.That(BCrypt.Net.BCrypt.Verify(newPassword, student.Password), Is.True);
            _mockUnitOfWork.Verify(u => u.Complete(), Times.Once);
        }


        #endregion // <-- Add this line to close the last region and fix CS1038
    }

}