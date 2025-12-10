using AutoMapper;
using NewBusBLL.Exceptions;
using NewBusBLL.Faculty.Interface;
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
        public FacultyBLL(IUnitOfWork UOW)
        {
            _UOW = UOW;
        }
        public async Task AddFacultyAsync(NewBusDAL.Models.Faculty faculty)
        {
          if (faculty == null)
              throw new ValidationException("Faculty cannot be null.");
            // Additional validation logic can be added here
            // Simulate async operation
            await   _UOW.Faculties.AddAsync(faculty);
            await _UOW.Complete();
        }

      public  async Task<IEnumerable<NewBusDAL.Models.Faculty>> GetAllFacultiesAsync()
        {
            var faculties =await  _UOW.Faculties.GetAllAsync();
            if (faculties.Count() <= 0 )
                throw new NotFoundException("No faculties found.");
            return faculties;
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
