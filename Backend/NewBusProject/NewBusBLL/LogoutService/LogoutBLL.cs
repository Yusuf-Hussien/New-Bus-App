using NewBusBLL.Hashing_Service.Inter;
using NewBusDAL.DTO_General;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.LogoutService
{
    public class LogoutBLL:IlogoutBLL
    {
        private readonly IUnitOfWork _UOW;
        private readonly IhashingBLL _Hash;
        public LogoutBLL(IUnitOfWork UOW,IhashingBLL Hash)
        {
            _UOW = UOW;
            _Hash = Hash;
        }
        public async Task Logout(DtoLogout Logout)
        {
            var Tokens=await _UOW.RefreshTokens.GetAllAsync();
            foreach (var Token in Tokens)
            {
                if(_Hash.IsPasswordCorrect(Logout.RefreshToken,Token.Token,Token.Salt))
                {
                    Token.IsActive = false;
                    await _UOW.Complete();
                    return;
                }
            }
        }
        public async Task AddRefreshToken(DtoLogout Logout)
        {
            var Salt=_Hash.GenerateSaltString();

            var Tokens = new NewBusDAL.Models.RefreshToken()
            {
                Salt = Salt,
                Token = _Hash.GenerateHashedPassword(Logout.RefreshToken, Salt),
                IsActive = true

            };
        await _UOW.RefreshTokens.AddAsync(Tokens);
          await _UOW.Complete();
                  
        }
        public async Task<NewBusDAL.Models.RefreshToken> GetTokenByRefreshToken(string RefresToken)
        {
            var Tokens = await _UOW.RefreshTokens.GetAllAsync();
            foreach (var Token in Tokens)
            {
                if (_Hash.IsPasswordCorrect(RefresToken, Token.Token, Token.Salt))
                {
                    await _UOW.Complete();
                    return Token;
                }
            }
            return null;
        }
        public async Task<bool> IsRefreshTokenActive(NewBusDAL.Models.RefreshToken refreshtoken)
        {
            return refreshtoken.IsActive;
        }
    }
}
