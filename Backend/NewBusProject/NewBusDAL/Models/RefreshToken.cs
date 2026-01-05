using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class RefreshToken
    {
        [JsonIgnore]

        public int Id { get; set; }
        public string Token { get; set; }
        [JsonIgnore]
        public string Salt { get; set; }
        [JsonIgnore]
        public bool IsActive { get; set; }
        public DateTime ExpireAt { get; set; }

    }
}
