using NewBusBLL.RefreshToken;
using NewBusBLL.ResetPassword;
using Quartz;

namespace NewBusAPI.BackgroundService
{
    [DisallowConcurrentExecution]
    public class RemoveRefreshTokenLogout:IJob
    {
        private readonly IRefreshToken _Refresh;
        public RemoveRefreshTokenLogout(IRefreshToken reset)
        {
            _Refresh = reset;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            await _Refresh.RemoveRefreshTokenLogout();

        }
    }
}
