using Microsoft.AspNetCore.WebUtilities;
using NewBusBLL.Hashing_Service.Inter;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Hashing_Service
{
    public class HashingBLL : IhashingBLL
    {
        public string GenerateHashedPassword(string Password, string Salt)
        {
            byte[] passwordd = Encoding.UTF8.GetBytes(Password);
            byte[] saltt = Convert.FromBase64String(Salt);
            passwordd = saltt.Concat(passwordd).ToArray();
            using (var sha256 = SHA256.Create())
            {
                //Convert the password string to a byte array

                //Compute the hash
                byte[] hash = sha256.ComputeHash(passwordd);
                StringBuilder sb = new StringBuilder();
                foreach (byte b in hash)
                {
                    sb.Append(b.ToString("x2")); // Convert each byte to a two-digit hexadecimal string
                }

                //Convert the byte array to a hexadecimal string
                return sb.ToString();
            }

        }
        public bool IsPasswordCorrect(string CheckPassword, string CurrentPassword, string Salt)
        {
            return GenerateHashedPassword(CheckPassword, Salt) == CurrentPassword;
        }
        public string GenerateSaltStringWithoutSlash(int size = 16)
        {
            byte[] saltBytes = new byte[size];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(saltBytes);

            // Base64 URL-safe (بدون + / =)
            return WebEncoders.Base64UrlEncode(saltBytes);
        }

        public string GenerateSaltString(int size = 16)
        {
            byte[] saltBytes = new byte[size];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(saltBytes);
            }
            // تحويل البايتات لنص Base64 (مناسب للتخزين كنص)
            return Convert.ToBase64String(saltBytes);
        }
    }
}
