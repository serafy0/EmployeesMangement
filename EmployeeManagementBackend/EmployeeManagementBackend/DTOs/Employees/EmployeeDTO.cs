using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementBackend.DTOs.Employees
{
    public class EmployeeDTO
    {
        [Required]
        public string FirstName { get; set; } = null!;

        [Required]
        public string LastName { get; set; } = null!;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        [MinLength(14), MaxLength(14)]
        public string NationalId { get; set; } = null!;

        [Required]
        [Range(18, 110)]
        public int Age { get; set; }

        public string? ElectronicSignature { get; set; }

    }
}
