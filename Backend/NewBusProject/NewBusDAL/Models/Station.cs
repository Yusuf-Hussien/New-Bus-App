using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class Station
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string Name { get; set; }
        public double Latititude { get; set; }
        public double Longitude { get; set; }
        public double Radius { get; set; }
        public virtual ICollection<StationTrip> StationTrips { get; set; } = new List<StationTrip>();

    }
}
