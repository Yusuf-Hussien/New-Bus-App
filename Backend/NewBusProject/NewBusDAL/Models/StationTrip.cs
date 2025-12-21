using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class StationTrip
    {
        public int Id { get; set; }
        [ForeignKey("Station")]
        public int StationId { get; set; }
        [ForeignKey("Trip")]
        public int TripId { get; set; }
        public bool IsVisited { get; set; }
        public virtual Station Station { get; set; }
        public virtual Trip Trip { get; set; }
    }
}
