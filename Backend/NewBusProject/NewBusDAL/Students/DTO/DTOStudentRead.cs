using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Students.DTO
{
    public class DTOStudentRead
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string SecondName { get; set; }
        public string ThirdName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string UserName { get; set; }
        public string Gender { get; set; }
        public string FacultyName { get; set; }
        public string LevelOfStudy { get; set; }
    }
}
