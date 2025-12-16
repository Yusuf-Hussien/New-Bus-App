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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
        public async Task<ActionResult<ApiResponse<DTOReturnLogin>>> LoginAdmin(DTOLogin login)
        {
            var Tokens = await _adminBll.Login(login);
            await _RefreshToken.AddRefreshToken(new DtoLogout() { RefreshToken = Tokens.RefreshToken });
            return Ok(new ApiResponse<DTOReturnLogin>(Tokens, "Tokens"));
        }
        [HttpPost("LoginStudent")]
        public async Task<ActionResult<ApiResponse<DTOReturnLogin>>> LoginStudent(DTOLogin login)
        {
            var Tokens = await _StudentBLL.Login(login);
            await _RefreshToken.AddRefreshToken(new DtoLogout() { RefreshToken = Tokens.RefreshToken });
            return Ok(new ApiResponse<DTOReturnLogin>(Tokens, "Tokens"));
        }
        [HttpPost("LoginDriver")]
        public async Task<ActionResult<ApiResponse<DTOReturnLogin>>> LoginDriver(DTOLogin login)
        {
            var Tokens = await _DriverBLL.Login(login);
            await _RefreshToken.AddRefreshToken(new DtoLogout(){ RefreshToken = Tokens.RefreshToken });
            return Ok(new ApiResponse<DTOReturnLogin>(Tokens, "Tokens"));
        }
        [HttpPost("Logout")]
        public async Task<ActionResult<ApiResponse<string>>> Logout(DtoLogout RefreshToken)
        {
            await _RefreshToken.Logout(RefreshToken);
            return Ok(new ApiResponse<string>("", "Logout Successfuly"));
        }


    }
}
