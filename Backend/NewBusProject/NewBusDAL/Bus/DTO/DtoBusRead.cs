using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Bus.DTO
{
    public class DtoBusRead
    {
        public int ID { get; set; }
        public string PlateNo { get; set; }
        public string Status { get; set; }
        public int Capacity { get; set; }
    }
}
