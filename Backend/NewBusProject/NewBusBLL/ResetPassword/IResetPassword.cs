using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.ResetPassword
{
    public interface IResetPassword
    {
        public Task RemoveOTPNonVerifyForAdmin();
        public Task RemoveOTPNonVerifyForStudent();
        public Task RemoveOTPNonVerifyForDriver();


    }
}
