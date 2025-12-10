using AutoMapper;
using NewBusDAL.Bus.DTO;
using NewBusDAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Bus.Mapper
{
    public class BusProfile:Profile
    {
        public BusProfile() {
        CreateMap<NewBusDAL.Models.Bus, DTOStatusBus>()
                                .ForMember(to => to.Status, from => from.MapFrom(from => from.Status == Convert.ToInt32(enStatusBus.Active) ? enStatusBus.Active.ToString() : enStatusBus.UnderMaintenance.ToString()));

            CreateMap<NewBusDAL.Models.Bus, DtoBusRead>()
                .ForMember(to=>to.Status,from=>from.MapFrom(from=>from.Status==Convert.ToInt32(enStatusBus.Active)?enStatusBus.Active.ToString(): enStatusBus.UnderMaintenance.ToString()));


        }
    }
}
