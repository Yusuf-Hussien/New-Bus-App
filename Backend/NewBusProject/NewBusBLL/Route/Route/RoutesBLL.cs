using AutoMapper;
using NewBusBLL.Exceptions;
using NewBusBLL.Route.InteFace;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Repositry.RepoClassess.UnitOfWork;
using NewBusDAL.Route;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Route.Route
{
    public class RoutesBLL:IRoute
    {

        private readonly IUnitOfWork _UOW;
        private readonly IMapper _Mapper;
        public RoutesBLL(IUnitOfWork UOW,IMapper mapper)
        {
            _UOW = UOW;
            _Mapper = mapper;
        }
        public async Task AddRoute(NewBusDAL.Models.Route route)
        {
            var group = new NewBusDAL.Models.Route()
            {
                From = route.From,
                To = route.To,
            };
            if (await _UOW.Routes.IsExist(g => g.From == route.From&&g.To==route.To))
                return;
            await _UOW.Routes.AddAsync(route);
            await _UOW.Complete();
        }
        public async Task RemoveRouteAsync(int id)
        {
            if (id <= 0)
                throw new ValidationException("Invalid bus ID");
            var bus = _UOW.Routes.GetByIdAsync(id);
            if (bus == null)
                throw new NotFoundException($"No Buses found Has ID {id}");
            await _UOW.Buses.RemoveAsync(id);
            await _UOW.Complete();
        }

     

     public async Task<IEnumerable<dtorouteread>> GetAllRoutesAsync()
        {
            var routes = await _UOW.Routes.GetAllAsync();
            if ( routes.Count() <= 0)
                throw new NotFoundException("Data Is Not Found");
            return  _Mapper.Map<IEnumerable<dtorouteread>>(routes);


        }

       
    }
}
