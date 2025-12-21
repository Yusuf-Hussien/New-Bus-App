using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using NewBusBLL.Admins.InterFace;
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
using NewBusDAL.Students.DTO;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Admins.BLL
{
    public class AdminBLL:IadminBLL
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IToken _Token;
        private readonly Iemail _email;
        private readonly IhashingBLL _Hash;
        public AdminBLL(IUnitOfWork unitOfWork, IMapper mapper ,IToken Token,Iemail email,IhashingBLL Hash)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _Token = Token;
            _email = email;
            _Hash = Hash;
        }


        public async Task<DTOAdminRead> GetAdminByIdAsync(int id)
        {
            if(id <= 0)
                throw new ValidationException("Id Must Be Positive");
            
            var admin = await _unitOfWork.Admins.getallIncludeBy(a=>a.Id==id, new[] { "Person" }).Where(a=>a.Id==id).FirstOrDefaultAsync();

            if (admin == null)
                throw new NotFoundException("Data Is Not Found");

            return _mapper.Map<DTOAdminRead>(admin);
        }
        public async Task<IEnumerable<DTOAdminRead>> GetAdminByFirstName(string FirstName)

        {
            if (FirstName == null)
                throw new ValidationException("FirstName Must Exist");

            var admins = await _unitOfWork.Admins.getallIncludeBy(a => a.Person.FirstName == FirstName, new[] {"Person"} ).ToListAsync();

            if (admins.Count<=0)
                throw new NotFoundException("Data Is Not Found");

            return _mapper.Map<List<DTOAdminRead>>(admins);
        }
        public async Task<bool> VerifyEmail(string Token)
        {

            var admins = await _unitOfWork.Admins.getallIncludeBy(a=>a.Isverified==false,null).ToListAsync();

            foreach (var admin in admins)
            {
                if (BCrypt.Net.BCrypt.Verify(Token, admin.Token))
                {
                    admin.Isverified = true;
                  await _unitOfWork.Complete();
                    return true;
                }
            }
            return false;
        }

        public async Task<IEnumerable<DTOAdminRead>> GetAdminByLastName(string LastName)
        {
            if (LastName == null)
                throw new ValidationException("FirstName Must Exist");

            var admins = await _unitOfWork.Admins.getallIncludeBy(a => a.Person.LastName == LastName, new[] { "Person" }).ToListAsync();

            if (admins.Count <= 0)
                throw new NotFoundException("Data Is Not Found");

            return _mapper.Map<List<DTOAdminRead>>(admins);
        }
        public async Task<DTOAdminRead> GetAdminByPhone(string Phone)
        {
            if (Phone == null)
                throw new ValidationException("FirstName Must Exist");

            var admins = await _unitOfWork.Admins.getallIncludeBy(a => a.Person.Phone == Phone, new[] { "Person" }).FirstOrDefaultAsync();

            if (admins == null)
                throw new NotFoundException("Data Is Not Found");

            return _mapper.Map<DTOAdminRead>(admins);
        }
        public async Task<DTOAdminRead> GetAdminByUsernameAsync(string username)
        {
            if (username == null)
                throw new ValidationException("FirstName Must Exist");

            var admins = await _unitOfWork.Admins.getallIncludeBy(a => a.Username == username, new[] { "Person" }).FirstOrDefaultAsync();

            if (admins == null)
                throw new NotFoundException("Data Is Not Found");

            return _mapper.Map<DTOAdminRead>(admins);
        }
        public async Task<IEnumerable<DTOAdminRead>> GetAllAdminsAsync()
        {
            var admins = await _unitOfWork.Admins.getallIncludeBy(null, new[] { "Person" }).ToListAsync();

            if (admins.Count <= 0)
                throw new NotFoundException("Data Is Not Found");

            return _mapper.Map<IEnumerable<DTOAdminRead>>(admins);
        }
        public async Task AddAdminAsync(DTOAdminCreate dtoAdminCreate)
        {
            if (dtoAdminCreate == null)
                throw new ValidationException("Admin Data Is Not Valid");
            if (string.IsNullOrEmpty(dtoAdminCreate.UserName) || string.IsNullOrEmpty(dtoAdminCreate.Password))
                throw new ValidationException("Username And Password Are Required");
            if (await _unitOfWork.Admins.IsExist(s => s.Username == dtoAdminCreate.UserName))
                throw new ValidationException("UserName Is Used Before");
            if (await _unitOfWork.Admins.IsExist(s => s.Person.Phone == dtoAdminCreate.Phone))
                throw new ValidationException("Phone Is Used Before");
            if (await _unitOfWork.Admins.IsExist(s => s.Person.Email == dtoAdminCreate.Email))
                throw new ValidationException("Email Is Used Before");
            if (dtoAdminCreate.Gender < Convert.ToInt32(enGender.Male) || Convert.ToInt32(dtoAdminCreate.Gender) > Convert.ToInt32(enGender.Female))
                throw new ValidationException("GenderID Is Not Correct");
            if (dtoAdminCreate.Password.Length < 8)
                throw new ValidationException("Password Is Not Valid");

            var Token = _Hash.GenerateSaltStringWithoutSlash(8);
            dtoAdminCreate.Token = Token;

            var admin = new Admin() {
                Username = dtoAdminCreate.UserName,
                Password = BCrypt.Net.BCrypt.HashPassword(dtoAdminCreate.Password),
                Token=BCrypt.Net.BCrypt.HashPassword( dtoAdminCreate.Token),
                Person = new Person()
                {
                    FirstName = dtoAdminCreate.FirstName,
                    SecondName = dtoAdminCreate.SecondName,
                    ThirdName = dtoAdminCreate.ThirdName,
                    LastName = dtoAdminCreate.LastName,
                    Email = dtoAdminCreate.Email,
                    Phone = dtoAdminCreate.Phone,
                    Gender=dtoAdminCreate.Gender==Convert.ToInt32(enGender.Male)?Convert.ToInt32(enGender.Male):Convert.ToInt32(enGender.Female)
                }
            };


            try
            {
             await   _email.SendVerificationEmailAdmin(dtoAdminCreate.Email,Token);
            }
            catch(Exception ex)
            {
                throw new ValidationException("Error When Verify Your Email Try In Another Time");
            }

            Token= BCrypt.Net.BCrypt.HashPassword(Token);
            await _unitOfWork.Admins.AddAsync(admin);
            await _unitOfWork.Complete();
        }
        public async Task UpdateAdminAsync(DTOAdminUpdate dtoAdminUpdate)
        {
            var admin = await _unitOfWork.Admins.GetByIdAsync(dtoAdminUpdate.ID);
            if (admin == null)
            throw new NotFoundException("Data Is Not Found");

            admin.Username = dtoAdminUpdate.UsertName;
            admin.Person.FirstName = dtoAdminUpdate.FirstName;
            admin.Person.SecondName = dtoAdminUpdate.SecondName;
            admin.Person.ThirdName = dtoAdminUpdate.ThirdName;
            admin.Person.LastName = dtoAdminUpdate.LastName;
            admin.Person.Gender = dtoAdminUpdate.Gender==Convert.ToString(enGender.Male)?Convert.ToInt32(enGender.Male): Convert.ToInt32(enGender.Female);
            await _unitOfWork.Complete();
        }   
        public async Task DeleteAdminAsync(int id)
        {
            if(id <= 0)
                throw new ValidationException("Id Must Be Positive");
            var admin = await _unitOfWork.Admins.GetByIdAsync(id);
            if (admin == null)
                throw new NotFoundException("Data Is Not Found");

         await _unitOfWork.Admins.RemoveAsync(admin.Id);

            await _unitOfWork.Complete();
        }

       public async Task UpdatePasswordAsync(DTOUpdatePassword dtoUpdatePassword)
        {
            if(dtoUpdatePassword == null)
                throw new ValidationException("Data Is Not Valid");
            if(string.IsNullOrEmpty( dtoUpdatePassword.OldPassword) || string.IsNullOrEmpty(dtoUpdatePassword.NewPassword))
                throw new ValidationException("Old Password And New Password Are Required");
            if(dtoUpdatePassword.ID <= 0)
                throw new ValidationException("Id Must Be Positive");
            if (dtoUpdatePassword.OldPassword.Length < 8 || dtoUpdatePassword.NewPassword.Length < 8)
                throw new ValidationException("Passwords Must Be At Least 8 Characters Long");
            //
            var admin = await _unitOfWork.Admins.GetByIdAsync(dtoUpdatePassword.ID);
            if (admin == null)
                throw new NotFoundException("Data Is Not Found");
            if(dtoUpdatePassword.OldPassword==dtoUpdatePassword.NewPassword)
                throw new ValidationException("New Password Must Be Different From Old Password");
            //
            bool isOldPasswordValid = BCrypt.Net.BCrypt.Verify(dtoUpdatePassword.OldPassword, admin.Password);
            if (!isOldPasswordValid)
                throw new ValidationException("Old Password Is Not Correct");
            admin.Password = BCrypt.Net.BCrypt.HashPassword(dtoUpdatePassword.NewPassword);
            await _unitOfWork.Complete();


        }
        public async Task ResetPassword(string Email)
        {
            Func<int> getRandom6 = () =>
            {
                return Math.Abs((Guid.NewGuid().GetHashCode() % 900000)) + 100000;
            };

            var Admins = await _unitOfWork.Admins.getallIncludeBy(a => a.Person.Email == Email, null).FirstOrDefaultAsync();
            if (Email == null)
                throw new ValidationException("Email Invalid Not Exist");
            var OTP = getRandom6;
            //
            var resetstudent = new ResetPasswordAdmin()
            {
                OTP = BCrypt.Net.BCrypt.HashPassword(OTP.ToString()),
                AdminId = Admins.Id
                ,ExpireAt = DateTime.Now.AddMinutes(10)
                ,IsVerified=false
            };
            await _unitOfWork.ResetPasswordAdmins.AddAsync(resetstudent);
            await _unitOfWork.Complete();
            await _email.SendOTPStudentEmail(Email, OTP.ToString());
        }
        public async Task ResetPassword(DtoPassword dtoPassword)
        {
            if (dtoPassword.Password.Length < 8)
                throw new ValidationException("Password Is Not Valid");
            int studentid = 0;
            ResetPasswordAdmin Reset = null;
          
            var ResetPasss = await _unitOfWork.ResetPasswordAdmins.FindAsync(r => r.IsVerified==false);
            foreach (var reset in ResetPasss)
            {
                if (BCrypt.Net.BCrypt.Verify(dtoPassword.OTP, reset.OTP) && reset.ExpireAt > DateTime.Now)
                {
                    studentid = reset.AdminId;
                    Reset = reset;
                    break;
                }
            }

            if (Reset == null)
                throw new ValidationException("OTP Failed or Expired");

            var Admin = await _unitOfWork.Admins.GetByIdAsync(studentid);
            if (Admin == null) throw new ValidationException("There is error during Reset Password");

            Admin.Password = BCrypt.Net.BCrypt.HashPassword(dtoPassword.Password);
            Reset.IsVerified = true;

            await _unitOfWork.Complete();


        }
        public async Task<DTOReturnLogin> Login(DTOLogin dtoAdminLogin)
        {
            if (dtoAdminLogin == null)
                throw new ValidationException("Data Is Not Valid");
            if (dtoAdminLogin.UserName == null || dtoAdminLogin.Password == null)
                throw new ValidationException("Username And Password Are Required");
            var admin = await _unitOfWork.Admins.getallIncludeBy(a => a.Username == dtoAdminLogin.UserName && (a.Isverified==true), new[] { "Person" }).FirstOrDefaultAsync();
            if (admin == null)
                throw new NotFoundException("UserName or Password is InCorrect");
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dtoAdminLogin.Password, admin.Password);
            if (!isPasswordValid)
                throw new NotFoundException("UserName or Password is InCorrect");
           return await _Token.GenerateToken(dtoAdminLogin, Roles.Admin);

        }
    }
}
