using AutoMapper;
using NewBusDAL.Enums;
using NewBusDAL.Trip.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Trip.Mapper
{
    public class TripProfile:Profile
    {
        public TripProfile()
        {
            CreateMap<Models.Trip,DtoTripRead>().
                ForMember(to=>to.Id,from=>from.MapFrom(from=>from.Id)).
                ForMember(to => to.StatusTrip, from => from.MapFrom(from => from.StatusTripId==((int)enStatusTrip.Completed)? enStatusTrip.Completed.ToString() : enStatusTrip.NonComplete.ToString())).
                ForMember(to => to.StartAt, from => from.MapFrom(from => from.StartAt)).
                ForMember(to => to.EndAt, from => from.MapFrom(from => from.EndAt)).
                ForMember(to => to.TripFrom, from => from.MapFrom(from => from.Route.From)).
                ForMember(to => to.TripTo, from => from.MapFrom(from => from.Route.To)).
                ForMember(to => to.CreateByBDriverName, from => from.MapFrom(from => from.Driver.Person.FirstName+" "+ from.Driver.Person.LastName))
                ;
        }
    }
}
