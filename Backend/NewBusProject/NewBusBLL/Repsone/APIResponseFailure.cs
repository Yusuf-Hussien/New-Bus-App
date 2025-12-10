using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace NewBusBLL.Repsone
{
    public class APIResponseFailure
    {
        public bool Success { get; set; }
        public List<string> Errors { get; set; }
        public APIResponseFailure(string error)
        {
            Success = false;
            Errors = new List<string> { error };
        }
    }
}
