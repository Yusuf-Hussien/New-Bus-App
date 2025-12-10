using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NewBusAPI.Repsone;
using NewBusBLL.Faculty.Interface;
using NewBusDAL.Models;

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
    public class FacultiesController : ControllerBase
    {
        // Controller methods will go here
        private readonly IFacultyBLL _FacultyBLL;
        public FacultiesController(IFacultyBLL facultyBLL)
        {
            _FacultyBLL = facultyBLL;
        }
        [HttpGet]
        public async Task<ActionResult<ApiResponseSucess<IEnumerable<Faculty>>>> GetAllFaculties()
        {
            var faculties = await _FacultyBLL.GetAllFacultiesAsync();
            return Ok(new ApiResponseSucess<IEnumerable<Faculty>>(faculties,"Faculties Data Successfuly"));
        }
        [HttpGet("{id}",Name = "GetFacultyByIdAsync")]
        public async Task<ActionResult<ApiResponseSucess<Faculty>>> GetFacultyById([FromRoute] int id)
        {
            var faculty = await _FacultyBLL.GetFacultyByIdAsync(id);
            return Ok(new ApiResponseSucess<Faculty>(faculty, "Faculty Data Successfuly"));
        }
        [HttpPost("FacultyCreate")]
        public async Task<ActionResult<ApiResponseSucess<int>>> AddFaculty(Faculty dTO)
        {
        await _FacultyBLL.AddFacultyAsync(dTO);
            return Ok(new ApiResponseSucess<int>(dTO.Id, "Faculty Created Successfuly"));
        }
        [HttpPut("FacultyUpdate/{id}")]
        public async Task<ActionResult<ApiResponseSucess<string>>> UpdateFaculty(Faculty dTO,int id)
        {
            await _FacultyBLL.UpdateFacultyAsync(dTO,id);
            return Ok(new ApiResponseSucess<string>("","Faculty Updated Successfuly"));
        }
    }
}
