using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Bus.Interface;
using NewBusDAL.Bus.DTO;
using NewBusDAL.Models;
using System.Collections.Generic;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [Authorize(Roles = "Admin")]

    [ApiController] // that Resposible for handle ModelState
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public class BusesController : ControllerBase
    {
        private readonly IBusBLL _BusBLL;
        public BusesController(IBusBLL BusBLL)
        {
            _BusBLL = BusBLL;
        }
        [HttpPost]
        public async Task<ActionResult<ApiResponse<int>>> AddBus(Bus dTO)
        {
            await _BusBLL.AddBusAsync(dTO);
           return Ok(new ApiResponse<int>(dTO.Id, "Bus Created Successfuly"));
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<DtoBusRead>>>> GetAllBuses()
        {
            var buses = await _BusBLL.GetAllBusesAsync();
            return Ok(new ApiResponse<IEnumerable<DtoBusRead>> (buses, "Buses Data"));
        }
        [HttpGet("/{id}")]
        public async Task<ActionResult<ApiResponse<DtoBusRead>>> GetBusById([FromRoute] int id)
        {
            var bus = await _BusBLL.GetBusByIdAsync(id);
            return Ok(new ApiResponse<DtoBusRead>(bus, "Bus Data By ID"));
        }
        [HttpGet("GetStatusBus")]
        public async Task<ActionResult<ApiResponse<IEnumerable<DTOStatusBus>>>> GetStatusBusAsync()
        {
            var buses = await _BusBLL.GetStatusBusAsync();
            return Ok(new ApiResponse<IEnumerable<DTOStatusBus>> (buses, "Buses Status Data"));
        }
        [HttpPut]
        public async Task<ActionResult<ApiResponse<string>>> UpdateBus([FromBody] DtoBusUpdate bus)
        {
            await _BusBLL.UpdateBusAsync(bus);
            return Ok(new ApiResponse<string>("", "Buses Updated Data"));
        }
        [HttpDelete("/{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteBus([FromRoute] int id)
        {
            await _BusBLL.RemoveBusAsync(id);
            return Ok(new ApiResponse<string>("", "Buses Deleted Data"));
        }
    }
}
