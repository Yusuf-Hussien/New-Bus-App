using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.StudentConnection
{
    public interface IStudentConnection
    {
        public  Task AddToConnectionStudentTable(string connectionId, int StudentId);
        public Task RemoveFromConnectionStudentTable(string connectionId);
        public Task<int> GetAllStudentConnection();

    }
}
