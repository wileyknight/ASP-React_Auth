using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityServer4.EntityFramework.DbContexts;
using IdentityServer4.EntityFramework.Mappers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ASPReact_Auth
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //CreateHostBuilder(args).Build().Run();
            
            var host = CreateHostBuilder(args).Build();

            using (var scope = host.Services.CreateScope())
            {

                //*** User Not stored in database
                var userManager = scope.ServiceProvider
                    .GetRequiredService<UserManager<IdentityUser>>();

                var user = new IdentityUser("bob");
                userManager.CreateAsync(user, "Password#123").GetAwaiter().GetResult();
                userManager.AddClaimAsync(user,
                    new System.Security.Claims.Claim("IdentityServerApi", "big.Cookie"))
                    .GetAwaiter().GetResult();
            }

            host.Run();
            
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
// Use these lines in the console for Javascript project to rebuild the database

//dotnet ef migrations add init -c ApplicationDbContext -o Data/Migrations/ApplicationMigrations

//dotnet ef migrations add initPersistedGrantDbMigration -c PersistedGrantDbContext -o Data/Migrations/PersistedGrantDb
//dotnet ef migrations add initConfigurationDbMigration -c ConfigurationDbContext -o Data/Migrations/ConfigurationDb



//dotnet ef database update -c ApplicationDbContext

//dotnet ef database update -c PersistedGrantDbContext
//dotnet ef database update -c ConfigurationDbContext