using NewBusBLL.Exceptions;
using NewBusDAL.Admins.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Admins.InterFace
{
    public interface IadminBLL
    {
        public  Task<IEnumerable<DTOAdminRead>> GetAllAdminsAsync();
        public  Task<DTOAdminRead> GetAdminByIdAsync(int id);
        public  Task<IEnumerable<DTOAdminRead>> GetAdminByFirstName(string FirstName);
        public  Task<IEnumerable<DTOAdminRead>> GetAdminByLastName(string LastName);
        public  Task<DTOAdminRead> GetAdminByPhone(string Phone);
        public  Task<DTOAdminRead> GetAdminByUsernameAsync(string username);
        public  Task AddAdminAsync(DTOAdminCreate dtoAdminCreate);
        public  Task UpdateAdminAsync(DTOAdminUpdate dtoAdminUpdate);
        public  Task DeleteAdminAsync(int id);
        public  Task UpdatePasswordAsync(DTOUpdatePassword dtoUpdatePassword);
        public Task <DTOReturnLogin>Login(DTOLogin dtoAdminLogin);
        public Task<bool> VerifyEmail(string Token);
        public Task ResetPassword(string Email);
        public Task ResetPassword(DtoPassword dtoPassword);

    }
}
