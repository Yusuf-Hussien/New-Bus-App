using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IBaseRepositry;
using NewBusDAL.Repositry.RepoClassess.BaseRepositry;
using NewBusDAL.Trip.DTO;
using NewBusDAL.Trip.InterfaceTripRepo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Trip.TripRepo
{
    public class TripRepo:BaseRepsitry<Models.Trip>,ITripRepsitry
    {
        private readonly NewBusContext _Context;
        private readonly IMapper _mapper;
        public TripRepo(NewBusContext context,IMapper mapper):base(context) {
            _Context = context;
            _mapper = mapper;
        }

     public async Task<IEnumerable<DtoTripRead>> GetAllTrips()
        {
            var Trips = await _context.Trips.Include(t => t.Driver).ThenInclude(d => d.Person).Include(t => t.Route).ToListAsync();
            if (!Trips.Any())
                return null;
            return _mapper.Map<IEnumerable<DtoTripRead>>(Trips);    
        }

    public async Task<DtoTripRead> GetTripById(int id)
        {
            var Trips = await _context.Trips.Include(t => t.Driver).
                ThenInclude(d => d.Person)
                .Include(t => t.Route).Where(T=>T.Id==id).FirstOrDefaultAsync();
            if (Trips==null)
                return null;
            return _mapper.Map<DtoTripRead>(Trips);
        }
    }
}
