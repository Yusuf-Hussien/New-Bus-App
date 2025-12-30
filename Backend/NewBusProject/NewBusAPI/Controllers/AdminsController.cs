using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Admins.BLL;
using NewBusBLL.Admins.InterFace;
using NewBusBLL.EmailService;
using NewBusBLL.Hashing_Service.Inter;
using NewBusDAL.Admins.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System.ComponentModel.DataAnnotations;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public class AdminsController : ControllerBase
    {
        private readonly IadminBLL _adminBLL;
        private readonly IConfiguration _configuration;
        public AdminsController(IadminBLL AdminBLL, IConfiguration configuration)
        {
            _adminBLL = AdminBLL;
            _configuration = configuration;
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<DTOAdminRead>>> GetAdminById([FromRoute] int id)
        {
            var admin = await _adminBLL.GetAdminByIdAsync(id);
            return Ok(new ApiResponse<DTOAdminRead>(admin, "Admin Data By ID"));
        }
        [HttpGet("getbyFirstName/{FirstName}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOAdminRead>>>> GetAdminByFirstName([FromRoute] string FirstName)
        {
            var admin = await _adminBLL.GetAdminByFirstName(FirstName);
            return Ok(new ApiResponse<IEnumerable<DTOAdminRead>>(admin, "Admins Data By FirstName"));
        }
        [HttpGet("getbyLastName/{LastName}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOAdminRead>>>> GetAdminByLastName([FromRoute] string LastName)
        {
            var admin = await _adminBLL.GetAdminByLastName(LastName);
            return Ok(new ApiResponse<IEnumerable<DTOAdminRead>>(admin, "Admins Data By LastName"));
        }
        [HttpGet("getbyphone/{Phone}")]
        public async Task<ActionResult<DTOAdminRead>> GetAdminByPhone([FromRoute] string Phone)
        {
            var admin = await _adminBLL.GetAdminByPhone(Phone);
            return Ok(new ApiResponse<DTOAdminRead>(admin, "Admin Data By Phone"));
        }
        [HttpGet("getbyusername/{username}")]
        public async Task<ActionResult<ApiResponse<DTOAdminRead>>> GetAdminByUsername([FromRoute] string username)
        {
            var admin = await _adminBLL.GetAdminByUsernameAsync(username);
            return Ok(new ApiResponse<DTOAdminRead>(admin, "Admin Data By Username"));
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOAdminRead>>>> GetAllAdmins()
        {
            var admins = await _adminBLL.GetAllAdminsAsync();
            return Ok(new ApiResponse<IEnumerable<DTOAdminRead>>(admins, "Admins Data"));
        }
        [HttpPost("signup")]
        public async Task<ActionResult<ApiResponse<string>>> AddAdmin(DTOAdminCreate dTO)
        {
            await _adminBLL.AddAdminAsync(dTO);
            return Ok(new ApiResponse<string>("", "Verifiy Your Account Through Gmail"));
        }
        [HttpPut("adminupdate")]
        public async Task<ActionResult> UpdateAdmin(DTOAdminUpdate dTO)
        {
            await _adminBLL.UpdateAdminAsync(dTO);
            return Ok(new ApiResponse<string>("", "Admins Updated Successfuly"));
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAdmin([FromRoute] int id)
        {
            await _adminBLL.DeleteAdminAsync(id);
            return Ok(new ApiResponse<string>("", "Admins Removed Successfuly"));
        }
        [HttpPost("UpdatePassword")]
        public async Task<ActionResult<ApiResponse<string>>> UpdatePassword(DTOUpdatePassword dtoUpdatePassword)
        {
            await _adminBLL.UpdatePasswordAsync(dtoUpdatePassword);
            return Ok(new ApiResponse<string>("", "Password Updated Successfuly"));
        }


        [HttpGet("VerifyEmail/{Token}")]
        [AllowAnonymous]

        public async Task<ActionResult<ApiResponse<string>>> VerifyEmail([FromRoute] string Token)
        {
            if (!await _adminBLL.VerifyEmail(Token))
            {
                return Redirect(_configuration["FailedVerirfingEmail"]!);
            }

            return Redirect(_configuration["FrontEndDomainLogin"]!);
        }

        [AllowAnonymous]
        [HttpPost("OTPResetPassword")]
        public async Task<ActionResult<ApiResponse<string>>> ResetPassword([FromBody] string Email)
        {
            if (Email == null)
                throw new ValidationException("Password Invalid");

            await _adminBLL.ResetPassword(Email);

            return Redirect(_configuration["PageResetPassword"]!);
        }
        [AllowAnonymous]
        [HttpPost("changePassword")]
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
            await _adminBLL.ResetPassword(Password);

            return Redirect(_configuration["FrontEndDomainLogin"]!);
        }


    }

}