using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.AdminConnection
{
    public interface IAdminConnection
    {
        public  Task AddToConnectionAdminTable(string connectionId, int adminId);
        public  Task RemoveFromConnectionAdminTable(string connectionId);
        public Task<int> GetAllAdminActive();

    }
}
