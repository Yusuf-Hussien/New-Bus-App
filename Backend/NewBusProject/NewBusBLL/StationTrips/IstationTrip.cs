using NewBusDAL.StationTrip;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.StationTrips
{
    public interface IstationTrip
    {
        public Task<bool> AddStationTrip(DtoStationTrip dto);
        public  Task<DtoStationTrip> GetStationTrip(int StationId, int TripId);
    }
}
