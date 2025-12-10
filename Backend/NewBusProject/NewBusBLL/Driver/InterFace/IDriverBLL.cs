using NewBusDAL.Admins.DTO;
using NewBusDAL.Driver.DTO;
using NewBusDAL.DTO_General;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Driver.InterFace
{
    public interface IDriverBLL
    {
        Task<IEnumerable<DTODriverRead>> GetAllDriver();
        Task<DTODriverRead> GetDriverByID(int ID);
        Task<IEnumerable<DTODriverRead>> GetDriverByFirstName(string FirstName);
        Task<IEnumerable<DTODriverRead>> GetDriverByLastName(string LastName);
        Task<DTODriverRead> GetDriverByPhone(string Phone);
        Task<DTODriverRead> GetDriverByUsername(string Username);
        Task AddDriver(DTODriverCreate driver);
        Task DeleteDriver(int ID);
        Task UpdateDriver(DtoDriverUpdate driver);
        Task UpdateDriverBus(DTODriverUpdateBus dTO);
        public  Task UpdatePasswordAsync(DTOUpdatePassword dtoUpdatePassword);
        public Task<DTOReturnLogin> Login(DTOLogin dtoDriverLogin);
        public Task UpdateLiveLocation(DtoUpdateLocation liveLication);
        public Task<DTOCurrentLocation> GetCurrentLocation(int ID);
        public  Task<bool> VerifyEmail(string Token);
        public  Task ResetPassword(string Email);
        public Task ResetPassword(DtoPassword dtoPassword);

    }
}
