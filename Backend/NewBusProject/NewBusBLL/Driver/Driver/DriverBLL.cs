using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NewBusBLL.Driver.InterFace;
using NewBusBLL.EmailService;
using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.Token.IToken;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Constant;
using NewBusDAL.Driver.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Repositry.RepoClassess.UnitOfWork;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Driver.Driver
{
    public class DriverBLL : IDriverBLL
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IToken _Token;
        private readonly IhashingBLL _Hash;
        private readonly Iemail _email;

        public DriverBLL(IUnitOfWork UOW,IToken token,IhashingBLL hash,Iemail email)
        {
            _unitOfWork = UOW;
            _Token = token;
            _Hash = hash;
            _email=email;
        }

        
        public async Task AddDriver(DTODriverCreate driver)
        {
            if (driver == null)
                throw new ValidationException("Admin Data Is Not Valid");
            if (string.IsNullOrEmpty((string)driver.UserName) || string.IsNullOrEmpty(driver.Password))
                throw new ValidationException("Username And Password Are Required");
            if (await _unitOfWork.Drivers.IsExist((d => d.Username == driver.UserName)))
                throw new ValidationException("UserName Is Used Before");
            if (await _unitOfWork.Admins.IsExist((d => d.Username == driver.UserName)))
                throw new ValidationException("UserName Is Used Before");
            if (await _unitOfWork.Students.IsExist((d => d.Username == driver.UserName)))
                throw new ValidationException("UserName Is Used Before");
            if (await _unitOfWork.People.IsExist(s => s.Phone == driver.Phone))
                throw new ValidationException("Phone Is Used Before");
            if (await _unitOfWork.People.IsExist(s => s.Email == driver.Email)) //kkkef
                throw new ValidationException("Email Is Used Before");
            if (driver.Gender < Convert.ToInt32(enGender.Male) || Convert.ToInt32((int)driver.Gender) > Convert.ToInt32(enGender.Female))
                throw new ValidationException("GenderID Is Not Correct");
            if(!await _unitOfWork.Buses.IsExist(b => b.Id == driver.BusId))
                throw new ValidationException("Bus ID Is Not Valid");
            if(!await _unitOfWork.Admins.IsExist(a => a.Id == driver.CreatedByAdminID))
                throw new ValidationException("Admin ID Is Not Valid");
            if (driver.Password.Length < 8)
                throw new ValidationException("Password Is Not Valid");
            var Token = _Hash.GenerateSaltStringWithoutSlash(8);
            driver.Token = Token;

            var driverr = new NewBusDAL.Models.Driver()
            {
                Username = driver.UserName,
                Password =BCrypt.Net.BCrypt.HashPassword(driver.Password),
                CreatedByAdminID = driver.CreatedByAdminID,
                BusId = driver.BusId,
                Token =BCrypt.Net.BCrypt.HashPassword( driver.Token),
                Person = new Person()
                {
                    FirstName = driver.FirstName,
                    SecondName = driver.SecondName,
                    ThirdName = driver.ThirdName,
                    LastName = driver.LastName,
                    Email = driver.Email,
                    Phone = driver.Phone,
                    Gender = driver.Gender == Convert.ToInt32(enGender.Male) ? Convert.ToInt32(enGender.Male) : Convert.ToInt32(enGender.Female)
                }
            };
            try
            {
                await _email.SendVerificationEmailDriver(driver.Email, Token);
            }
            catch (Exception ex)
            {
                throw new ValidationException("Error When Verify Your Email Try In Another Time");
            }

            Token = BCrypt.Net.BCrypt.HashPassword(Token);
            await _unitOfWork.Drivers.AddAsync(driverr);
            await _unitOfWork.Complete();
        }
        public async Task UpdatePasswordAsync(DTOUpdatePassword dtoUpdatePassword)
        {
            if (dtoUpdatePassword == null)
                throw new ValidationException("Data Is Not Valid");
            if (string.IsNullOrEmpty(dtoUpdatePassword.OldPassword) || string.IsNullOrEmpty(dtoUpdatePassword.NewPassword))
                throw new ValidationException("Old Password And New Password Are Required");
            if (dtoUpdatePassword.ID <= 0)
                throw new ValidationException("Id Must Be Positive");
            if(dtoUpdatePassword.OldPassword.Length < 8 || dtoUpdatePassword.NewPassword.Length <8)
                throw new ValidationException("Passwords Must Be At Least 8 Characters Long");
            //
            var admin = await _unitOfWork.Drivers.GetByIdAsync(dtoUpdatePassword.ID);
            if (admin == null)
                throw new NotFoundException("Data Is Not Found");
            if (dtoUpdatePassword.OldPassword == dtoUpdatePassword.NewPassword)
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

            var Drivers = await _unitOfWork.Drivers.getallIncludeBy(a => a.Person.Email == Email, null).FirstOrDefaultAsync();
            if (Email == null)
                throw new ValidationException("Email Invalid Not Exist");
            var OTP = getRandom6();
            //
            var resetstudent = new ResetPasswordDriver()
            {
                OTP = BCrypt.Net.BCrypt.HashPassword(OTP.ToString()),
                DriverId = Drivers.Id,
                ExpireAt = DateTime.Now.AddMinutes(10),
                IsVerified = false
            };
            await _unitOfWork.ResetPasswordDrivers.AddAsync(resetstudent);
            await _unitOfWork.Complete();
            await _email.SendOTPStudentEmail(Email, OTP.ToString()!);
        }
        public async Task ResetPassword(DtoPassword dtoPassword)
        {
            if (dtoPassword.Password.Length < 8)
                throw new ValidationException("Password Is Not Valid");
            int studentid = 0;
            ResetPasswordDriver Reset = null;
            var ResetPasss = await _unitOfWork.ResetPasswordDrivers.FindAsync(r => r.IsVerified==false);
            foreach (var reset in ResetPasss)
            {
                if (BCrypt.Net.BCrypt.Verify(dtoPassword.OTP, reset.OTP)&&reset.ExpireAt>DateTime.Now)
                {
                    studentid = reset.DriverId;
                    Reset = reset;
                    break;
                }
            }

            if (Reset == null)
                throw new ValidationException("OTP Failed Or Expired");

            var Admin = await _unitOfWork.Drivers.GetByIdAsync(studentid);
            if (Admin == null) throw new ValidationException("There is error during Reset Password");

            Admin.Password = BCrypt.Net.BCrypt.HashPassword(dtoPassword.Password);
            Reset.IsVerified = true;

            await _unitOfWork.Complete();


        }
        public async Task<DTOCurrentLocation> GetCurrentLocation(int ID)
        {
            if (ID <= 0)
                throw new ValidationException("ID Must Be Positive Number");
            var Driver=await _unitOfWork.Drivers.GetByIdAsync(ID);
            if(Driver==null)
                throw new NotFoundException("ID Must Be Positive Number");

            return new DTOCurrentLocation() { Latitude = Convert.ToDouble(Driver.Lat), Longitude = Convert.ToDouble(Driver.Lang) };

        }

        public async Task DeleteDriver(int ID)
        {
            if(ID<=0)
                throw new ValidationException("Driver ID Is Not Valid");
            var driver = await _unitOfWork.Drivers.GetByIdAsync(ID);
            if (driver == null)
                throw new ValidationException("Driver Not Found");
          await  _unitOfWork.Drivers.RemoveAsync(ID);
            await _unitOfWork.Complete();
        }

        public async Task<IEnumerable<DTODriverRead>> GetAllDriver()
        {
            var drivers = await _unitOfWork.Drivers.GetAllDriver();
            if(drivers.Count() <=0 )
                throw new NotFoundException("No Drivers Found");
            return drivers;
        }

        public async Task<IEnumerable<DTODriverRead>> GetDriverByFirstName(string FirstName)
        {
            if(string.IsNullOrEmpty(FirstName))
                throw new ValidationException("First Name Is Not Valid");
            var drivers = await _unitOfWork.Drivers.GetDriverByFirstName(FirstName);
            if (drivers == null)
                throw new NotFoundException("No Drivers Found");
            return drivers;
        }

        public async Task<DTODriverRead> GetDriverByID(int ID)
        {
            if(ID <= 0)
                throw new ValidationException("Driver ID Is Not Valid");
            var driver = await _unitOfWork.Drivers.GetDriverByID(ID);
                if (driver == null)
                    throw new NotFoundException("No Drivers Found");
                return driver;
        }

        public async Task<IEnumerable<DTODriverRead>> GetDriverByLastName(string LastName)
        {
            if(string.IsNullOrEmpty(LastName))
                throw new ValidationException("Last Name Is Not Valid");
            var drivers = await _unitOfWork.Drivers.GetDriverByLastName(LastName);
            if (drivers == null)
                throw new NotFoundException("No Drivers Found");
            return drivers;
        }

        public async Task<DTODriverRead> GetDriverByPhone(string Phone)
        {
            if(string.IsNullOrEmpty(Phone))
                throw new ValidationException("Phone Is Not Valid");
            var driver = await _unitOfWork.Drivers.GetDriverByPhone(Phone);
            if (driver == null)
                throw new NotFoundException("No Drivers Found");
            return driver;
        }

        public async Task<DTODriverRead> GetDriverByUsername(string Username)
        {
            if(string.IsNullOrEmpty(Username))
                throw new ValidationException("Username Is Not Valid");
            var driver = await _unitOfWork.Drivers.GetDriverByUsername(Username);
            if (driver == null)
                throw new NotFoundException("No Drivers Found");
            return driver;
        }

        public async Task UpdateDriver(DtoDriverUpdate driver)
        {
          
            if(driver == null) throw new ValidationException("Driver Data Is Not Valid");
            if(driver.ID <= 0) throw new ValidationException("Driver ID Is Not Valid");
            var driverInDb = await _unitOfWork.Drivers.GetByIdAsync(driver.ID);
            if (driverInDb == null)
                throw new ValidationException("Driver Not Found");

            driverInDb.Person.FirstName = driver.FirstName;
            driverInDb.Person.SecondName = driver.SecondName;
            driverInDb.Person.ThirdName = driver.ThirdName; 
            driverInDb.Person.LastName = driver.LastName;
            driverInDb.Username = driver.UsertName;
           await _unitOfWork.Drivers.UpdateAsync(driverInDb);
            await _unitOfWork.Complete();

        }

       public async Task UpdateDriverBus(DTODriverUpdateBus dTO)
        {
            if(dTO == null) throw new ValidationException("Driver Data Is Not Valid");
            var driverInDb = await _unitOfWork.Drivers.GetByIdAsync(dTO.Id);
            if (driverInDb == null)
                throw new ValidationException("Driver Not Found");
            driverInDb.BusId = dTO.BusId;
            await _unitOfWork.Drivers.UpdateAsync(driverInDb);
            await _unitOfWork.Complete();
        }

        public async Task<DTOReturnLogin> Login(DTOLogin dtoDriverLogin)
        {
            if (dtoDriverLogin == null)
                throw new ValidationException("Data Is Not Valid");
            if (dtoDriverLogin.UserName == null || dtoDriverLogin.Password == null)
                throw new ValidationException("Username And Password Are Required");
            var admin = await _unitOfWork.Drivers.getallIncludeBy(a => a.Username == dtoDriverLogin.UserName && (a.Isverified == true), new[] { "Person" }).FirstOrDefaultAsync();
            if (admin == null)
                throw new NotFoundException("UserName or Password is InCorrect");
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dtoDriverLogin.Password, admin.Password);
            if (!isPasswordValid)
                throw new NotFoundException("UserName or Password is InCorrect");
            return await _Token.GenerateToken(dtoDriverLogin, Roles.Driver);

        }
        public async Task<bool> VerifyEmail(string Token)
        {

            var Drivers = await _unitOfWork.Drivers.getallIncludeBy(a => a.Isverified == false, null).ToListAsync();

            foreach (var driver in Drivers)
            {
                if (BCrypt.Net.BCrypt.Verify(Token, driver.Token))
                {
                    driver.Isverified = true;
                  await  _unitOfWork.Complete();
                    return true;
                }
            }
            return false;
        }
        public async Task UpdateLiveLocation(DtoUpdateLocation dto)
        {
            var driver =await _unitOfWork.Drivers.GetByAsync(d=>d.Id==dto.Id);
            if(driver == null)
                return ;
            driver.Lang = Convert.ToDouble(dto.Lang);
            driver.Lat = Convert.ToDouble(dto.Lat);
            await _unitOfWork.Complete(); 
        }
    }
}
