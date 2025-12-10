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
        public async Task<ActionResult<ApiResponseSucess<int>>> AddBus(Bus dTO)
        {
            await _BusBLL.AddBusAsync(dTO);
           return Ok(new ApiResponseSucess<int>(dTO.Id, "Bus Created Successfuly"));
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponseSucess<IEnumerable<DtoBusRead>>>> GetAllBuses()
        {
            var buses = await _BusBLL.GetAllBusesAsync();
            return Ok(new ApiResponseSucess<IEnumerable<DtoBusRead>> (buses, "Buses Data"));
        }
        [HttpGet("/{id}")]
        public async Task<ActionResult<ApiResponseSucess<DtoBusRead>>> GetBusById([FromRoute] int id)
        {
            var bus = await _BusBLL.GetBusByIdAsync(id);
            return Ok(new ApiResponseSucess<DtoBusRead>(bus, "Bus Data By ID"));
        }
        [HttpGet("GetStatusBus")]
        public async Task<ActionResult<ApiResponseSucess<IEnumerable<DTOStatusBus>>>> GetStatusBusAsync()
        {
            var buses = await _BusBLL.GetStatusBusAsync();
            return Ok(new ApiResponseSucess<IEnumerable<DTOStatusBus>> (buses, "Buses Status Data"));
        }
        [HttpPut]
        public async Task<ActionResult<ApiResponseSucess<string>>> UpdateBus([FromBody] DtoBusUpdate bus)
        {
            await _BusBLL.UpdateBusAsync(bus);
            return Ok(new ApiResponseSucess<string>("", "Buses Updated Data"));
        }
        [HttpDelete]
        public async Task<ActionResult<ApiResponseSucess<string>>> DeleteBus([FromRoute] int id)
        {
            await _BusBLL.RemoveBusAsync(id);
            return Ok(new ApiResponseSucess<string>("", "Buses Deleted Data"));
        }
    }
}
