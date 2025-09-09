using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementBackend.DTOs.Auth
{
    public class LoginDTO
    {
        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = null!;


        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;
    }
}
