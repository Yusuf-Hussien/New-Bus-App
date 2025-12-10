using NewBusBLL.Exceptions;
using NewBusDAL.Admins.DTO;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using NewBusDAL.Trip.DTO;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Trip
{
    public class TripBLL:ITripBLL
    {
        private readonly IUnitOfWork _unitOfWork;
        public TripBLL(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> AddTrip(DtoTripCreate trip)
        {
            if (trip == null)
                throw new ValidationException("Trip Data Invalid");
            if (trip.StatusTripId != (int)enStatusTrip.Completed && trip.StatusTripId != (int)enStatusTrip.NonComplete)
                throw new ValidationException("Trip Data Invalid Status Trip Failed");
            if (trip.RouteID <= 0)
                throw new ValidationException("Trip Data Invalid RouteID Must Be Positive");
            if (!await _unitOfWork.Routes.IsExist(r => r.Id == trip.RouteID))
                throw new ValidationException("RouteID Failed");
            if (!await _unitOfWork.Drivers.IsExist(r => r.Id == trip.CreatedByDriverId))
                throw new ValidationException("Driver ID Not Found");
            var Trip = new NewBusDAL.Models.Trip()
            {
                StartAt = DateTime.Now,
                RouteID= trip.RouteID,
                StatusTripId = trip.StatusTripId,
                CreatedByDriverId=trip.CreatedByDriverId,
            };
         await   _unitOfWork.Trips.AddAsync(Trip);
           await _unitOfWork.Complete();
            return Trip.Id;

        }

        public async Task CancelTrip(int Id)
        {
            if (Id <= 0)
                throw new ValidationException("TripID Must Be Positive");
       
            var Trip=await _unitOfWork.Trips.GetByIdAsync(Id);
            if (Trip== null)
                throw new NotFoundException("Trip Not Found");
            if(Trip.EndAt!=null)
                throw new ValidationException("Trip Is Finished Cannot Canceled");

            Trip.IsCancel=true;
            Trip.CancelAt = DateTime.Now;
            await _unitOfWork.Complete();

        }

        public async Task<IEnumerable<DtoTripRead>> GetAllTrips()
        {
            var Trips =await _unitOfWork.Trips.GetAllTrips();
            if(Trips== null)
                throw new NotFoundException("Data NotFound");
            return Trips;
        }

        public async Task<DtoTripRead>GetTripByID(int id)
        {
            var Trip = await _unitOfWork.Trips.GetTripById(id);
            if (Trip == null)
                throw new ValidationException();
            return Trip;
        }

       

     public async Task UpdateStatusTrip(DtoTripUpdateStatus dto)
        {
            if(dto==null) throw new ValidationException("DataIs Not Valid");
            if (dto.Id <= 0) throw new ValidationException("ID Must Be Positive");
            var Trip = await _unitOfWork.Trips.GetByIdAsync(dto.Id);
            if(Trip== null)
                throw new NotFoundException("Not Found Trip");
            if (dto.StatusTripId != (int)enStatusTrip.Completed && dto.StatusTripId != (int)enStatusTrip.NonComplete)
                throw new ValidationException("Trip Data Invalid Status Trip Failed");
            if(Trip.CreatedByDriverId!=dto.CreatedByDriverID)
                throw new ValidationException($"Cannot Update Trip for Another Driver Bus");

            Trip.StatusTripId = dto.StatusTripId;
            await _unitOfWork.Complete();
        }

        public async Task FinishTrip(int Id)

        {
            if (Id <= 0)
                throw new ValidationException("TripID Must Be Positive");
            var Trip = await _unitOfWork.Trips.GetByIdAsync(Id);
            if (Trip == null)
                throw new NotFoundException("Trip Not Found");
            if (Trip.IsCancel)
                throw new ValidationException("Trip Is Canceled Cannot Finish it");
            Trip.EndAt = DateTime.Now;
            await _unitOfWork.Complete();

        }
    }
}
