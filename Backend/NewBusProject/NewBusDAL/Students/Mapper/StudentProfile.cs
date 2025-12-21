using AutoMapper;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Students.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Students.Mapper
{
    public class StudentProfile:Profile
    {
        public StudentProfile()
        {
            CreateMap<Student, DTOStudentRead>()
       .ForMember(to => to.ID, from => from.MapFrom(from => from.Id)).
       ForMember(to => to.FirstName, from => from.MapFrom(from => from.Person.FirstName)).
       ForMember(to => to.SecondName, from => from.MapFrom(from => from.Person.SecondName)).
       ForMember(to => to.ThirdName, from => from.MapFrom(from => from.Person.ThirdName)).
       ForMember(to => to.LastName, from => from.MapFrom(from => from.Person.LastName)).
       ForMember(to => to.Email, from => from.MapFrom(from => from.Person.Email)).
       ForMember(to => to.Phone, from => from.MapFrom(from => from.Person.Phone)).
       ForMember(to => to.Gender, from => from.MapFrom(from => from.Person.Gender == Convert.ToInt32(enGender.Male) ? Convert.ToString(enGender.Male) : Convert.ToString(enGender.Female))).
       ForMember(to => to.UserName, from => from.MapFrom(from => from.Username))
       .ForMember(to => to.FacultyName, from => from.MapFrom(from => from.Faculty.Name))
.ForMember(to => to.LevelOfStudy, from => from.MapFrom(from => from.Level))
       ;
        }
    }
}
