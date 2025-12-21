using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.NewFolder.Group
{
    public class Group
    {
        private readonly IUnitOfWork _UOW;
        public Group(IUnitOfWork UOW)
        {
            _UOW = UOW;
        }
        public async Task AddGroup(string Name)
        {
            var group = new NewBusDAL.Models.Group()
            {
                Name = Name
            };
            if (await _UOW.Groups.IsExist(g => g.Name == Name))
                return;
            await _UOW.Groups.AddAsync(group);
            await _UOW.Complete();
        }
    }
}
