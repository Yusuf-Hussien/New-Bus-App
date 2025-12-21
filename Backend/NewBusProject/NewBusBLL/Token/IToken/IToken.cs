using NewBusDAL.DTO_General;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Token.IToken
{
    public interface IToken
    {
        public Task<DTOReturnLogin>GenerateToken(DTOLogin Login,string Role);
    }
}
