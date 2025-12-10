using NewBusDAL.DTO_General;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.LogoutService
{
    public interface IlogoutBLL
    {
        public Task Logout(DtoLogout Logout);
        public Task AddRefreshToken(DtoLogout Logout);
        public Task<bool> IsRefreshTokenActive(NewBusDAL.Models.RefreshToken refreshtoken);
        public Task<NewBusDAL.Models.RefreshToken> GetTokenByRefreshToken(string RefresToken);



    }
}
