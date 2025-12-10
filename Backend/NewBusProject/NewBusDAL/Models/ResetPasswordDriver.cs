using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class ResetPasswordDriver
    {
        public int Id { get; set; }
        public string? OTP { get; set; }
        [ForeignKey("Driver")]
        public int DriverId { get; set; }
        public bool IsActive { get; set; } = true;
        public virtual Driver Driver { get; set; }
    }
}
