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
        Task<IEnumerable<NewBusDAL.Models.Faculty>> GetAllFacultiesAsync();
        Task<NewBusDAL.Models.Faculty> GetFacultyByIdAsync(int id);
        Task AddFacultyAsync(NewBusDAL.Models.Faculty faculty);
    }
}
