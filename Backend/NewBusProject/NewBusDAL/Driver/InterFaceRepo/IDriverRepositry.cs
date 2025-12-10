using NewBusDAL.Admins.DTO;
using NewBusDAL.Driver.DTO;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IBaseRepositry;
using NewBusDAL.Repositry.RepoClassess.BaseRepositry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Driver.InterfaceAdminRepositry
{
    public interface IDriverRepositry:IbaseRepositry<NewBusDAL.Models.Driver>
    {
        Task<IEnumerable<DTODriverRead>> GetAllDriver();
        Task<DTODriverRead> GetDriverByID(int ID);
        Task<IEnumerable<DTODriverRead>> GetDriverByFirstName(string FirstName);
        Task<IEnumerable<DTODriverRead>> GetDriverByLastName(string LastName);
        Task<DTODriverRead> GetDriverByPhone(string Phone);
        Task<DTODriverRead> GetDriverByUsername(string Username);
        

    }
}
