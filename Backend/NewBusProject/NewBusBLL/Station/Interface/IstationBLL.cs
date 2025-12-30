using NewBusBLL.Exceptions;
using NewBusDAL.Station;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Station.Interface
{
    public interface IstationBLL
    {
        public  Task<IEnumerable<NewBusDAL.Models.Station>> GetAllStationsForHub();
        public  Task<IEnumerable<DTOStationRead>> GetAllStations();
        public  Task<int> AddStation(NewBusDAL.Models.Station station);
        public Task RemoveStation(int StationId);
    }
}
