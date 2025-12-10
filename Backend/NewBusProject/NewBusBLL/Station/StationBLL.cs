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
        public StationBLL(IUnitOfWork UOW)
        {
            _UOW = UOW;
        }
        public async Task<IEnumerable<NewBusDAL.Models.Station>>GetAllStationsForHub()
        {
            var Stations=await _UOW.Stations.GetAllAsync();
            if (Stations == null || Stations.Count() <= 0)
                return null;
            return Stations;
        }
        public async Task<IEnumerable<NewBusDAL.Models.Station>> GetAllStations()
        {
            var Stations = await _UOW.Stations.GetAllAsync();
            if (Stations == null||Stations.Count()<=0)
               throw new NotFoundException("Data Is Not Found") ;
            return Stations;
        }
        public async Task AddStation(NewBusDAL.Models.Station station)
        {
            if (station == null)
                throw new ValidationException("Data Is Not Valid");
          await  _UOW.Stations.AddAsync(station);
           await _UOW.Complete();

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
