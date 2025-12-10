using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.DriverConnection
{
    public class DriverConnectionBLL:IDriverConnection
    {
        private readonly IUnitOfWork _UOW;
        public DriverConnectionBLL(IUnitOfWork UOW)
        {
            _UOW = UOW;
        }
        public async Task AddToConnectionDriverTable(string connectionId, int DriverId)
        {
            var Driver = await _UOW.Drivers.GetByIdAsync(DriverId);
            if (Driver != null)
            {
                var DriverConnection = new NewBusDAL.Models.DriverConnection
                {
                    CoonectionId = connectionId,
                    DriverId = DriverId
                };
                await _UOW.DriverConnections.AddAsync(DriverConnection);
                await _UOW.Complete();
            }
        }
        public async Task RemoveFromConnectionDriverTable(string connectionId)
        {
            var isexist = await _UOW.DriverConnections.IsExist(ac => ac.CoonectionId == connectionId);
            if (isexist)
            {
                var DriverConnection = await _UOW.DriverConnections.GetByAsync(ac => ac.CoonectionId == connectionId);
                if (DriverConnection == null)
                    return;
                await _UOW.DriverConnections.RemoveAsync(DriverConnection.Id);
                await _UOW.Complete();
            }
        }
    }
}
