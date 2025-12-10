using NewBusBLL.Exceptions;
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
        public  Task<IEnumerable<NewBusDAL.Models.Station>> GetAllStations();
        public  Task AddStation(NewBusDAL.Models.Station station);
        public Task RemoveStation(int StationId);
    }
}
