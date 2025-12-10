using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.EmailService
{
    public class EmailService:Iemail
    {
        private readonly IConfiguration _Configure;
        public EmailService(IConfiguration configgue)
        {
            _Configure = configgue;
        }
        public async Task SendEmail(string email,string subject,string Body)
        {
            try
            {
                // Implement email sending logic here using EmailFrom and Password
                // This is a placeholder for the actual email sending code
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,// SMTP port for mails
                    Credentials = new NetworkCredential(_Configure["EmailFrom"], _Configure["PasswordEmail"]!),
                    EnableSsl = true,// for connection security
                };
                var MailMessage = new MailMessage
                {
                    From = new MailAddress(_Configure["EmailFrom"]!),
                    Subject = subject,
                    Body = Body,
                    IsBodyHtml = true,
                };
                MailMessage.To.Add(email);

            await    smtpClient.SendMailAsync(MailMessage);
            }
            catch (Exception)
            {
                return;
            }
        }
        public async Task SendOTPStudentEmail(string toEmail, string OTP)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,// SMTP port for mails
                Credentials = new NetworkCredential(_Configure["EmailFrom"], _Configure["PasswordEmail"]!),
                EnableSsl = true,// for connection security
            };

            var message = new MailMessage();
            message.From = new MailAddress(_Configure["EmailFrom"]!);
            message.To.Add(toEmail);
            message.Subject = "Your OTP Rest Password";
            message.IsBodyHtml = true;


            // جسم الإيميل بسيط جدًا
            string htmlBody = $@"
<html>
  <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
    <table width='100%' cellspacing='0' cellpadding='0'>
      <tr>
        <td align='center'>
          <table width='520' style='background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);'>

            <!-- Header -->
            <tr>
              <td align='center' style='padding-bottom: 20px;'>
                <h1 style='margin: 0; color: #2E86C1; font-size: 28px;'>New Bus</h1>
                <p style='margin: 5px 0 0; font-size: 14px; color: #777;'>Your trusted bus reservation system</p>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style='font-size: 20px; font-weight: bold; color: #333; padding-top: 10px;'>
                Your Password Reset OTP
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style='padding-top: 15px; font-size: 16px; color: #555; line-height: 1.6;'>
                Hello,<br/><br/>
                We received a request to reset your <strong>New Bus</strong> account password.<br/>
                Use the token below to continue the process inside the app:
              </td>
            </tr>

            <!-- Token Box -->
            <tr>
              <td align='center' style='padding: 25px 0;'>
                <div style='background-color: #f0f6fc; 
                            border: 1px solid #d6e4f0; 
                            padding: 15px 30px;
                            font-size: 22px; 
                            font-weight: bold; 
                            color: #2E86C1; 
                            border-radius: 8px;
                            display: inline-block;'>
                  {OTP}
                </div>
              </td>
            </tr>

            <!-- Instructions -->
            <tr>
              <td style='font-size: 15px; color: #555; padding-top: 10px; line-height: 1.6;'>
                Enter this token in the password reset screen inside your application.
              </td>
            </tr>

            <!-- Warning -->
            <tr>
              <td style='font-size: 14px; color: #C0392B; padding-top: 20px;'>
                This token will expire soon for security reasons.
              </td>
            </tr>

            <!-- Notice -->
            <tr>
              <td style='font-size: 14px; color: #777; padding-top: 10px;'>
                If you did not request this, you can safely ignore this email.
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style='padding-top: 25px;'>
                <hr style='border: 0; border-top: 1px solid #eee;'/>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align='center' style='padding-top: 10px; font-size: 13px; color: #aaa;'>
                © {DateTime.Now.Year} New Bus. All rights reserved.<br/>
                Secure password assistance provided by New Bus.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";

            message.Body = htmlBody;


            await smtpClient.SendMailAsync(message);

        }
        public async Task SendVerificationEmailAdmin(string toEmail, string token)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,// SMTP port for mails
                Credentials = new NetworkCredential(_Configure["EmailFrom"], _Configure["PasswordEmail"]!),
                EnableSsl = true,// for connection security
            };

            var message = new MailMessage();
            message.From=new MailAddress(_Configure["EmailFrom"]!);
            message.To.Add(toEmail);
            message.Subject = "Verify Your Email";
            message.IsBodyHtml = true;

            // لينك التفعيل
            string verifyUrl = $"https://localhost:7157/api/Admins/VerifyEmail/{token}";

            // جسم الإيميل بسيط جدًا
            string htmlBody = $@"
<html>
  <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
    <table width='100%' cellspacing='0' cellpadding='0'>
      <tr>
        <td align='center'>
          <table width='520' style='background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);'>

            <!-- Header -->
            <tr>
              <td align='center' style='padding-bottom: 20px;'>
                <h1 style='margin: 0; color: #2E86C1; font-size: 28px;'>New Bus</h1>
                <p style='margin: 5px 0 0; font-size: 14px; color: #777;'>Your trusted bus reservation system</p>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style='font-size: 20px; font-weight: bold; color: #333; padding-top: 10px;'>
                Verify Your Email Address
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style='padding-top: 15px; font-size: 16px; color: #555; line-height: 1.6;'>
                Hello,<br/><br/>
                Thank you for joining <strong>New Bus</strong>! To complete your registration,
                please verify your email address by clicking the button below.
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align='center' style='padding: 25px 0;'>
                <a href='{verifyUrl}'
                   style='background-color: #2E86C1; 
                          color: white; 
                          padding: 14px 35px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-size: 17px; 
                          font-weight: bold;
                          display: inline-block;'>
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Extra Info -->
            <tr>
              <td style='font-size: 15px; color: #555; padding-top: 10px; line-height: 1.6;'>
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href='{verifyUrl}' style='color: #2E86C1;'>{verifyUrl}</a>
              </td>
            </tr>

            <!-- Notice -->
            <tr>
              <td style='font-size: 14px; color: #777; padding-top: 20px;'>
                If you did not request this, simply ignore this message.
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style='padding-top: 25px;'>
                <hr style='border: 0; border-top: 1px solid #eee;'/>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align='center' style='padding-top: 10px; font-size: 13px; color: #aaa;'>
                © {DateTime.Now.Year} New Bus. All rights reserved.<br/>
                Powered by PHI Team.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";

            message.Body = htmlBody;

         
            await smtpClient.SendMailAsync(message);

        }
        public async Task SendVerificationEmailStudent(string toEmail, string token)
        {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,// SMTP port for mails
                    Credentials = new NetworkCredential(_Configure["EmailFrom"], _Configure["PasswordEmail"]!),
                    EnableSsl = true,// for connection security
                };

                var message = new MailMessage();
                message.From = new MailAddress(_Configure["EmailFrom"]!);
                message.To.Add(toEmail);
                message.Subject = "Verify Your Email";
                message.IsBodyHtml = true;

                // لينك التفعيل
                string verifyUrl = $"https://localhost:7157/api/Students/VerifyEmail/{token}";

            // جسم الإيميل بسيط جدًا
            string htmlBody = $@"
<html>
  <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
    <table width='100%' cellspacing='0' cellpadding='0'>
      <tr>
        <td align='center'>
          <table width='520' style='background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);'>

            <!-- Header -->
            <tr>
              <td align='center' style='padding-bottom: 20px;'>
                <h1 style='margin: 0; color: #2E86C1; font-size: 28px;'>New Bus</h1>
                <p style='margin: 5px 0 0; font-size: 14px; color: #777;'>Your trusted bus reservation system</p>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style='font-size: 20px; font-weight: bold; color: #333; padding-top: 10px;'>
                Verify Your Email Address
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style='padding-top: 15px; font-size: 16px; color: #555; line-height: 1.6;'>
                Hello,<br/><br/>
                Thank you for joining <strong>New Bus</strong>! To complete your registration,
                please verify your email address by clicking the button below.
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align='center' style='padding: 25px 0;'>
                <a href='{verifyUrl}'
                   style='background-color: #2E86C1; 
                          color: white; 
                          padding: 14px 35px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-size: 17px; 
                          font-weight: bold;
                          display: inline-block;'>
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Extra Info -->
            <tr>
              <td style='font-size: 15px; color: #555; padding-top: 10px; line-height: 1.6;'>
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href='{verifyUrl}' style='color: #2E86C1;'>{verifyUrl}</a>
              </td>
            </tr>

            <!-- Notice -->
            <tr>
              <td style='font-size: 14px; color: #777; padding-top: 20px;'>
                If you did not request this, simply ignore this message.
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style='padding-top: 25px;'>
                <hr style='border: 0; border-top: 1px solid #eee;'/>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align='center' style='padding-top: 10px; font-size: 13px; color: #aaa;'>
                © {DateTime.Now.Year} New Bus. All rights reserved.<br/>
                Powered by PHI Team.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";

            message.Body = htmlBody;


                await smtpClient.SendMailAsync(message);

        }
        public async Task SendVerificationEmailDriver(string toEmail, string token)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,// SMTP port for mails
                Credentials = new NetworkCredential(_Configure["EmailFrom"], _Configure["PasswordEmail"]!),
                EnableSsl = true,// for connection security
            };

            var message = new MailMessage();
            message.From = new MailAddress(_Configure["EmailFrom"]!);
            message.To.Add(toEmail);
            message.Subject = "Verify Your Email";
            message.IsBodyHtml = true;

            // لينك التفعيل //
            string verifyUrl = $"https://localhost:7157/api/Drivers/VerifyEmail/{token}";

            // جسم الإيميل بسيط جدًا
            string htmlBody = $@"
<html>
  <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
    <table width='100%' cellspacing='0' cellpadding='0'>
      <tr>
        <td align='center'>
          <table width='520' style='background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);'>

            <!-- Header -->
            <tr>
              <td align='center' style='padding-bottom: 20px;'>
                <h1 style='margin: 0; color: #2E86C1; font-size: 28px;'>New Bus</h1>
                <p style='margin: 5px 0 0; font-size: 14px; color: #777;'>Your trusted bus reservation system</p>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style='font-size: 20px; font-weight: bold; color: #333; padding-top: 10px;'>
                Verify Your Email Address
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style='padding-top: 15px; font-size: 16px; color: #555; line-height: 1.6;'>
                Hello,<br/><br/>
                Thank you for joining <strong>New Bus</strong>! To complete your registration,
                please verify your email address by clicking the button below.
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align='center' style='padding: 25px 0;'>
                <a href='{verifyUrl}'
                   style='background-color: #2E86C1; 
                          color: white; 
                          padding: 14px 35px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-size: 17px; 
                          font-weight: bold;
                          display: inline-block;'>
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Extra Info -->
            <tr>
              <td style='font-size: 15px; color: #555; padding-top: 10px; line-height: 1.6;'>
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href='{verifyUrl}' style='color: #2E86C1;'>{verifyUrl}</a>
              </td>
            </tr>

            <!-- Notice -->
            <tr>
              <td style='font-size: 14px; color: #777; padding-top: 20px;'>
                If you did not request this, simply ignore this message.
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style='padding-top: 25px;'>
                <hr style='border: 0; border-top: 1px solid #eee;'/>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align='center' style='padding-top: 10px; font-size: 13px; color: #aaa;'>
                © {DateTime.Now.Year} New Bus. All rights reserved.<br/>
                Powered by PHI Team.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";

            message.Body = htmlBody;


            await smtpClient.SendMailAsync(message);

        }

    }
}
