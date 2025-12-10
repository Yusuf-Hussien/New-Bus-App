using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Driver.DTO
{
    public class DTODriverCreate
    {
        public string FirstName { get; set; }
        public string SecondName { get; set; }
        public string ThirdName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int Gender { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public int BusId { get; set; }
        [JsonIgnore]

        public int CreatedByAdminID { get; set; }
        [JsonIgnore]
        public string? Token { get; set; }
    }
}
