using Microsoft.EntityFrameworkCore;
using NewBusDAL.Admins.InterFaceRepo;
using NewBusDAL.Admins.Repo;
using NewBusDAL.Driver.DriverRepositry;
using NewBusDAL.Driver.InterfaceAdminRepositry;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IBaseRepositry;
using NewBusDAL.Students.InterFaceRepo;
using NewBusDAL.Trip.InterfaceTripRepo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Repositry.Interfaces.IunitOfWork
{
    public interface IUnitOfWork:IDisposable
    {
        public IbaseRepositry<Person>People { get; } 
        public IStudentRepo Students { get; }
        public IbaseRepositry<Faculty> Faculties { get; }
        public IadminRepo Admins { get; }
        public IDriverRepositry Drivers { get; }
        public IbaseRepositry<Models.Bus> Buses { get; }
        public IbaseRepositry<Models.Station> Stations { get; }
        public IbaseRepositry<Models.DriverConnection> DriverConnections { get; }
        public IbaseRepositry<Models.StudentConnection> StudentConnections { get; }
        public IbaseRepositry<Models.GroupConnections> GroupConnections { get;  }
        public IbaseRepositry<Models.Group> Groups { get; }
        public IbaseRepositry<Models.AdminConnections> AdminConnections { get; }
        public IbaseRepositry<Models.Route>Routes { get; }
        public ITripRepsitry Trips { get;  }
        public IbaseRepositry<RefreshToken> RefreshTokens {  get; }
        public IbaseRepositry<NewBusDAL.Models.StationTrip> StationTrips {  get; }
        public IbaseRepositry<NewBusDAL.Models.ResetPasswordStudent> ResetPasswordStudents { get; }
        public IbaseRepositry<NewBusDAL.Models.ResetPasswordAdmin> ResetPasswordAdmins { get; }
        public IbaseRepositry<NewBusDAL.Models.ResetPasswordDriver> ResetPasswordDrivers { get; }



        Task<int> Complete();


    }
}
