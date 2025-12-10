using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Driver.DTO;
using NewBusDAL.Driver.InterfaceAdminRepositry;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IBaseRepositry;
using NewBusDAL.Repositry.RepoClassess.BaseRepositry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Driver.DriverRepositry
{
    public class DriverRepositry : BaseRepsitry<NewBusDAL.Models.Driver>, IDriverRepositry
    {
        private readonly NewBusContext _Context;
        private readonly IMapper _mapper;
        public DriverRepositry(NewBusContext context, IMapper mapper) : base(context)
        {
            _Context = context;
            _mapper = mapper;
        }
       public async Task<IEnumerable<DTODriverRead>>GetAllDriver()
        {
            var drivers=await _context.Drivers
                .Include(d=>d.Person).Include(d=>d.Admin).
                ThenInclude(a=>a.Person).Include(d=>d.Bus).ToListAsync();

            if (drivers == null)
                return null;
            return _mapper.Map<IEnumerable<DTODriverRead>>(drivers); 
        }

       public async Task<IEnumerable<DTODriverRead>> GetDriverByFirstName(string FirstName)
        {
            var drivers = await _context.Drivers
              .Include(d => d.Person).Include(d => d.Admin).
              ThenInclude(a => a.Person).Include(d => d.Bus).Where(d=>d.Person.FirstName==FirstName).ToListAsync();

            if (drivers == null)
                return null;
            return _mapper.Map<IEnumerable<DTODriverRead>>(drivers);
        }

       public async Task<DTODriverRead> GetDriverByID(int ID)
        {
             var drivers = await _context.Drivers
.Include(d => d.Person).Include(d => d.Admin).
ThenInclude(a => a.Person).Include(d => d.Bus).Where(d => d.Id == ID).FirstOrDefaultAsync();

            if (drivers == null)
                return null;
            return _mapper.Map<DTODriverRead>(drivers);
        }

    public async  Task<IEnumerable<DTODriverRead>> GetDriverByLastName(string LastName)
        {
            var drivers = await _context.Drivers
           .Include(d => d.Person).Include(d => d.Admin).
           ThenInclude(a => a.Person).Include(d => d.Bus).Where(d => d.Person.LastName == LastName).ToListAsync();

            if (drivers == null)
                return null;
            return _mapper.Map<IEnumerable<DTODriverRead>>(drivers);
        }

        public async Task<DTODriverRead> GetDriverByPhone(string Phone)
        {
            var drivers = await _context.Drivers
               .Include(d => d.Person).Include(d => d.Admin).
               ThenInclude(a => a.Person).Include(d => d.Bus).Where(d => d.Person.Phone == Phone).FirstOrDefaultAsync();

            if (drivers == null)
                return null;
            return _mapper.Map<DTODriverRead>(drivers);
        }

       public async Task<DTODriverRead> GetDriverByUsername(string Username)
        {
            var drivers = await _context.Drivers
    .Include(d => d.Person).Include(d => d.Admin).
    ThenInclude(a => a.Person).Include(d => d.Bus).Where(d => d.Username == Username).FirstOrDefaultAsync();

            if (drivers == null)
                return null;
            return _mapper.Map<DTODriverRead>(drivers);
        }

     

      

    
    }
}
