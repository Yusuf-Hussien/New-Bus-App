using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Trip.DTO
{
    public class DtoTripRead
    {
        public int Id { get; set; }
        public DateTime StartAt {  get; set; }
        public DateTime EndAt { get; set; }

        public string TripFrom { get; set; }
        public string TripTo { get; set; }
        public string StatusTrip { get; set; }
        public string CreateByBDriverName { get; set; }

    }
}
