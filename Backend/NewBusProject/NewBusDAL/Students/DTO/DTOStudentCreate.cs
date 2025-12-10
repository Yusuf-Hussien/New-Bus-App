using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NewBusDAL.Students.DTO
{
    public class DTOStudentCreate
    {
        [JsonIgnore]
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string SecondName { get; set; }
        public string ThirdName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int Gender { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public int FacultyId { get; set; }
        public int Level { get; set; }
        [JsonIgnore]

        public string? Token { get; set; }
    }
}
