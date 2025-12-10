using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.DTO_General
{
    public class DtoReturnKeyVal
    {
        public int key {  get; set; }
        public string value { get; set; }
        public DtoReturnKeyVal(int key , string value) {
        this.key = key;
            this.value = value;
        }
    }
}
