using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GeneralController : ControllerBase
    {
        [HttpGet("GetGenderList")]
        public async Task<ActionResult<ApiResponseSucess<IEnumerable<DtoReturnKeyVal>>>> GetGenderList()
        {
            var GenederList = new List<DtoReturnKeyVal>();
            GenederList.Add(new DtoReturnKeyVal(((int)enGender.Male), Convert.ToString(enGender.Male)!));
            GenederList.Add(new DtoReturnKeyVal(((int)enGender.Female), Convert.ToString(enGender.Female)!));
            return Ok(new ApiResponseSucess<IEnumerable<DtoReturnKeyVal>>(GenederList, "Gender List Successfuly"));

        }
        [Authorize (Roles ="Admin,Driver")]
        [HttpGet("GetStatusBus")]
        public async Task<ActionResult<ApiResponseSucess<IEnumerable<DtoReturnKeyVal>>>> GetStatusBus()
        {
            var GenederList = new List<DtoReturnKeyVal>();
            GenederList.Add(new DtoReturnKeyVal(((int)enStatusBus.Active), Convert.ToString(enStatusBus.Active)!));
            GenederList.Add(new DtoReturnKeyVal(((int)enStatusBus.UnderMaintenance), Convert.ToString(enStatusBus.UnderMaintenance)!));
            return Ok(new ApiResponseSucess<IEnumerable<DtoReturnKeyVal>>(GenederList, "Gender List Successfuly"));

        }

        [HttpGet("GetStatusTrip")]
        [Authorize(Roles = "Driver")]
        public async Task<ActionResult<ApiResponseSucess<IEnumerable<DtoReturnKeyVal>>>> GetStatusTrips()
        {
            var StatusTrip = new List<DtoReturnKeyVal>();
            StatusTrip.Add(new DtoReturnKeyVal(((int)enStatusTrip.Completed), Convert.ToString(enStatusTrip.Completed)!));
            StatusTrip.Add(new DtoReturnKeyVal(((int)enStatusTrip.NonComplete), Convert.ToString(enStatusTrip.NonComplete)!));
            return Ok(new ApiResponseSucess<IEnumerable<DtoReturnKeyVal>>(StatusTrip, "Finish Trip Successfuly"));

        }

    }
}
