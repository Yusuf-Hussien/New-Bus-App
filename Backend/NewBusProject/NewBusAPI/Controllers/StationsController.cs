using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Station.Interface;
using NewBusDAL.Admins.DTO;

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
    public class StationsController : ControllerBase
    {
        private readonly IstationBLL _StationBLL;
        public StationsController(IstationBLL stationBLL)
        {
            _StationBLL = stationBLL;
        }
        [HttpGet]
        public async Task<ActionResult<ApiResponseSucess<IEnumerable<NewBusDAL.Models.Station>>>> GetAllAdmins()
        {
            var admins = await _StationBLL.GetAllStations();
            return Ok(new ApiResponseSucess<IEnumerable<NewBusDAL.Models.Station>>(admins, "Admins Data"));
        }
        [HttpPost("AddStation")]
        public async Task<ActionResult<ApiResponseSucess<string>>> AddStation(NewBusDAL.Models.Station dTO)
        {
            await _StationBLL.AddStation(dTO);
            return Ok(new ApiResponseSucess<string>("", "Station Added Successfuly"));
        }
        [HttpDelete]
        public async Task<ActionResult<ApiResponseSucess<string>>> RemoveStation(NewBusDAL.Models.Station dTO)
        {
            await _StationBLL.RemoveStation(dTO.Id);
            return Ok(new ApiResponseSucess<string>("", "Station Removed Successfuly"));
        }

    }
}
