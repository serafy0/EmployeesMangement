using EmployeeManagementBackend.Utils;
using Microsoft.AspNetCore.Identity;

namespace EmployeeManagementBackend.Data.Seeders
{
    public class RoleSeeder
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = new[] { Roles.Admin, Roles.Employee };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
    }
}