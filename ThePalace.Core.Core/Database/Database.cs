using Microsoft.EntityFrameworkCore;

namespace ThePalace.Core.Database
{
    public static class Database
    {
        public static T For<T>() where T: DbContext, new()
        {
            return new T();
        }
    }
}
