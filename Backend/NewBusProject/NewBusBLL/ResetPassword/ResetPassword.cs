using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.ResetPassword
{
    public class ResetPassword : IResetPassword
    {
        private readonly IUnitOfWork _Uow;
        public ResetPassword(IUnitOfWork unitOfWork)
        {
            _Uow = unitOfWork;
        }
        public async Task RemoveOTPNonVerifyForAdmin()
        {
            var AdminOTPNonValide =await _Uow.ResetPasswordAdmins.FindAsync(r => r.IsVerified == false);
            if (AdminOTPNonValide.Count() <= 0)
                return;
            foreach (var Adminotpnonverify in AdminOTPNonValide)
            {
             await   _Uow.ResetPasswordAdmins.RemoveAsync(Adminotpnonverify.Id);
            }
            await _Uow.Complete();
        }

        public async Task RemoveOTPNonVerifyForDriver()
        {
            var DriverOTPNonValide = await _Uow.ResetPasswordDrivers.FindAsync(r => r.IsVerified == false);
            if (DriverOTPNonValide.Count() <= 0)
                return;
            
            foreach (var Driverotpnonverify in DriverOTPNonValide)
            {
                await _Uow.ResetPasswordDrivers.RemoveAsync(Driverotpnonverify.Id);
            }
            await _Uow.Complete();
        }

        public async Task RemoveOTPNonVerifyForStudent()
        {
            var StudentOTPNonValide = await _Uow.ResetPasswordStudents.FindAsync(r => r.IsVerified == false);
            if (StudentOTPNonValide.Count() <= 0)
                return;
            foreach (var Studentotpnonverify in StudentOTPNonValide)
            {
                await _Uow.ResetPasswordStudents.RemoveAsync(Studentotpnonverify.Id);
            }
            await _Uow.Complete();
        }
    }
}
