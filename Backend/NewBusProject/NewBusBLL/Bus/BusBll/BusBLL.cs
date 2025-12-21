using AutoMapper;
using NewBusBLL.Bus.Interface;
using NewBusBLL.Exceptions;
using NewBusDAL.Bus.DTO;
using NewBusDAL.Enums;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Bus.BusBll
{
    public class BusBLL : IBusBLL
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;   
        public BusBLL(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task AddBusAsync(NewBusDAL.Models.Bus bus)
        {
            if(bus == null)
                throw new ValidationException("Bus cannot be null");
            if(string.IsNullOrEmpty(bus.PlateNo))
                throw new ValidationException("Plate number cannot be null or empty");
            if(bus.Capacity == null || bus.Capacity <= 0)
                throw new ValidationException("Capacity must be a positive number");
            if(bus.Status!=Convert.ToInt32( enStatusBus.Active) && bus.Status != Convert.ToInt32(enStatusBus.UnderMaintenance))
                throw new ValidationException("Status must be either 1 (active) or 2 (UnderMaintenance)");
           
            await _unitOfWork.Buses.AddAsync(bus);
            await _unitOfWork.Complete();
        }

        public async Task<IEnumerable<DtoBusRead>> GetAllBusesAsync()
        {
            var Buses = await _unitOfWork.Buses.GetAllAsync();
            if (Buses.Count() <= 0)
                throw new NotFoundException("No buses found");
            return _mapper.Map<IEnumerable<DtoBusRead>>(Buses);
        }

        public async Task<DtoBusRead> GetBusByIdAsync(int id)
        {
            if(id <= 0)
                throw new ValidationException("Invalid bus ID");    
            var Buses = await _unitOfWork.Buses.GetByIdAsync(id);
            if (Buses == null)
                throw new NotFoundException($"No Buses found Has ID {id}");
            return _mapper.Map<DtoBusRead>(Buses);
        }

        public async Task RemoveBusAsync(int id)
        {
            if (id <= 0)
                throw new ValidationException("Invalid bus ID");
            var bus= _unitOfWork.Buses.GetByIdAsync(id);
            if (bus == null)
                throw new NotFoundException($"No Buses found Has ID {id}");
           await _unitOfWork.Buses.RemoveAsync(id);
            await _unitOfWork.Complete();
        }

        public async Task UpdateBusAsync(DtoBusUpdate bus)
        {
            if(bus == null)
                throw new ValidationException("Bus cannot be null");
            if (bus.Status != Convert.ToInt32(enStatusBus.Active) && bus.Status != Convert.ToInt32(enStatusBus.UnderMaintenance))
                throw new ValidationException("Status must be either 1 (active) or 2 (UnderMaintenance)");
            var existingBus = await _unitOfWork.Buses.GetByIdAsync(bus.ID);
            if (existingBus == null)
                throw new NotFoundException($"No Buses found Has ID {bus.ID}");
            existingBus.Status = bus.Status;
           await _unitOfWork.Buses.UpdateAsync(existingBus);
            await _unitOfWork.Complete();

        }

      public async  Task<IEnumerable<DTOStatusBus>> GetStatusBusAsync()
        {
         var statusBuses = await _unitOfWork.Buses.GetAllAsync();
            if(statusBuses == null)
                throw new NotFoundException("No status buses found");
          return _mapper.Map<IEnumerable<DTOStatusBus>>(statusBuses);
            
        }
    }
}
