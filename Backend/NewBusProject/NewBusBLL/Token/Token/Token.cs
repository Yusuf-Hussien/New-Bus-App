using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using Microsoft.IdentityModel.Tokens;
using NewBusBLL.Token.IToken;
using NewBusDAL.Constant;
using NewBusDAL.DTO_General;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Repositry.RepoClassess.UnitOfWork;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Token.Token
{
    public class Token : IToken.IToken
    {
        private readonly IUnitOfWork _UOW;
        private readonly IConfiguration _Config;
        public Token(IUnitOfWork UOW,IConfiguration configuration)
        {
            _UOW = UOW;
            _Config = configuration;
        }
     
        public async Task<DTOReturnLogin> GenerateToken(DTOLogin Login, string Role)
        {
            if (Role == Roles.Admin)
            {
                var admin = await _UOW.Admins.getallIncludeBy(a => a.Username == Login.UserName, new[] { "Person" }).FirstOrDefaultAsync();
          return new DTOReturnLogin()
                {
                    AccessToken = await GenerateAccessTokenForAdmin(admin),
                    RefreshToken = await GenerateRefreshTokenForAdmin(admin)
                };
            }
            else if (Role == Roles.Driver)
            {
                var driver = await _UOW.Drivers.getallIncludeBy(a => a.Username == Login.UserName, new[] { "Person" }).FirstOrDefaultAsync();
           return new DTOReturnLogin()
                {
                    AccessToken = await GenerateAccessTokenForDriver(driver),
                    RefreshToken = await GenerateRefreshTokenForDriver(driver)
                };
            }
            else
            {
                var student = await _UOW.Students.getallIncludeBy(a => a.Username == Login.UserName, new[] { "Person" }).FirstOrDefaultAsync();
           return new DTOReturnLogin()
                {
                    AccessToken = await GenerateAccessTokenForStudent(student),
                    RefreshToken = await GenerateRefreshTokenForStudent(student)
                };
            }
            
        }
        private async Task<string> GenerateAccessTokenForAdmin(Admin admin)
        {
            var claimss = new List<Claim>();
            claimss.Add(new Claim("ID", Convert.ToString(admin.Id)));
            claimss.Add(new Claim(ClaimTypes.Role, Roles.Admin));
            claimss.Add(new Claim(ClaimTypes.Email, Convert.ToString(admin.Person.Email)));
            claimss.Add(new Claim(ClaimTypes.Name, Convert.ToString(admin.Person.FirstName + " " + admin.Person.SecondName)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_Config["JWT:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var Token = new JwtSecurityToken(
                claims: claimss,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds

                );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }
        private async Task<string> GenerateAccessTokenForStudent(Student Student)
        {
            var claimss = new List<Claim>();
            claimss.Add(new Claim("ID", Convert.ToString(Student.Id)));
            claimss.Add(new Claim(ClaimTypes.Role, Roles.Student));
            claimss.Add(new Claim(ClaimTypes.Email, Convert.ToString(Student.Person.Email)));
            claimss.Add(new Claim(ClaimTypes.Name, Convert.ToString(Student.Person.FirstName + " " + Student.Person.SecondName)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_Config["JWT:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var Token = new JwtSecurityToken(
                claims: claimss,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds

                );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }
        private async Task<string> GenerateAccessTokenForDriver(NewBusDAL.Models.Driver Driver)
        {
            var claimss = new List<Claim>();
            claimss.Add(new Claim("ID", Convert.ToString(Driver.Id)));
            claimss.Add(new Claim(ClaimTypes.Role, Roles.Driver));
            claimss.Add(new Claim(ClaimTypes.Email, Convert.ToString(Driver.Person.Email)));
            claimss.Add(new Claim(ClaimTypes.Name, Convert.ToString(Driver.Person.FirstName + " " + Driver.Person.SecondName)));
         
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_Config["JWT:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var Token = new JwtSecurityToken(
                claims: claimss,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds

                );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }
        private async Task<string> GenerateRefreshTokenForAdmin(Admin admin)
        {
            var claimss = new List<Claim>();
            claimss.Add(new Claim("ID", Convert.ToString(admin.Id)));
            claimss.Add(new Claim(ClaimTypes.Role, Roles.Admin));
            claimss.Add(new Claim(ClaimTypes.Email, Convert.ToString(admin.Person.Email)));
            claimss.Add(new Claim(ClaimTypes.Name, Convert.ToString(admin.Person.FirstName + " " + admin.Person.SecondName)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_Config["JWT:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var Token = new JwtSecurityToken(
                claims: claimss,
                expires: DateTime.Now.AddDays(10),
                signingCredentials: creds

                );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }
        private async Task<string> GenerateRefreshTokenForStudent(Student Student)
        {
            var claimss = new List<Claim>();
            claimss.Add(new Claim("ID", Convert.ToString(Student.Id)));
            claimss.Add(new Claim(ClaimTypes.Role, Roles.Student));
            claimss.Add(new Claim(ClaimTypes.Email, Convert.ToString(Student.Person.Email)));
            claimss.Add(new Claim(ClaimTypes.Name, Convert.ToString(Student.Person.FirstName + " " + Student.Person.SecondName)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_Config["JWT:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var Token = new JwtSecurityToken(
                claims: claimss,
                expires: DateTime.Now.AddDays(10),
                signingCredentials: creds

                );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }
        private async Task<string> GenerateRefreshTokenForDriver(NewBusDAL.Models.Driver Driver)
        {
            var claimss = new List<Claim>();
            claimss.Add(new Claim("ID", Convert.ToString(Driver.Id)));
            claimss.Add(new Claim(ClaimTypes.Role, Roles.Driver));
            claimss.Add(new Claim(ClaimTypes.Email, Convert.ToString(Driver.Person.Email)));
            claimss.Add(new Claim(ClaimTypes.Name, Convert.ToString(Driver.Person.FirstName + " " + Driver.Person.SecondName)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_Config["JWT:SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var Token = new JwtSecurityToken(
                claims: claimss,
                expires: DateTime.Now.AddDays(10),
                signingCredentials: creds

                );
            return new JwtSecurityTokenHandler().WriteToken(Token);
        }
    }
}
