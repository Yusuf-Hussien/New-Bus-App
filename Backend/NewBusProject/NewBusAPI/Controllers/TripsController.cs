using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Admins.InterFace;
using NewBusBLL.Trip;
using NewBusDAL.Admins.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Enums;
using NewBusDAL.Trip.DTO;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [Authorize]
    public class TripsController : ControllerBase
    {
        private readonly ITripBLL _TripBLL;
    public TripsController(ITripBLL TripBLL)
    {
        _TripBLL = TripBLL;
    }
        [Authorize(Roles = "Admin")]

        [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DtoTripRead>>> GetTripByID([FromRoute] int id)
    {
        var Trip = await _TripBLL.GetTripByID(id);
        return Ok(new ApiResponse<DtoTripRead>(Trip, "Trip Data By ID"));
    }
  
    [HttpGet]
        [Authorize(Roles = "Admin")]

        public async Task<ActionResult<ApiResponse<IEnumerable<DtoTripRead>>>> GetAllTrips()
    {
        var Trips = await _TripBLL.GetAllTrips();
        return Ok(new ApiResponse<IEnumerable<DtoTripRead>>(Trips, "Admins Data"));
    }

        [HttpGet("GetAllTripsCountToday")]
        [Authorize(Roles = "Admin")]

        public async Task<ActionResult<ApiResponse<int>>> GetAllTripsCountToday()
        {
            var Trips = await _TripBLL.GetAllTripsCountToday();
            return Ok(new ApiResponse<int>(Trips, "Admins Data"));
        }

        [HttpPost("StartTrip")]
        [Authorize(Roles ="Driver")]

        public async Task<ActionResult<ApiResponse<int>>> StartTrip(DtoTripCreate dTO)
    {
            var DriverID = User?.FindFirst("ID")?.Value;
            if (DriverID == null)
                throw new ValidationException("Happend Error");
            dTO.CreatedByDriverId = Convert.ToInt32(DriverID);

            var TripId =await _TripBLL.AddTrip(dTO);
        return Ok(new ApiResponse<int>(TripId, "Trip Created Successfuly"));
    }
        [Authorize(Roles = "Driver")]

        [HttpPut("DriverUpdateStatusTrip")]
    public async Task<ActionResult<ApiResponse<string>>> UpdateStatusTrip(DtoTripUpdateStatus dTO)
    {
            var DriverID = User?.FindFirst("ID")?.Value;
            if (DriverID == null)
                throw new ValidationException("Happend Error");

            dTO.CreatedByDriverID = Convert.ToInt32(DriverID);
            await _TripBLL.UpdateStatusTrip(dTO);

        return Ok(new ApiResponse<string>("", "Trip Update Status Updated Successfuly"));
    }

        [HttpPut("{id}")]
        [Authorize(Roles = "Driver")]
        public async Task<ActionResult<ApiResponse<string>>> CancelTrip([FromRoute] int id)
    {
        await _TripBLL.CancelTrip(id);
        return Ok(new ApiResponse<string>("", "Cancel Trip Successfuly"));
    }
        [HttpPut("FinishTrip/{id}")]
        [Authorize(Roles = "Driver")]

        public async Task<ActionResult<ApiResponse<string>>> FinishTrip([FromRoute] int id)
        {
            await _TripBLL.FinishTrip(id);
            return Ok(new ApiResponse<string>("", "Finish Trip Successfuly"));
        }

     


    }
}
