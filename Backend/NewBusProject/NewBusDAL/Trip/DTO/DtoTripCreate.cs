using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Trip.DTO
{
    public class DtoTripCreate
    {
        [JsonIgnore]
        public int Id { get; set; }
        public int StatusTripId { get; set; }
        public int RouteID {  get; set; }
        [JsonIgnore]

        public int CreatedByDriverId { get; set; }
    }
}
