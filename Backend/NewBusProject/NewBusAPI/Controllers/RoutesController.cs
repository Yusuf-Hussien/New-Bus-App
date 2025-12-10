using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Route.InteFace;

namespace NewBusAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoutesController : ControllerBase
    {
        private readonly IRoute _router;
        public RoutesController(IRoute router)
        {
            _router = router;
        }

        [HttpPost("CreateRoute")]
        public async Task<ActionResult<ApiResponseSucess<string>>> AddRoute(NewBusDAL.Models.Route dTO)
        {
            await _router.AddRoute(dTO);
            return Ok(new ApiResponseSucess<string>("", "Route Created Successfuly"));
        }
        [HttpDelete]
        public async Task<ActionResult<ApiResponseSucess<string>>> RemoveRouteAsync(NewBusDAL.Models.Route dTO)
        {
            await _router.RemoveRouteAsync(dTO.Id);
            return Ok(new ApiResponseSucess<string>("", "Route Removed Successfuly"));
        }
    }
}
