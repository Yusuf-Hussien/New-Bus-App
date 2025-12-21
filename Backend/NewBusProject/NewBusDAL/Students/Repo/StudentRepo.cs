using AutoMapper;
using NewBusDAL.Models;
using NewBusDAL.Repositry.RepoClassess.BaseRepositry;
using NewBusDAL.Students.InterFaceRepo;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Students.Repo
{
    public class StudentRepo:BaseRepsitry<NewBusDAL.Models.Student>, IStudentRepo
    {
        private readonly NewBusContext _context;
        private readonly IMapper _Mapper;
        public StudentRepo(NewBusDAL.Models.NewBusContext context,IMapper mapper) : base(context)
        {
            _context = context;
            _Mapper = mapper;
        }
    }
  
}
