using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Repositry.Interfaces.IBaseRepositry
{
    public interface IbaseRepositry<T> where T : class
    {
        Task<T> GetByIdAsync(int id);
        Task<T> GetByAsync(Expression<Func<T, bool>> predicate);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        IQueryable<T> getallIncludeBy(Expression<Func<T, bool>> predicate=null, string[] include=null);
        Task AddAsync(T entity);
        Task RemoveAsync(int ID);
        Task UpdateAsync(T entity);
        Task<bool> IsExist(Expression<Func<T, bool>> predicate);
    }
}
