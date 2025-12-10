using NewBusDAL.Admins.DTO;
using NewBusDAL.DTO_General;
using NewBusDAL.Students.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Students.InterFace
{
    public interface IStudentBLL
    {
        public Task<IEnumerable<DTOStudentRead>> GetAllStudentsAsync();
        public Task<DTOStudentRead> GetStudentByIdAsync(int id);
        public Task<IEnumerable<DTOStudentRead>> GetStudentByFirstName(string FirstName);
        public Task<IEnumerable<DTOStudentRead>> GetStudentByLastName(string LastName);
        public Task<IEnumerable<DTOStudentRead>> GetStudentsinFacultyID(int FacultyID);
        public  Task UpdatePasswordAsync(DTOUpdatePassword dtoUpdatePassword);
        public Task<DTOStudentRead> GetStudentByPhone(string Phone);
        public Task<DTOStudentRead> GetStudentByUsernameAsync(string username);
        public Task AddStudentAsync(DTOStudentCreate dtoStudentCreate);
        public Task UpdateStudentAsync(DTOStudentUpdate dtoStudentUpdate);
        public Task DeleteStudentAsync(int id);
        public Task ResetPassword(string Email);
        public Task ResetPassword(DtoPassword dtoPassword);


        public Task<DTOReturnLogin> Login(DTOLogin DtoStudentlogin);
        public Task UpdateLiveLocation(DtoUpdateLocation liveLication);
        public Task<bool> VerifyEmail(string Token);



    }
}
