using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.StationTrip
{
    public class DtoStationTrip
    {
        [JsonIgnore]
        public int ID { get; set; }
        public int StationId { get; set; }
        public int TripId { get; set; }
        public bool IsVisited { get; set; }
    }
}
