using AutoMapper;
using NewBusBLL.Exceptions;
using NewBusBLL.Faculty.Interface;
using NewBusDAL.Faculty.DTO;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Faculty.FacultyBLL
{
    public class FacultyBLL : IFacultyBLL
    {
        private readonly IUnitOfWork _UOW;
        private readonly IMapper _Mapper;
        public FacultyBLL(IUnitOfWork UOW, IMapper mapper)
        {
            _UOW = UOW;
            _Mapper = mapper;
        }
        public async Task AddFacultyAsync(NewBusDAL.Models.Faculty faculty)
        {
          if (faculty == null)
              throw new ValidationException("Faculty cannot be null.");
          if(await _UOW.Faculties.IsExist(f=>f.Name==faculty.Name))
                throw new ValidationException("Faculty Is Already Exist.");
            // Additional validation logic can be added here
            // Simulate async operation
            await _UOW.Faculties.AddAsync(faculty);
            await _UOW.Complete();
        }

      public  async Task<IEnumerable<DtoFacultyRead>> GetAllFacultiesAsync()
        {
            var faculties =await  _UOW.Faculties.GetAllAsync();
            if (faculties.Count() <= 0 )
                throw new NotFoundException("No faculties found.");
            return _Mapper.Map<IEnumerable<DtoFacultyRead>>(faculties);
        }

      public async  Task<NewBusDAL.Models.Faculty> GetFacultyByIdAsync(int id)
        {
            var faculties = await _UOW.Faculties.GetByIdAsync(id);
            if (faculties == null)
                throw new NotFoundException("No faculties found.");
            return faculties;
        }

      public async  Task UpdateFacultyAsync(NewBusDAL.Models.Faculty faculty,int ID)
        {
            if (faculty == null)
                throw new ValidationException("Faculty cannot be null.");
            if(ID<=0)
                throw new ValidationException("Invalid Faculty ID.");
            var existingFaculty = await _UOW.Faculties.GetByIdAsync(ID);
            if (existingFaculty == null)
                throw new NotFoundException("Faculty not found.");
            // Update properties
            existingFaculty.Name = faculty.Name;
          await _UOW.Faculties.UpdateAsync(existingFaculty);
            await _UOW.Complete();
        }

       
    }
}
