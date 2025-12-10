using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Admins.InterFace;
using NewBusBLL.Driver.InterFace;
using NewBusBLL.LogoutService;
using NewBusBLL.Students.InterFace;
using NewBusBLL.Token.IToken;
using NewBusDAL.DTO_General;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IadminBLL _adminBll;
        private readonly IStudentBLL _StudentBLL;
        private readonly IDriverBLL _DriverBLL;
        private readonly IlogoutBLL _RefreshToken;

        public AuthController(IadminBLL adminBll, IStudentBLL studentBLL, IDriverBLL driverBLL,IlogoutBLL token)
        {
            _adminBll = adminBll;
            _StudentBLL = studentBLL;
            _DriverBLL = driverBLL;
            _RefreshToken = token;
        }
        [HttpPost("LoginAdmin")]
        public async Task<ActionResult<ApiResponseSucess<DTOReturnLogin>>> LoginAdmin(DTOLogin login)
        {
            var Tokens = await _adminBll.Login(login);
            await _RefreshToken.AddRefreshToken(new DtoLogout() { RefreshToken = Tokens.RefreshToken });
            return Ok(new ApiResponseSucess<DTOReturnLogin>(Tokens, "Tokens"));
        }
        [HttpPost("LoginStudent")]
        public async Task<ActionResult<ApiResponseSucess<DTOReturnLogin>>> LoginStudent(DTOLogin login)
        {
            var Tokens = await _StudentBLL.Login(login);
            await _RefreshToken.AddRefreshToken(new DtoLogout() { RefreshToken = Tokens.RefreshToken });
            return Ok(new ApiResponseSucess<DTOReturnLogin>(Tokens, "Tokens"));
        }
        [HttpPost("LoginDriver")]
        public async Task<ActionResult<ApiResponseSucess<DTOReturnLogin>>> LoginDriver(DTOLogin login)
        {
            var Tokens = await _DriverBLL.Login(login);
            await _RefreshToken.AddRefreshToken(new DtoLogout(){ RefreshToken = Tokens.RefreshToken });
            return Ok(new ApiResponseSucess<DTOReturnLogin>(Tokens, "Tokens"));
        }
        [HttpPost("Logout")]
        public async Task<ActionResult<ApiResponseSucess<string>>> Logout(DtoLogout RefreshToken)
        {
            await _RefreshToken.Logout(RefreshToken);
            return Ok(new ApiResponseSucess<string>("", "Logout Successfuly"));
        }


    }
}
