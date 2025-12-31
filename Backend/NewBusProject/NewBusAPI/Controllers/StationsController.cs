using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Station.Interface;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Station;

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
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOStationRead>>>> GetAllAdmins()
        {
            var admins = await _StationBLL.GetAllStations();
            return Ok(new ApiResponse<IEnumerable<DTOStationRead>>(admins, "Admins Data"));
        }
        [HttpPost("AddStation")]
        public async Task<ActionResult<ApiResponse<int>>> AddStation(NewBusDAL.Models.Station dTO)
        {
         var id=   await _StationBLL.AddStation(dTO);
            return Ok(new ApiResponse<int>(id, "Station Added Successfuly"));
        }
        [HttpDelete]
        public async Task<ActionResult<ApiResponse<string>>> RemoveStation(int id)
        {
            await _StationBLL.RemoveStation(id);
            return Ok(new ApiResponse<string>("", "Station Removed Successfuly"));
        }

    }
}
