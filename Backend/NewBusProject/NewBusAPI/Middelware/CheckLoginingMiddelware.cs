using NewBusBLL.Exceptions;
using NewBusBLL.Hashing_Service.Inter;
using NewBusBLL.LogoutService;
using NewBusBLL.Repsone;
using NewBusBLL.Token.IToken;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;

namespace NewBusAPI.Middelware
{
    public class CheckLoginingMiddelware

    {
        private readonly RequestDelegate _next;

        public CheckLoginingMiddelware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var _Logout = context.RequestServices.GetRequiredService<IlogoutBLL>();

            // check if the token Logout before
            if (context.User.Identity != null && context.User.Identity.IsAuthenticated)
            {
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(' ').Last();

                var refreshtoken = await _Logout.GetTokenByRefreshToken(token);
                if (refreshtoken != null)
                {
                 if(!await _Logout.IsRefreshTokenActive(refreshtoken))
                    {
                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        context.Response.ContentType = "application/json";

                        await context.Response.WriteAsync(JsonSerializer.Serialize(new { Message = "You Loggout By This Token Before" }));
                        return;
                    }
                }
            }

            await _next(context);
        }

       
    }
}
