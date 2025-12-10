using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NewBusBLL.EmailService;
using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.Students.InterFace;
using NewBusBLL.Token.IToken;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Constant;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Repositry.RepoClassess.UnitOfWork;
using NewBusDAL.Students.DTO;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Students.StudentBLL
{
    public class StudentBLL : IStudentBLL
    {
        private readonly IMapper _Mapper;
        private readonly IUnitOfWork _UOW;
        private readonly IToken _Token;
        private readonly IhashingBLL _Hash;
        private readonly Iemail _email;
        public StudentBLL(IMapper mapper, IUnitOfWork uOW,IToken Token,IhashingBLL hash,Iemail email)
        {
            _Mapper = mapper;
            _UOW = uOW;
            _Token = Token;
            _Hash = hash;
            _email= email;
        }
        public async Task<IEnumerable<DTOStudentRead>> GetStudentsinFacultyID(int FacultyID)
        {
            if (FacultyID <= 0)
                throw new ValidationException("Id Must Be Positive");

            var admin = await _UOW.Students.getallIncludeBy(a => a.FacultyId == FacultyID, new[] { "Person", "Faculty" }).ToListAsync();

            if (admin == null)
                throw new NotFoundException("Data Is Not Found");

            return _Mapper.Map<List<DTOStudentRead>>(admin);
        }
        public async Task AddStudentAsync(DTOStudentCreate dtoStudentCreate)
        {
            if (dtoStudentCreate == null)
                throw new ValidationException("Admin Data Is Not Valid");
            if (string.IsNullOrEmpty(dtoStudentCreate.UserName) || string.IsNullOrEmpty(dtoStudentCreate.Password))
                throw new ValidationException("Username And Password Are Required");
            if( await _UOW.Students.IsExist(s=>s.Username==dtoStudentCreate.UserName))
                throw new ValidationException("UserName Is Used Before");
            if (await _UOW.Students.IsExist(s => s.Person.Phone == dtoStudentCreate.Phone))
                throw new ValidationException("Phone Is Used Before");
            if (await _UOW.Students.IsExist(s => s.Person.Email == dtoStudentCreate.Email))
                throw new ValidationException("Email Is Used Before");
            if (!await _UOW.Students.IsExist(s => s.FacultyId == dtoStudentCreate.FacultyId))
                throw new ValidationException("Uou must Choice Faculty ID Correctly");
            if (dtoStudentCreate.Level>7||dtoStudentCreate.Level<1)
                throw new ValidationException("Level of Faculty Is Incorrect");
            if (dtoStudentCreate.Gender <Convert.ToInt32( enGender.Male) || Convert.ToInt32(dtoStudentCreate.Gender)> 2)
                throw new ValidationException("GenderID Is Not Correct");

            var Token = _Hash.GenerateSaltString(8);//original
            dtoStudentCreate.Token = Token;

            var Student = new Student()
            {
                Username = dtoStudentCreate.UserName,
                Password = BCrypt.Net.BCrypt.HashPassword(dtoStudentCreate.Password),
                FacultyId = dtoStudentCreate.FacultyId,
                Level = dtoStudentCreate.Level,
                Token =BCrypt.Net.BCrypt.HashPassword(dtoStudentCreate.Token),

                Person = new Person()
                {
                    FirstName = dtoStudentCreate.FirstName,
                    SecondName = dtoStudentCreate.SecondName,
                    ThirdName = dtoStudentCreate.ThirdName,
                    LastName = dtoStudentCreate.LastName,
                    Email =     dtoStudentCreate.Email,
                    Phone = dtoStudentCreate.Phone,
                    Gender = dtoStudentCreate.Gender == Convert.ToInt32(enGender.Male) ? Convert.ToInt32(enGender.Male) : Convert.ToInt32(enGender.Female)
                }
            };
            try
            {
                await _email.SendVerificationEmailStudent(dtoStudentCreate.Email,Token);
            }
            catch (Exception ex)
            {
                throw new ValidationException("Error When Verify Your Email Try In Another Time");
            }

            Token = BCrypt.Net.BCrypt.HashPassword(Token);
            await _UOW.Students.AddAsync(Student);
            await _UOW.Complete();
        }
        public async Task<bool> VerifyEmail(string Token)
        {

            var admins = await _UOW.Students.getallIncludeBy(a => a.Isverified == false, null).ToListAsync();

            foreach (var admin in admins)
            {
                if (BCrypt.Net.BCrypt.Verify(Token, admin.Token))
                {
                    admin.Isverified = true;
                  await  _UOW.Complete();
                    return true;
                }
            }
            return false;
        }
        public async  Task DeleteStudentAsync(int id)

        {
            if (id <= 0)
                throw new ValidationException("Id Must Be Positive");
            var admin = await _UOW.Students.GetByIdAsync(id);
            if (admin == null)
                throw new NotFoundException("Data Is Not Found");

            await _UOW.Students.RemoveAsync(admin.Id);

            await _UOW.Complete();
        }

        public async Task<IEnumerable<DTOStudentRead>> GetAllStudentsAsync()
        {
           

            var Students = await _UOW.Students.getallIncludeBy(null, new[] { "Person", "Faculty" }).ToListAsync();

            if (Students.Count() <= 0)
                throw new NotFoundException("Data Is Not Found");

            return _Mapper.Map<IEnumerable<DTOStudentRead>>(Students);
        }
        public async Task<IEnumerable<DTOStudentRead>> GetStudentByFirstName(string FirstName)
        {
            if (FirstName == null)
                throw new ValidationException("FirstName Must Exist");

            var Students = await _UOW.Students.getallIncludeBy(a => a.Person.FirstName == FirstName, new[] { "Person" , "Faculty"}).ToListAsync();

            if (Students == null)
                throw new NotFoundException("Data Is Not Found");

            return _Mapper.Map<IEnumerable<DTOStudentRead>>(Students);
        }

        public async Task<DTOStudentRead> GetStudentByIdAsync(int id)

        {
            if (id <= 0)
                throw new ValidationException("Id Must Be Positive");

            var admin = await _UOW.Students.getallIncludeBy(a => a.Id == id, new[] { "Person" ,"Faculty"}).FirstOrDefaultAsync();

            if (admin == null)
                throw new NotFoundException("Data Is Not Found");

            return _Mapper.Map<DTOStudentRead>(admin);
        }

        public async Task<IEnumerable<DTOStudentRead>> GetStudentByLastName(string LastName)
        {
            if (LastName == null)
                throw new ValidationException("FirstName Must Exist");

            var Students = await _UOW.Students.getallIncludeBy(a => a.Person.LastName == LastName, new[] { "Person", "Faculty" }).ToListAsync();

            if (Students == null)
                throw new NotFoundException("Data Is Not Found");

            return _Mapper.Map<IEnumerable<DTOStudentRead>>(Students);
        }

        public async Task<DTOStudentRead> GetStudentByPhone(string Phone)

        {
            if (Phone == null)
                throw new ValidationException("FirstName Must Exist");

            var Students = await _UOW.Students.getallIncludeBy(a => a.Person.Phone == Phone, new[] { "Person", "Faculty" }).FirstOrDefaultAsync();

            if (Students == null)
                throw new NotFoundException("Data Is Not Found");

            return _Mapper.Map<DTOStudentRead>(Students);
        }

        public async  Task<DTOStudentRead> GetStudentByUsernameAsync(string username)
        {
            if (username == null)
                throw new ValidationException("FirstName Must Exist");

            var Students = await _UOW.Students.getallIncludeBy(a => a.Username == username, new[] { "Person", "Faculty" }).FirstOrDefaultAsync();

            if (Students == null)
                throw new NotFoundException("Data Is Not Found");

            return _Mapper.Map<DTOStudentRead>(Students);
        }
 
        public async   Task UpdateStudentAsync(DTOStudentUpdate dtoStudentUpdate)

        {
            var Student = await _UOW.Students.getallIncludeBy(null, new[] { "Person", "Faculty" }).FirstOrDefaultAsync();
            if (Student == null)
                throw new NotFoundException("Data Is Not Found");

            Student.Username = dtoStudentUpdate.UserName;
            Student.Person.FirstName = dtoStudentUpdate.FirstName;
            Student.Person.SecondName = dtoStudentUpdate.SecondName;
            Student.Person.ThirdName = dtoStudentUpdate.ThirdName;
            Student.Person.LastName = dtoStudentUpdate.LastName;
            Student.Level=dtoStudentUpdate.LevelOfStudy;
            Student.Person.Gender = dtoStudentUpdate.Gender == Convert.ToInt32(enGender.Male) ? Convert.ToInt32(enGender.Male) : Convert.ToInt32(enGender.Female);
            await _UOW.Complete();
        }
        public async Task UpdatePasswordAsync(DTOUpdatePassword dtoUpdatePassword)
        {
            if (dtoUpdatePassword == null)
                throw new ValidationException("Data Is Not Valid");
            if (string.IsNullOrEmpty(dtoUpdatePassword.OldPassword) || string.IsNullOrEmpty(dtoUpdatePassword.NewPassword))
                throw new ValidationException("Old Password And New Password Are Required");
            if (dtoUpdatePassword.ID <= 0)
                throw new ValidationException("Id Must Be Positive");
            if (dtoUpdatePassword.OldPassword.Length < 8 || dtoUpdatePassword.NewPassword.Length < 8)
                throw new ValidationException("Passwords Must Be At Least 8 Characters Long");
            //
            var admin = await _UOW.Students.GetByIdAsync(dtoUpdatePassword.ID);
            if (admin == null)
                throw new NotFoundException("Data Is Not Found");
            if (dtoUpdatePassword.OldPassword == dtoUpdatePassword.NewPassword)
                throw new ValidationException("New Password Must Be Different From Old Password");
            //
            bool isOldPasswordValid = BCrypt.Net.BCrypt.Verify(dtoUpdatePassword.OldPassword, admin.Password);
            if (!isOldPasswordValid)
                throw new ValidationException("Old Password Is Not Correct");
            admin.Password = BCrypt.Net.BCrypt.HashPassword(dtoUpdatePassword.NewPassword);
            await _UOW.Complete();


        }
        public async Task<DTOReturnLogin> Login(DTOLogin DtoStudentlogin)
        {
            if (DtoStudentlogin == null)
                throw new ValidationException("Data Is Not Valid");
            if (DtoStudentlogin.UserName == null || DtoStudentlogin.Password == null)
                throw new ValidationException("Username And Password Are Required");
            var admin = await _UOW.Students.getallIncludeBy(a => a.Username == DtoStudentlogin.UserName && (a.Isverified == true), new[] { "Person" }).FirstOrDefaultAsync();
            if (admin == null)
                throw new NotFoundException("UserName or Password is InCorrect");
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(DtoStudentlogin.Password, admin.Password);
            if (!isPasswordValid)
                throw new NotFoundException("UserName or Password is InCorrect");
            return await _Token.GenerateToken(DtoStudentlogin, Roles.Student);

        }
        public async Task UpdateLiveLocation(DtoUpdateLocation liveLication)

        {
            var driver = await _UOW.Students.GetByAsync(d => d.Id == liveLication.Id);
            if (driver == null)
                return;
            driver.Lang = liveLication.Lang;
            driver.Lat = liveLication.Lat;
            await _UOW.Complete();
        }

        public async Task ResetPassword(string Email)
        {
            Func<int> getRandom6 = () =>
            {
                return Math.Abs((Guid.NewGuid().GetHashCode() % 900000)) + 100000;
            };
            var Students = await _UOW.Students.getallIncludeBy(a => a.Person.Email == Email,null).FirstOrDefaultAsync();
            if (Email == null)
                throw new ValidationException("Email Invalid Not Exist");
            var OTP = getRandom6;
            //
            var resetstudent = new ResetPasswordStudent()
            {
                OTP=BCrypt.Net.BCrypt.HashPassword(OTP.ToString()),
                StudentId=Students.Id
            };
        await    _UOW.ResetPasswordStudents.AddAsync(resetstudent);
         await  _UOW.Complete();    
         await   _email.SendOTPStudentEmail(Email, OTP.ToString());
        }
        public async Task ResetPassword(DtoPassword dtoPassword)
        {
            int studentid=0;
            ResetPasswordStudent Reset = null;
            var ResetPasss = await _UOW.ResetPasswordStudents.FindAsync(r=>r.IsActive);
            foreach(var reset in ResetPasss)
            {
                if(BCrypt.Net.BCrypt.Verify(dtoPassword.OTP,reset.OTP))
                {
                  studentid=reset.StudentId;
                    Reset = reset;
                    break;
                }
            }
          
            if (Reset == null)
                throw new ValidationException("OTP Failed");

            var student = await _UOW.Students.GetByIdAsync(studentid);
            if (student == null) throw new ValidationException("There is error during Reset Password");

            student.Password = BCrypt.Net.BCrypt.HashPassword(dtoPassword.Password);
            Reset.IsActive = false;

            await  _UOW.Complete();


        }

        //public async Task ResetPasswordByToken(string Token)
        //{
        //    var Students = await _UOW.Students.getallIncludeBy(a => a.Person.Email == Email, null).FirstOrDefaultAsync();
        //    if (Email == null)
        //        throw new ValidationException("Email Invalid Not Exist");
        //    var OTP = Random.Shared.Next(100000, 1000000);

        //    await _email.SendOTPStudentEmail(Email, OTP.ToString());
        //}
    }
}
