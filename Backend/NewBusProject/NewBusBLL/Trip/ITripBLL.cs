using NewBusDAL.Trip.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Trip
{
    public interface ITripBLL
    {
        public Task<int> GetAllTripsCountToday();

        public Task<IEnumerable<DtoTripRead>> GetAllTrips();
        public Task<DtoTripRead> GetTripByID (int id);
        public Task<int> AddTrip(DtoTripCreate trip);
        public Task UpdateStatusTrip(DtoTripUpdateStatus dto);
        public Task CancelTrip(int Id);
        public Task FinishTrip(int Id);

    }
}
