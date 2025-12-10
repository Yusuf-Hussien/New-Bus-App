using Microsoft.AspNetCore.SignalR;
using NewBusBLL.AdminConnection;
using NewBusBLL.Driver.InterFace;
using NewBusBLL.DriverConnection;
using NewBusBLL.Station.Interface;
using NewBusBLL.StudentConnection;
using NewBusBLL.Students.InterFace;
using NewBusDAL.DTO_General;
using NewBusDAL.Models;
using NewBusDAL.StationTrip;

namespace NewBusAPI.HUB
{
    public class LiveHub:Hub
    {
    
            private readonly IStudentConnection _StudentConnection;
            private readonly IAdminConnection _AdminConnection;
            private readonly IDriverConnection _DriverConnection;
            private readonly IDriverBLL _driverbll;
            private readonly IStudentBLL _studentbll;
        private readonly IstationBLL _StationBLL;
        private readonly NewBusBLL.StationTrips.IstationTrip _StataionTripBLL;

            public LiveHub(
                IStudentBLL studentbll,
                IDriverBLL driverbll,
                IStudentConnection studentConnection,
                IAdminConnection adminConnection,
                IDriverConnection driverConnection,IstationBLL istation)
            {
                _StudentConnection = studentConnection;
                _AdminConnection = adminConnection;
                _DriverConnection = driverConnection;
                _driverbll = driverbll;
            _StationBLL= istation;
                _studentbll = studentbll;
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


            public override async Task OnDisconnectedAsync(Exception? exception)
            {
                var conn = Context.ConnectionId;

                // Remove only if exists (your repo should handle no-row cases)
                await _AdminConnection.RemoveFromConnectionAdminTable(conn);
                await _StudentConnection.RemoveFromConnectionStudentTable(conn);
                await _DriverConnection.RemoveFromConnectionDriverTable(conn);

                // Remove from groups (safe even if not inside the group)
                await Groups.RemoveFromGroupAsync(conn, "Students");
                await Groups.RemoveFromGroupAsync(conn, "Drivers");

                await base.OnDisconnectedAsync(exception);
            }


            // Send Student Location → to Drivers group
            public async Task ShareLiveLocationForStudent(double latitude, double longitude)
            {
                var isAuth = Context?.User?.Identity?.IsAuthenticated ?? false;
                if (!isAuth) return;

                var id = int.Parse(Context?.User?.FindFirst("ID")?.Value!);

                await _studentbll.UpdateLiveLocation(new DtoUpdateLocation
                {
                    Id = id,
                    Lat = latitude,
                    Lang = longitude
                });

                await Clients.Group("Drivers").SendAsync("ReceiveLocationFromStudent", latitude, longitude);
            }


            // Send Driver Location → to Students group

            public async Task ShareLiveLocationForDriver(double latitude, double longitude,int TripId)
            {
                var isAuth = Context?.User?.Identity?.IsAuthenticated ?? false;
                if (!isAuth) return;

                var id = int.Parse(Context?.User?.FindFirst("ID")?.Value!);
            var Driver=await _driverbll.GetDriverByID(id);
                await _driverbll.UpdateLiveLocation(new DtoUpdateLocation
                {
                    Id = id,
                    Lat = latitude,
                    Lang = longitude
                });

            // check Station
            var Stations=_StationBLL.GetAllStationsForHub();
            if (Stations != null)
            {
                foreach (var Station in await Stations)
                {
                    // Calculate Distance between two point
                    var distance=Utilities.CalculateDistance(Station.Latititude,Station.Longitude,latitude,longitude);


                    // Check inside Redius
                    if(Utilities.IsEnterArea(distance,Station.Radius))
                    {
                        //handle is send before 
                        var StationTrip = new DtoStationTrip()
                        {
                            StationId = Station.Id,
                            TripId=TripId,
                        };


                        var stationTrip = await _StataionTripBLL.GetStationTrip(Station.Id,TripId); 
                        if(stationTrip.IsVisited||stationTrip==null)
                        {
                            break;
                        }

                      if(await _StataionTripBLL.AddStationTrip(StationTrip))
                        {

                            string Name = Station.Name;

                            await Clients.Group("Students").SendAsync("ArriveNewStation", Driver.FirstName + " " + Driver.LastName, Driver.PlateNoBus, Name);
                            break;
                        }

                        //add for db and if exist no add

                      

                    }

                }
            }


                await Clients.Group("Students").SendAsync("ReceiveLiveLocationFromDriver", latitude, longitude);
            }
        }


    }

