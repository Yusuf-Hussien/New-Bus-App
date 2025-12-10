
using AutoMapper;
using NewBusDAL.Admins.InterFaceRepo;
using NewBusDAL.Admins.Repo;
using NewBusDAL.Driver.DriverRepositry;
using NewBusDAL.Driver.InterfaceAdminRepositry;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IBaseRepositry;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Repositry.RepoClassess.BaseRepositry;
using NewBusDAL.Students.InterFaceRepo;
using NewBusDAL.Students.Repo;
using NewBusDAL.Trip.InterfaceTripRepo;
using NewBusDAL.Trip.TripRepo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Repositry.RepoClassess.UnitOfWork
{
    public class UnitOfWork:IUnitOfWork
    {
        private readonly NewBusContext _context;
        public IbaseRepositry<NewBusDAL.Models.Station> Stations { get; private set; }
        public IbaseRepositry<Person> People { get; private set; }
        public IStudentRepo Students { get; private set; }
        public IbaseRepositry<Faculty> Faculties { get; private set; }
        public IadminRepo Admins { get; private set; }
        public IDriverRepositry Drivers { get; private set; }
        public IbaseRepositry<NewBusDAL.Models.Bus> Buses { get; private set; }
        public IbaseRepositry<Models.Group> Groups { get; private set; }
        public IbaseRepositry<Models.DriverConnection> DriverConnections { get; private set; }
        public IbaseRepositry<Models.StudentConnection> StudentConnections { get; private set; }
        public IbaseRepositry<Models.GroupConnections> GroupConnections { get; private set; }
        public IbaseRepositry<Models.AdminConnections> AdminConnections { get; private set; }
        public IMapper Mapper { get; private set; }
        public IbaseRepositry<Models.Route> Routes {  get; private set; }
        public ITripRepsitry Trips { get; private set; }
        public IbaseRepositry<RefreshToken> RefreshTokens { get; private set; }
        public IbaseRepositry<NewBusDAL.Models.StationTrip> StationTrips {  get; private set; }
        public IbaseRepositry<NewBusDAL.Models.ResetPasswordStudent> ResetPasswordStudents { get; private set; }
        public IbaseRepositry<NewBusDAL.Models.ResetPasswordDriver> ResetPasswordDrivers { get; private set; }
        public IbaseRepositry<NewBusDAL.Models.ResetPasswordAdmin> ResetPasswordAdmins { get; private set; }

        public UnitOfWork(NewBusContext context, IMapper mapper)
        {
            _context = context;
            ResetPasswordAdmins = new BaseRepsitry<NewBusDAL.Models.ResetPasswordAdmin>(context);
            ResetPasswordDrivers = new BaseRepsitry<NewBusDAL.Models.ResetPasswordDriver>(context);

            ResetPasswordStudents = new BaseRepsitry<NewBusDAL.Models.ResetPasswordStudent>(context);
            StationTrips = new BaseRepsitry<NewBusDAL.Models.StationTrip>(context);
            Admins = new AdminRepo(context,mapper);
            Students = new StudentRepo(context,mapper);
            Faculties = new BaseRepositry.BaseRepsitry<Faculty>(context);
            People = new BaseRepositry.BaseRepsitry<Person>(context);
            Drivers = new DriverRepositry(context, mapper);
            Buses = new BaseRepositry.BaseRepsitry<NewBusDAL.Models.Bus>(context);
            Groups = new BaseRepositry.BaseRepsitry<Models.Group>(context);
            DriverConnections = new BaseRepositry.BaseRepsitry<Models.DriverConnection>(context);
            StudentConnections = new BaseRepositry.BaseRepsitry<Models.StudentConnection>(context);
            GroupConnections = new BaseRepositry.BaseRepsitry<Models.GroupConnections>(context);
            AdminConnections = new BaseRepositry.BaseRepsitry<Models.AdminConnections>(context);
            Stations = new BaseRepositry.BaseRepsitry<Models.Station>(context);
            Routes = new BaseRepositry.BaseRepsitry<Models.Route>(context);
            Trips= new TripRepo(context,mapper);
            RefreshTokens= new BaseRepsitry<RefreshToken>(context);
        }

        public async Task<int> Complete()
        {
            return await _context.SaveChangesAsync();
        }
        public void Dispose()
        {
            _context.Dispose();
        }

    }
}
