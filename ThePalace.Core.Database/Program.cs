using Microsoft.EntityFrameworkCore;
using System;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using ThePalace.Core.Database;
using ThePalace.Core.Utility;

namespace ThePalace.Database
{
    public class Program
    {
        static void Main(string[] args)
        {
            var path = $"{Directory.GetCurrentDirectory()}\\..\\..\\..\\Build\\";
            var files = Directory.GetFiles(path, "*.SQL", SearchOption.AllDirectories);
            var benchmark = DateTime.UtcNow;

            using (var dbContext = Core.Database.Database.For<ThePalaceEntities>())
            {
                //dbContext.Database.Log = Console.Write;

                var sqlConn = dbContext.Database.GetDbConnection() as SqlConnection;
                if (sqlConn != null)
                {
                    sqlConn.FireInfoMessageEventOnUserErrors = true;
                    sqlConn.InfoMessage += delegate (object sender, SqlInfoMessageEventArgs e)
                    {
                        Console.WriteLine($"PRINT: {e.Message}");
                    };
                }

                using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                {
                    try
                    {
                        foreach (var file in files)
                        {
                            Console.WriteLine($"Loading file: {Path.GetFileName(file)}");

                            var sqlBlob = File.ReadAllText(file);
                            var sqls = Regex.Split(sqlBlob, "\r\n[\\s^\r\n]*GO[\\s^\r\n]*\r\n", RegexOptions.Multiline)
                                .Where(s => !string.IsNullOrWhiteSpace(s))
                                .ToList();
                            var blockNbr = 0;

                            foreach (var sql in sqls)
                            {
                                if (sqls.Count > 1)
                                {
                                    Console.WriteLine($"Running block {blockNbr + 1} of {sqls.Count}");
                                }

                                benchmark = DateTime.UtcNow;

                                dbContext.Database.ExecuteSqlCommand(sql);

                                Console.WriteLine($"Took {DateTime.UtcNow.Subtract(benchmark).TotalMilliseconds}ms to run");

                                blockNbr++;
                            }
                        }

                        dbContextTransaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();

                        Console.WriteLine(string.Join("; ", ex.GetFullMessage()));
                    }
                }
            }

            Console.WriteLine("Press any key derp...");
            Console.ReadKey();
        }
    }
}
