using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Route.InteFace;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoutesController : ControllerBase
    {
        private readonly IRoute _router;
        public RoutesController(IRoute router)
        {
            _router = router;
        }
        [Authorize(Roles = "Admin")]

        [HttpPost("CreateRoute")]
        public async Task<ActionResult<ApiResponse<string>>> AddRoute(NewBusDAL.Models.Route dTO)
        {
            await _router.AddRoute(dTO);
            return Ok(new ApiResponse<string>("", "Route Created Successfuly"));
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete]

        public async Task<ActionResult<ApiResponse<string>>> RemoveRouteAsync(int ID)
        {
            await _router.RemoveRouteAsync(ID);
            return Ok(new ApiResponse<string>("", "Route Removed Successfuly"));
        }
        [Authorize(Roles = "Admin,Driver")]
        [HttpGet("GetAllRoutes")]
        public async Task<ActionResult<ApiResponse<IEnumerable<NewBusDAL.Route.dtorouteread>>>> GetAllRoutesAsync()
        {
            var routes = await _router.GetAllRoutesAsync();
            return Ok(new ApiResponse<IEnumerable<NewBusDAL.Route.dtorouteread>>(routes, "All Routes Data"));
        }
    }
}
