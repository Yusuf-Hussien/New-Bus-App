using AutoMapper;
using NewBusBLL.Exceptions;
using NewBusBLL.Station.Interface;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Station;
using NewBusDAL.StationTrip;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Station
{
    public class StationBLL:IstationBLL
    {
        private readonly IUnitOfWork _UOW;
        private readonly IMapper _Mapper;
        public StationBLL(IUnitOfWork UOW,IMapper mapper)
        {
            _UOW = UOW;
            _Mapper = mapper;
        }
        public async Task<IEnumerable<NewBusDAL.Models.Station>>GetAllStationsForHub()
        {
            var Stations=await _UOW.Stations.GetAllAsync();
            if (Stations == null || Stations.Count() <= 0)
                return null;
            return Stations;
        }
        public async Task<IEnumerable<DTOStationRead>> GetAllStations()
        {
            var Stations = await _UOW.Stations.GetAllAsync();
            if (Stations == null||Stations.Count()<=0)
               throw new NotFoundException("Data Is Not Found") ;
            return _Mapper.Map<IEnumerable<DTOStationRead>>(Stations);
        }
        public async Task<int> AddStation(NewBusDAL.Models.Station station)
        {
            if (station == null)
                throw new ValidationException("Data Is Not Valid");
            await _UOW.Stations.AddAsync(station);
            await _UOW.Complete();
            return station.Id;

        }
        public async Task RemoveStation(int StationId)
        {
            if(StationId<=0)
                throw new ValidationException("Id Must Be Positive");

            var Station =await _UOW.Stations.GetByIdAsync(StationId);
            if (Station == null)
                throw new NotFoundException("Not Found Data Station");
          await  _UOW.Stations.RemoveAsync(StationId);
            await _UOW.Complete();
        }

  
    }
}
