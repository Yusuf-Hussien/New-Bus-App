using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.RefreshToken
{
    public class RefreshToken: IRefreshToken
    {
        private readonly IUnitOfWork _UOW;
        public RefreshToken(IUnitOfWork UOW)
        {
            _UOW = UOW;
        }
        public async Task RemoveRefreshTokenLogout()
        {
            var refreshTokensDrivers = await _UOW.RefreshTokens.FindAsync(rt => rt.IsActive==false);
            if (refreshTokensDrivers.Count() <= 0)
                return;
            foreach (var token in refreshTokensDrivers)
            {
              await  _UOW.RefreshTokens.RemoveAsync(token.Id);
            }
      
            await _UOW.Complete();
        }

      public async  Task RemoveRefreshTokenExpired()
        {
            var refreshTokensDrivers = await _UOW.RefreshTokens.FindAsync(rt => rt.ExpireAt <DateTime.Now);
            if (refreshTokensDrivers.Count() <= 0)
                return;
            foreach (var token in refreshTokensDrivers)
            {
                await _UOW.RefreshTokens.RemoveAsync(token.Id);
            }

            await _UOW.Complete();
        }

        
    }
}
