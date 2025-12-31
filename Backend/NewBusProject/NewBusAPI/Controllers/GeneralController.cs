using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.AdminConnection;
using NewBusBLL.DriverConnection;
using NewBusBLL.StudentConnection;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GeneralController : ControllerBase
    {
        private readonly IStudentConnection _studentConnection;
        private readonly IDriverConnection _driverConnection;
        private readonly IAdminConnection _adminConnection;
        public GeneralController(IStudentConnection studentConnection, IDriverConnection driverConnection, IAdminConnection adminConnection)
        {
            _studentConnection = studentConnection;
            _driverConnection = driverConnection;
            _adminConnection = adminConnection;
        }

        [HttpGet("GetGenderList")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DtoReturnKeyVal>>>> GetGenderList()
        {
            var GenederList = new List<DtoReturnKeyVal>();
            GenederList.Add(new DtoReturnKeyVal(((int)enGender.Male), Convert.ToString(enGender.Male)!));
            GenederList.Add(new DtoReturnKeyVal(((int)enGender.Female), Convert.ToString(enGender.Female)!));
            return Ok(new ApiResponse<IEnumerable<DtoReturnKeyVal>>(GenederList, "Gender List Successfuly"));

        }
        [Authorize(Roles = "Admin,Driver")]
        [HttpGet("GetStatusBus")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DtoReturnKeyVal>>>> GetStatusBus()
        {
            var GenederList = new List<DtoReturnKeyVal>();
            GenederList.Add(new DtoReturnKeyVal(((int)enStatusBus.Active), Convert.ToString(enStatusBus.Active)!));
            GenederList.Add(new DtoReturnKeyVal(((int)enStatusBus.UnderMaintenance), Convert.ToString(enStatusBus.UnderMaintenance)!));
            return Ok(new ApiResponse<IEnumerable<DtoReturnKeyVal>>(GenederList, "Gender List Successfuly"));

        }

        [HttpGet("GetStatusTrip")]
        [Authorize(Roles = "Driver")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DtoReturnKeyVal>>>> GetStatusTrips()
        {
            var StatusTrip = new List<DtoReturnKeyVal>();
            StatusTrip.Add(new DtoReturnKeyVal(((int)enStatusTrip.Completed), Convert.ToString(enStatusTrip.Completed)!));
            StatusTrip.Add(new DtoReturnKeyVal(((int)enStatusTrip.NonComplete), Convert.ToString(enStatusTrip.NonComplete)!));
            return Ok(new ApiResponse<IEnumerable<DtoReturnKeyVal>>(StatusTrip, "Finish Trip Successfuly"));

        }

        [HttpGet("getdriveractive")]
        public async Task<ActionResult<ApiResponse<int>>> GetDriverActive()
        {
            int DriverActive = await _driverConnection.GetAllDriverActive();
            return Ok(new ApiResponse<int>(DriverActive, "Drivers Active Number"));

        }

        [HttpGet("getstudentactive")]
        public async Task<ActionResult<ApiResponse<int>>> getStudentActive()
        {
            int StudentActive = await _studentConnection.GetAllStudentConnection();
            return Ok(new ApiResponse<int>(StudentActive, "Students Active Number"));

        }


    }
}
