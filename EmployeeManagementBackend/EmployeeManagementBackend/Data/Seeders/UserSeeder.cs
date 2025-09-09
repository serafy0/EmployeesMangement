using EmployeeManagementBackend.Data.Models;
using EmployeeManagementBackend.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagementBackend.Data.Seeders
{
    public class UserSeeder
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public UserSeeder(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task SeedAdminUserAsync()
        {
            var adminPhone = _configuration["Admin:PhoneNumber"];
            var adminPassword = _configuration["Admin:Password"];

            if (
                string.IsNullOrEmpty(adminPhone)
                || string.IsNullOrEmpty(adminPassword)
            )
            {
                throw new Exception(
                    "Admin credentials are not configured properly."
                );
            }

            var adminUser = await _userManager.FindByNameAsync(adminPhone);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminPhone,
                    PhoneNumber = adminPhone,
                    FirstName = "System",
                    LastName = "Administrator",
                    NationalId = "00000000000000",
                    Age = 30,
                    IsPasswordSet = true,
                    
                };

                var result = await _userManager.CreateAsync(adminUser, adminPassword);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, Roles.Admin);
                }
                else
                {
                    throw new Exception("Failed to create admin user.");
                }
            }
        }
    }
}
