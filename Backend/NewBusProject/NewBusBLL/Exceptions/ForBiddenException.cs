using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Exceptions
{
    public class ForBiddenException:Exception
    {
        public ForBiddenException(string message) : base(message)
        {
        }
    }
}
