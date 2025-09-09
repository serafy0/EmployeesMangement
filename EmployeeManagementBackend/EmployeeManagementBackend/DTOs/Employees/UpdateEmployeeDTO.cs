using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementBackend.DTOs.Employees
{
    public class UpdateEmployeeDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MinLength(14), MaxLength(14)]
        public string NationalId { get; set; } = string.Empty;

        [Required]
        [Range(18, 65)]
        public int Age { get; set; }

        public string? ElectronicSignature { get; set; }
    }
}
