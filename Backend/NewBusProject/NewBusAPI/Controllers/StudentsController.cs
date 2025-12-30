using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Admins.BLL;
using NewBusBLL.Admins.InterFace;
using NewBusBLL.Exceptions;
using NewBusBLL.Students.InterFace;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Driver.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Models;
using NewBusDAL.Students.DTO;
using System.ComponentModel.DataAnnotations;
using System.Numerics;

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
    public class StudentsController
   : ControllerBase
    {
        private readonly IStudentBLL _StudentBLL;
        private readonly IConfiguration _configuration;
        public StudentsController(IStudentBLL StudentBLL, IConfiguration comfig)
        {
            _StudentBLL = StudentBLL;
            _configuration = comfig;
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<DTOStudentRead>>> GetStudentByIdAsync([FromRoute] int id)
        {
            var Student = await _StudentBLL.GetStudentByIdAsync(id);
            return Ok(new ApiResponse<DTOStudentRead>(Student, "Student Data"));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("getbyFirstName/{FirstName}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOStudentRead>>>> GetStudentByFirstName([FromRoute] string FirstName)
        {
            var Students = await _StudentBLL.GetStudentByFirstName(FirstName);
            return Ok(new ApiResponse<IEnumerable<DTOStudentRead>>(Students, "Students Data By FirstName"));
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("getbyLastName/{LastName}")]

        public async Task<ActionResult<ApiResponse<IEnumerable<DTOStudentRead>>>> GetStudentByLastName([FromRoute] string LastName)
        {
            var Students = await _StudentBLL.GetStudentByLastName(LastName);
            return Ok(new ApiResponse<IEnumerable<DTOStudentRead>>(Students, "Students Data By LastName"));
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("getbyPhone/{Phone}")]

        public async Task<ActionResult<ApiResponse<DTOStudentRead>>> GetStudentByPhone([FromRoute] string Phone)
        {
            var Student = await _StudentBLL.GetStudentByPhone(Phone);
            return Ok(new ApiResponse<DTOStudentRead>(Student, "Student Data By Phone"));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetByUsername/{username}")]
        public async Task<ActionResult<ApiResponse<DTOStudentRead>>> GetStudentByUsername([FromRoute] string username)
        {
            var Student = await _StudentBLL.GetStudentByUsernameAsync(username);
            return Ok(new ApiResponse<DTOStudentRead>(Student, "Student Data By Username"));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("ByFaculty/{FacultyID}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOStudentRead>>>> GetAllStudents([FromRoute] int FacultyID)
        {
            var Students = await _StudentBLL.GetStudentsinFacultyID(FacultyID);
            return Ok(new ApiResponse<IEnumerable<DTOStudentRead>>(Students, "Students Data By FacultyID"));
        }
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOStudentRead>>>> GetAllStudents()
        {
            var Students = await _StudentBLL.GetAllStudentsAsync();
            return Ok(new ApiResponse<IEnumerable<DTOStudentRead>>(Students, "Students Data"));
        }

        [AllowAnonymous]
        [HttpPost("SignUp")]
        public async Task<ActionResult<ApiResponse<string>>> AddStudent(DTOStudentCreate dTO)
        {
            await _StudentBLL.AddStudentAsync(dTO);
            return Ok(new ApiResponse<string>("", "Verifiy Your Account Through Your Email"));
        }

        [HttpPut("StudentUpdate")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateStudent(DTOStudentUpdate dTO)
        {
            if (dTO.Id != int.Parse(User.FindFirst("ID")!.Value))
                throw new ForBiddenException("Cannot Update Another Student Data");
            await _StudentBLL.UpdateStudentAsync(dTO);
            return Ok(new ApiResponse<string>("", "Student Updated Successfuly"));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteStudent([FromRoute] int id)
        {
            await _StudentBLL.DeleteStudentAsync(id);
            return Ok(new ApiResponse<string>("", "Student Deleted Successfuly"));
        }

        [Authorize(Roles = "Student")]
        [HttpPost("UpdatePassword")]
        public async Task<ActionResult<ApiResponse<string>>> UpdatePassword(DTOUpdatePassword dtoUpdatePassword)
        {
            await _StudentBLL.UpdatePasswordAsync(dtoUpdatePassword);
            return Ok(new ApiResponse<string>("", "Student Password Updated Successfuly"));
        }

        [AllowAnonymous]
        [HttpGet("VerifyEmail/{Token}")]
        public async Task<ActionResult<ApiResponse<string>>> VerifyEmail([FromRoute] string Token)
        {
            if (!await _StudentBLL.VerifyEmail(Token))
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

            await _StudentBLL.ResetPassword(Email);

            return Redirect(_configuration["PageResetPassword"]!);
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
            await _StudentBLL.ResetPassword(Password);

            return Redirect(_configuration["FrontEndDomainLogin"]!);
        }


    }
}
