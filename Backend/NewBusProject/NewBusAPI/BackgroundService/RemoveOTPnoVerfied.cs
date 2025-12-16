using NewBusDAL.Repositry.Interfaces.IunitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Quartz;
using NewBusBLL.ResetPassword;

namespace NewBusBLL.BackgroundService
{
    [DisallowConcurrentExecution]
    public class RemoveOTPnoVerfied : IJob
    {
        private readonly IResetPassword _Reset;
        public RemoveOTPnoVerfied(IResetPassword reset )
        {
            _Reset = reset;
        }

        public async Task Execute(IJobExecutionContext context)
        {
         await   _Reset.RemoveOTPNonVerifyForDriver();
         await   _Reset.RemoveOTPNonVerifyForAdmin();
            await _Reset.RemoveOTPNonVerifyForStudent();
        }
    }
}
