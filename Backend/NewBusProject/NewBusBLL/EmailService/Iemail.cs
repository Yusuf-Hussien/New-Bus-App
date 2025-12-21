using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.EmailService
{
    public interface Iemail
    {
        public Task SendEmail(string email, string subject, string Body);
        public  Task SendVerificationEmailDriver(string toEmail, string token);
              public  Task SendVerificationEmailStudent(string toEmail, string token);
        public Task SendVerificationEmailAdmin(string toEmail, string token);
        public  Task SendOTPStudentEmail(string toEmail, string OTP);
    }
}
