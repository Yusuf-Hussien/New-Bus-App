using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Students.DTO
{
    public class DTOStudentUpdate
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string SecondName { get; set; }
        public string ThirdName { get; set; }
        public string LastName { get; set; }
        public int Gender { get; set; }
        public string UserName { get; set; }
        public int LevelOfStudy { get; set; }  
    }
}
