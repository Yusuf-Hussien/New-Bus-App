using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IBaseRepositry;
using NewBusDAL.Trip.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Trip.InterfaceTripRepo
{
    public interface ITripRepsitry:IbaseRepositry<Models.Trip>
    {
        public Task<IEnumerable<DtoTripRead>>GetAllTrips();
        public Task<DtoTripRead> GetTripById(int id);
    }
}
