using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class Trip
    {
        [JsonIgnore]
        public int Id { get; set; }
        [JsonIgnore]

        public DateTime StartAt{ get; set; }
        [JsonIgnore]

        public DateTime? EndAt{ get; set; }
        [ForeignKey("Route")]
        public int RouteID { get; set; }

        public int StatusTripId {  get; set; }
        [JsonIgnore]

        public DateTime? CancelAt {  get; set; }
        [JsonIgnore]

        public DateTime? CompleteAt { get; set; }
        [JsonIgnore]

        public bool IsCancel { get; set; }
        [ForeignKey("Driver")]
        [JsonIgnore]
public int CreatedByDriverId { get; set; }
        [JsonIgnore]
        public virtual Driver Driver { get; set; }
        [JsonIgnore]

        public virtual Route Route { get; set; }

        public virtual ICollection<StationTrip> StationTrips { get; set; } = new List<StationTrip>();

    }
}
