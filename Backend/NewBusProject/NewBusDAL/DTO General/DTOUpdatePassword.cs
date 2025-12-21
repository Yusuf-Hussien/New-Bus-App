using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.DTO_General
{
    public class DTOUpdatePassword
    {
       
        public int ID { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
