using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class Route
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        [JsonIgnore]
        public virtual ICollection<Trip> Routes { get; set; } = new List<Trip>();
    }
}
