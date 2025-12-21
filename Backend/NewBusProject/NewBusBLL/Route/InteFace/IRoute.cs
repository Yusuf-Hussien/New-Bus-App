using NewBusBLL.Exceptions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Route.InteFace
{
    public interface IRoute
    {
        public  Task AddRoute(NewBusDAL.Models.Route route);
        public  Task RemoveRouteAsync(int id);
    }
}
