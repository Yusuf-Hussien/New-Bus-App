using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class GroupConnections
    {
        public int Id { get; set; }
        [ForeignKey("Group")]
        public int GroupId { get; set; }
        [ForeignKey("Admin")]
        public int? AdminId { get; set; }
        [ForeignKey("Driver")]
        public int? DriverId { get; set; }
        [ForeignKey("Student")]
        public int? StudentId { get; set; }
        public virtual Admin Admin { get; set; }
        public virtual Driver Driver { get; set; }
        public virtual Student Student { get; set; }
        public virtual Group Group { get; set; }

    }
}
