using NewBusBLL.RefreshToken;
using Quartz;

namespace NewBusAPI.BackgroundService
{
    public class RemoveRefreshTokenExpired:IJob
    {
        private readonly IRefreshToken _Refresh;
        public RemoveRefreshTokenExpired(IRefreshToken reset)
        {
            _Refresh = reset;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            await _Refresh.RemoveRefreshTokenExpired();

        }
    }
}
