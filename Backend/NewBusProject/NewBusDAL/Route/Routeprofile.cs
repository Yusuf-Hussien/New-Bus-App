using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Route
{
    public class Routeprofile:Profile
    {
        public Routeprofile()
        {
            CreateMap<NewBusDAL.Models.Route, dtorouteread>()
                .ForMember(to => to.Id, from => from.MapFrom(from => from.Id)).
            ForMember(to => to.From, from => from.MapFrom(from => from.From)).
            ForMember(to => to.To, from => from.MapFrom(from => from.To));
        }
        }
}
