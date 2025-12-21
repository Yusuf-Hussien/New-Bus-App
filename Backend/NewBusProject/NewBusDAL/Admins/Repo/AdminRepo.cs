using AutoMapper;
using NewBusDAL.Admins.InterFaceRepo;
using NewBusDAL.Models;
using NewBusDAL.Repositry.RepoClassess.BaseRepositry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Admins.Repo
{
    public class AdminRepo:BaseRepsitry<NewBusDAL.Models.Admin>, IadminRepo
    {
        private readonly NewBusContext _context;
        private readonly IMapper _Mapper;
        public AdminRepo(NewBusDAL.Models.NewBusContext context,IMapper mapper) : base(context)
        {
            _context = context;
            _Mapper = mapper;
        }



    }   
   
}
