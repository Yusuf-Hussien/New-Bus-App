using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class DriverConnection
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("Driver")]
        public int DriverId { get; set; }
        public string CoonectionId { get; set; }

        public virtual Driver Driver { get; set; }
    }
}
