using NewBusDAL.Faculty.DTO;
using NewBusDAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Faculty.Interface
{
    public interface IFacultyBLL
    {
        Task UpdateFacultyAsync(NewBusDAL.Models.Faculty faculty,int ID);
        public Task<IEnumerable<DtoFacultyRead>> GetAllFacultiesAsync();
        Task<NewBusDAL.Models.Faculty> GetFacultyByIdAsync(int id);
        Task AddFacultyAsync(NewBusDAL.Models.Faculty faculty);
    }
}
