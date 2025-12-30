using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Station
{
    public class StationMapper:Profile
    {
        public StationMapper()
        {
            CreateMap<NewBusDAL.Models.Station, DTOStationRead>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Redius, opt => opt.MapFrom(src => src.Radius))
                .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.Latititude))
                .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.Longitude))
                ;
        }
    }
}
