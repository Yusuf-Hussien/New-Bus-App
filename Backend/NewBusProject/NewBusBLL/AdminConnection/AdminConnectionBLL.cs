using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.AdminConnection
{
    public class AdminConnectionBLL:IAdminConnection
    {
        private readonly IUnitOfWork _UOW;
        public AdminConnectionBLL(IUnitOfWork UOW)
        {
            _UOW = UOW;
        }
        public async Task<int> GetAllAdminActive()
        {
            var AdminActive = await _UOW.AdminConnections.GetAllAsync();
            return AdminActive.Count();
        }
        public async Task AddToConnectionAdminTable(string connectionId, int adminId)
        {
            var admin = await _UOW.Admins.GetByIdAsync(adminId);
            if (admin != null)
            {
               var adminConnection = new NewBusDAL.Models.AdminConnections
                {
                    CoonectionId = connectionId,
                    AdminId = adminId
                };
                await _UOW.AdminConnections.AddAsync(adminConnection);
                await _UOW.Complete();
            }
        }
        public async Task RemoveFromConnectionAdminTable(string connectionId)
        {
            var isexist =await _UOW.AdminConnections.IsExist(ac=>ac.CoonectionId==connectionId);
            if (isexist)
            {
                var adminconnections = await _UOW.AdminConnections.GetByAsync(ac => ac.CoonectionId == connectionId);
        if(adminconnections==null)
                    return;
                await   _UOW.AdminConnections.RemoveAsync(adminconnections.Id);
                await _UOW.Complete();
            }
        }
    }
}
