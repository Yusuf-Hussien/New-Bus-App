using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusBLL.Hashing_Service.Inter
{
    public interface IhashingBLL
    {
        public string GenerateHashedPassword(string Password, string Salt);
        public bool IsPasswordCorrect(string CheckPassword, string CurrentPassword, string Salt);
        public string GenerateSaltString(int size = 16);
        public string GenerateSaltStringWithoutSlash(int size = 16);
    }
}
