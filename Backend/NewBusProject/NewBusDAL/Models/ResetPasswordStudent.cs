using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Models
{
    public class ResetPasswordStudent
    {
        public int Id { get; set; }
        public string? OTP{ get; set; }
        [ForeignKey("Student")]
        public int StudentId { get; set; }
        public bool IsVerified { get; set; } = false;
        public DateTime ExpireAt { get; set; }

        public virtual Student Student { get; set; }
    }
}
