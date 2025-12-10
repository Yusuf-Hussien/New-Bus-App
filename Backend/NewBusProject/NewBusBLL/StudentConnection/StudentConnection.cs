using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.StudentConnection
{
    public class StudentConnection:IStudentConnection
    {
        private readonly IUnitOfWork _UOW;
        public StudentConnection(IUnitOfWork UOW)
        {
            _UOW = UOW;
        }
        public async Task AddToConnectionStudentTable(string connectionId, int StudentId)
        {
            var Student = await _UOW.Students.GetByIdAsync(StudentId);
            if (Student != null)
            {
                var adminConnection = new NewBusDAL.Models.StudentConnection
                {
                    CoonectionId = connectionId,
                    StudentId = StudentId
                };
                await _UOW.StudentConnections.AddAsync(adminConnection);
                await _UOW.Complete();
            }
        }
        public async Task RemoveFromConnectionStudentTable(string connectionId)
        {
            var isexist = await _UOW.StudentConnections.IsExist(ac => ac.CoonectionId == connectionId );
            if (isexist)
            {
                var studentconnections = await _UOW.StudentConnections.GetByAsync(ac => ac.CoonectionId == connectionId);
                if (studentconnections == null)
                    return;
                await _UOW.StudentConnections.RemoveAsync(studentconnections.Id);
                await _UOW.Complete();
            }
        }
    }
}
