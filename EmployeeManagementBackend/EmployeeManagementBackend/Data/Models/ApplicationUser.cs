using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend.Data.Models
{
    public class ApplicationUser: IdentityUser
    {
        
        public string NationalId { get; set; } = null!;
        public int Age { get; set; } 
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;

        public string? ElectronicSignature { get; set; } = null!;

        public bool IsPasswordSet { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
     
    }
}
