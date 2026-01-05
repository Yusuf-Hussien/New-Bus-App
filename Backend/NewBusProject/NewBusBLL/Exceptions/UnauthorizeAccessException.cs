using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Exceptions
{
    public class UnauthorizeAccessException:Exception
    {
        public UnauthorizeAccessException(string message) : base(message)
        {
        }
    }
}
