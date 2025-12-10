using NewBusDAL.Bus.DTO;
using NewBusDAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Bus.Interface
{
    public interface IBusBLL
    {
        Task <IEnumerable<DTOStatusBus>> GetStatusBusAsync();
        Task<IEnumerable<DtoBusRead>> GetAllBusesAsync();
        Task<DtoBusRead> GetBusByIdAsync(int id);
        Task AddBusAsync(NewBusDAL.Models.Bus bus);
        Task UpdateBusAsync(DtoBusUpdate dto);
        Task RemoveBusAsync(int id);
    }
}
