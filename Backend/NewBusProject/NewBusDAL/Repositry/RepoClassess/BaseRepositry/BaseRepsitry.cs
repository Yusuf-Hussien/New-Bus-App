using Microsoft.EntityFrameworkCore;
using NewBusDAL.Models;
using NewBusDAL.Repositry.Interfaces.IBaseRepositry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace NewBusDAL.Repositry.RepoClassess.BaseRepositry
{
    public class BaseRepsitry<T> : IbaseRepositry<T> where T : class 
    {
        protected readonly NewBusContext _context;
        protected readonly DbSet<T> _dbSet;

        public BaseRepsitry(NewBusContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

      
        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }
        public async Task<T> GetByAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).FirstOrDefaultAsync();
        }
        public async Task RemoveAsync(int id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
            }

        }
        public IQueryable<T> getallIncludeBy(Expression<Func<T, bool>> predicate = null,string[] include = null)
        {
            IQueryable<T> query = _dbSet.AsQueryable();

            if (include != null)
            {
                foreach (var includeItem in include)
                {
                    query = query.Include(includeItem);
                }
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            return query;
        }

        public async Task<bool> IsExist(Expression<Func<T, bool>> predicate )
        {
                return await _dbSet.AnyAsync(predicate);
 
        }
        public async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
        }


    }
    
}
