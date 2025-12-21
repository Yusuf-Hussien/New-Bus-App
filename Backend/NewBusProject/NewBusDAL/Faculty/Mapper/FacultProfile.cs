using AutoMapper;
using NewBusDAL.Bus.DTO;
using NewBusDAL.Faculty.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Faculty.Mapper
{
    public class FacultProfile:Profile
    {
        public FacultProfile() {

            CreateMap<NewBusDAL.Models.Faculty, DtoFacultyRead>()
                                 .ForMember(to => to.Id, from => from.MapFrom(from => from.Id))
                                 .ForMember(to => to.Name, from => from.MapFrom(from => from.Name));

        }
    }
}
