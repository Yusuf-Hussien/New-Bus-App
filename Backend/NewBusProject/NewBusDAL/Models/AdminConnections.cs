using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class AdminConnections
    {
        [Key]
        public int Id { get; set; }
        [ForeignKey("Admin")]
        public int AdminId { get; set; }
        public string CoonectionId { get; set; }
        public virtual Admin Admin { get; set; }
    }
}
