using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Driver.InterFace;
using NewBusBLL.Exceptions;
using NewBusDAL.Driver.DTO;
using NewBusDAL.DTO_General;
using System.ComponentModel.DataAnnotations;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public class DriversController : ControllerBase
    {
        private readonly IDriverBLL _driverBLL;
        private readonly IConfiguration _Config;
        public DriversController(IDriverBLL driverBLL, IConfiguration config)
        {
            _driverBLL = driverBLL;
            _Config = config;
        }
        [HttpGet("GetCurrentLocation/{id}")]
        public async Task<ActionResult<ApiResponse<DTOCurrentLocation>>> GetCurrentLocation([FromRoute] int id)
        {
            var driver = await _driverBLL.GetCurrentLocation(id);
            return Ok(new ApiResponse<DTOCurrentLocation>(driver, "Driver Data By ID"));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<DTODriverRead>>> GetDriverById([FromRoute] int id)
        {
            var driver = await _driverBLL.GetDriverByID(id);
            return Ok(new ApiResponse<DTODriverRead>(driver, "Driver Data By ID"));
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("getbyFirstName/{FirstName}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTODriverRead>>>> GetDriverByFirstName([FromRoute] string FirstName)
        {
            var driver = await _driverBLL.GetDriverByFirstName(FirstName);
            return Ok(new ApiResponse<IEnumerable<DTODriverRead>>(driver, "Drivers Data By FirstName"));

        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getbyLastName/{LastName}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTODriverRead>>>> GetDriverByLastName([FromRoute] string LastName)
        {
            var driver = await _driverBLL.GetDriverByLastName(LastName);
            return Ok(new ApiResponse<IEnumerable<DTODriverRead>>(driver, "Drivers Data By LastName"));
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("getbyPhone/{Phone}")]
        public async Task<ActionResult<ApiResponse<DTODriverRead>>> GetDriverByPhone([FromRoute] string Phone)
        {
            var driver = await _driverBLL.GetDriverByPhone(Phone);
            return Ok(new ApiResponse<DTODriverRead>(driver, "Driver Data By Phone"));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetByUsername/{username}")]
        public async Task<ActionResult<ApiResponse<DTODriverRead>>> GetDriverByUsername([FromRoute] string username)
        {
            var driver = await _driverBLL.GetDriverByUsername(username);
            return Ok(new ApiResponse<DTODriverRead>(driver, "Driver Data By Username"));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTODriverRead>>>> GetAllDrivers()
        {
            var drivers = await _driverBLL.GetAllDriver();
            return Ok(new ApiResponse<IEnumerable<DTODriverRead>>(drivers, "Drivers Data"));
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteDriverById([FromRoute] int id)
        {
            await _driverBLL.DeleteDriver(id);
            return Ok(new ApiResponse<string>("", "Driver Deleted Successfully"));
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("SignUp")]
        public async Task<ActionResult<ApiResponse<string>>> CreateDriver([FromBody] DTODriverCreate dtoDriverCreate)
        {
            var AdminID=User.FindFirst("ID")?.Value;
            dtoDriverCreate.CreatedByAdminID =Convert.ToInt32(AdminID);
            await _driverBLL.AddDriver(dtoDriverCreate);
            return Ok(new ApiResponse<string>("", "Verifiy Your Account Through Your Email"));
        }

        [Authorize(Roles = "Driver")]
        [HttpPut("Updatedriver")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateDriver([FromBody] DtoDriverUpdate dtoDriverUpdate)
        {
            if (dtoDriverUpdate.ID != int.Parse(User.FindFirst("ID")!.Value))
                throw new ForBiddenException("Cannot Update Another Driver Data");

            await _driverBLL.UpdateDriver(dtoDriverUpdate);
            return Ok(new ApiResponse<string>("", "Driver Updated Successfully"));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateDriverforBus")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateDriverBus([FromBody] DTODriverUpdateBus dtoDriverUpdateBus)
        {
            await _driverBLL.UpdateDriverBus(dtoDriverUpdateBus);
            return Ok(new ApiResponse<string>("", "Driver Bus Updated Successfully"));
        }

        [Authorize(Roles = "Driver")]
        [HttpPut("UpdatePassword")]
        public async Task<ActionResult<ApiResponse<string>>> UpdatePassword(DTOUpdatePassword dtoUpdatePassword)
        {
            if (dtoUpdatePassword.ID != int.Parse(User.FindFirst("ID")!.Value))
                throw new ForBiddenException("Cannot Update Another Driver Password");
            await _driverBLL.UpdatePasswordAsync(dtoUpdatePassword);
            return Ok(new ApiResponse<string>("", "Driver Password Updated Successfuly"));
        }

        [AllowAnonymous]
        [HttpGet("VerifyEmail/{Token}")]
        public async Task<ActionResult<ApiResponse<string>>> VerifyEmail([FromRoute] string Token)
        {
            if (!await _driverBLL.VerifyEmail(Token))
            {
                return Redirect(_Config["FailedVerirfingEmail"]!);
            }

            return Redirect(_Config["FrontEndDomainLogin"]!);
        }
        [AllowAnonymous]
        [HttpGet("OTPResetPassword")]
        public async Task<ActionResult<ApiResponse<string>>> ResetPassword([FromBody] string Email)
        {
            if (Email == null)
                throw new ValidationException("Password Invalid");

            await _driverBLL.ResetPassword(Email);

            return Redirect(_Config["PageResetPassword"]!);
        }
        [AllowAnonymous]
        [HttpPost("ChangePassword")]
        public async Task<ActionResult<ApiResponse<string>>> ChangePassword(DtoPassword Password)
        {
            if (Password.Password == null)
                throw new ValidationException("Password Invalid");
            if (Password.Password.Count() < 8)
                throw new ValidationException("Password Invalid must be at least 8");
            if (Password.OTP == null)
                throw new ValidationException("Cannot Reset Password Error");
            if (Password.OTP.Count() > 6 || Password.OTP.Count() <= 0)
                throw new ValidationException("Error , OTP 6 digit");
            await _driverBLL.ResetPassword(Password);

            return Redirect(_Config["FrontEndDomainLogin"]!);
        }


    }
}
