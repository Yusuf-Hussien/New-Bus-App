using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Trip.DTO
{
    public class DtoTripUpdateStatus
    {
        public int Id { get; set; }
        public int StatusTripId { get; set; }
        [JsonIgnore]
        public int CreatedByDriverID { get; set; }
    }
}
