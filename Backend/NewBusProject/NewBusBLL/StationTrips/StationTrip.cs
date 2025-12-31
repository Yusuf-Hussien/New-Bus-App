using AutoMapper;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.StationTrip;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.StationTrips
{
    public class StationTrip:IstationTrip
    {
        private readonly IUnitOfWork _UOW;
        private readonly IMapper _Mapper;
        public StationTrip(IUnitOfWork UOW,IMapper mapper)
        {
            _UOW = UOW;
            _Mapper = mapper;
        }
        public async Task<bool> AddStationTrip(DtoStationTrip dto)
        {
            var Station = await _UOW.StationTrips.GetByAsync(s => s.StationId == dto.StationId && s.TripId == dto.TripId);
            if (Station != null) return false;
            var trip = new NewBusDAL.Models.StationTrip()
            {
                TripId = dto.TripId,
                StationId = dto.StationId,
                IsVisited = true,
            };
            await _UOW.StationTrips.AddAsync(trip);
            await _UOW.Complete();
            return true;


        }

        public async Task<DtoStationTrip>GetStationTrip(int StationId,int TripId)
        {
         
            var Station = await _UOW.StationTrips.GetByAsync(s => s.StationId == StationId && s.TripId == TripId);
            if (Station == null) return null;

            return _Mapper.Map<DtoStationTrip>(Station);

        }
    }
}
