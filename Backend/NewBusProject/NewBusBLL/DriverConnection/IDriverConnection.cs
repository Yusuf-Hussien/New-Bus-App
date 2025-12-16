using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.DriverConnection
{
    public interface IDriverConnection
    {
        public  Task AddToConnectionDriverTable(string connectionId, int DriverId);


        public  Task RemoveFromConnectionDriverTable(string connectionId);
        public Task<int> GetAllDriverActive();

    }
}
