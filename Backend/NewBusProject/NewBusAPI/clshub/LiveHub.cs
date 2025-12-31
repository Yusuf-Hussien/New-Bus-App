using Azure.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NewBusBLL.AdminConnection;
using NewBusBLL.Driver.InterFace;
using NewBusBLL.DriverConnection;
using NewBusBLL.Station.Interface;
using NewBusBLL.StationTrips;
using NewBusBLL.StudentConnection;
using NewBusBLL.Students.InterFace;
using NewBusDAL.DTO_General;
using NewBusDAL.Models;
using NewBusDAL.StationTrip;
using System.Collections.Concurrent;

namespace NewBusAPI.HUB
{
    public class LiveHub : Hub
    {

        private readonly IStudentConnection _StudentConnection;
        private readonly IAdminConnection _AdminConnection;
        private readonly IDriverConnection _DriverConnection;
        private readonly IDriverBLL _driverbll;
        private readonly IStudentBLL _studentbll;
        private readonly IstationBLL _StationBLL;
        private readonly NewBusBLL.StationTrips.IstationTrip _StataionTripBLL;
        private static ConcurrentDictionary<string, DateTime> LastPing = new();

        public LiveHub(
                IStudentBLL studentbll,
                IDriverBLL driverbll,
                IStudentConnection studentConnection,
                IAdminConnection adminConnection,
                IDriverConnection driverConnection, IstationBLL istation, IstationTrip stationtrip)
        {
            _StudentConnection = studentConnection;
            _AdminConnection = adminConnection;
            _DriverConnection = driverConnection;
            _driverbll = driverbll;
            _StationBLL = istation;
            _studentbll = studentbll;
            _StataionTripBLL = stationtrip;
        }

        public Task Ping()
        {
            LastPing[Context.ConnectionId] = DateTime.Now;
            return Task.CompletedTask;
        }

        public override async Task OnConnectedAsync()
        {
            var isAuth = Context?.User?.Identity?.IsAuthenticated ?? false;

            if (isAuth)
            {
                var id = Context.User.FindFirst("ID")!.Value;

                if (Context.User.IsInRole("Admin"))
                {
                    await _AdminConnection.AddToConnectionAdminTable(Context.ConnectionId, Convert.ToInt32(id));
                }

                if (Context.User.IsInRole("Student"))
                {
                    await _StudentConnection.AddToConnectionStudentTable(Context.ConnectionId, Convert.ToInt32(id));
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Students");
                }

                if (Context.User.IsInRole("Driver"))
                {
                    await _DriverConnection.AddToConnectionDriverTable(Context.ConnectionId, Convert.ToInt32(id));
                    await Groups.AddToGroupAsync(Context.ConnectionId, "Drivers");
                }
            }

            await base.OnConnectedAsync();
        }

        public static async Task CheckInactiveConnections(LiveHub hub)
        {
            var now = DateTime.Now;
            foreach (var kvp in LastPing.ToList())
            {
                var connId = kvp.Key;
                var last = kvp.Value;

                if ((now - last).TotalSeconds > 6) // غير نشط لأكثر من 30 ثانية
                {

                    await hub._StudentConnection.RemoveFromConnectionStudentTable(connId);
                    await hub._DriverConnection.RemoveFromConnectionDriverTable(connId);
                    await hub.Groups.RemoveFromGroupAsync(connId, "Students");
                    await hub.Groups.RemoveFromGroupAsync(connId, "Drivers");

                    LastPing.TryRemove(connId, out _);
                }
            }
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var conn = Context.ConnectionId;

            // Remove only if exists (your repo should handle no-row cases)
            await _StudentConnection.RemoveFromConnectionStudentTable(conn);
            await _DriverConnection.RemoveFromConnectionDriverTable(conn);

            // Remove from groups (safe even if not inside the group)
            await Groups.RemoveFromGroupAsync(conn, "Students");
            await Groups.RemoveFromGroupAsync(conn, "Drivers");

            await base.OnDisconnectedAsync(exception);
        }

        // 
        public async Task stoplocationforistudent()
        {

            var isAuth = Context?.User?.Identity?.IsAuthenticated ?? false;
            if (!isAuth) return;

            var id = int.Parse(Context?.User?.FindFirst("ID")?.Value!);



            await Clients.Group("Drivers").SendAsync("stoplocationfromstudent", id);
        }
        public async Task stoplocationforidriver()
        {


            var isAuth = Context?.User?.Identity?.IsAuthenticated ?? false;
            if (!isAuth) return;

            var id = int.Parse(Context?.User?.FindFirst("ID")?.Value!);




            await Clients.Group("Students").SendAsync("stoplocationfromdriver", id);
        }



        // Send Student Location → to Drivers group
        public async Task sharelivelocationforstudent(string latitude, string longitude)
        {
            var isAuth = Context?.User?.Identity?.IsAuthenticated ?? false;
            if (!isAuth) return;

            var id = int.Parse(Context?.User?.FindFirst("ID")?.Value!);

            var student = await _studentbll.GetStudentByIdAsync(id);

            await _studentbll.UpdateLiveLocation(new DtoUpdateLocation
            {
                Id = id,
                Lat = Convert.ToDouble(latitude),
                Lang = Convert.ToDouble(longitude)
            });

            await Clients.Group("Drivers").SendAsync("NewLocationFromStudent", latitude, longitude, student.FirstName, student.FacultyName, student.LevelOfStudy, id);
        }


        // Send Driver Location → to Students group

        public async Task StartTripForDriver(string latitude, string longitude, int TripId)
        {
            var isAuth = Context?.User?.Identity?.IsAuthenticated ?? false;
            if (!isAuth) return;

            var DriverId = int.Parse(Context?.User?.FindFirst("ID")?.Value!);
            var Driver = await _driverbll.GetDriverByID(DriverId);
            await _driverbll.UpdateLiveLocation(new DtoUpdateLocation
            {
                Id = DriverId,
                Lat = Convert.ToDouble(latitude),
                Lang = Convert.ToDouble(longitude)
            });

            // check Station
            var Stations = _StationBLL.GetAllStationsForHub();
            if (Stations != null)
            {
                foreach (var Station in await Stations)
                {
                    // Calculate Distance between two point
                    var distance = Utilities.CalculateDistance(Station.Latititude, Station.Longitude,Convert.ToDouble( latitude), Convert.ToDouble(longitude));


                    // Check inside Redius
                    if (Utilities.IsEnterArea(distance, Station.Radius))
                    {
                        //handle is send before 
                        var StationTrip = new DtoStationTrip()
                        {
                            StationId = Station.Id,
                            TripId = TripId,
                        };


                        var stationTrip = await _StataionTripBLL.GetStationTrip(Station.Id, TripId);
                        if (stationTrip == null)
                        {
                            await _StataionTripBLL.AddStationTrip(StationTrip);
                            await Clients.Group("Students").SendAsync("ArriveNewStation", Driver.FirstName + " " + Driver.LastName, Driver.PlateNoBus, Station.Name);
                            break;
                        }

                        if (!stationTrip.IsVisited)
                        {

                            string StationName = Station.Name;

                            await Clients.Group("Students").SendAsync("ArriveNewStation", Driver.FirstName + " " + Driver.LastName, Driver.PlateNoBus, StationName);
                            break;
                        }

                        //add for db and if exist no add



                    }

                }
            }


            await Clients.Group("Students").SendAsync("NewLocationFromDriver", latitude, longitude, Driver.FirstName + " " + Driver.LastName, Driver.PlateNoBus, DriverId);
        }
    }


}

