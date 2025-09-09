using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementBackend.DTOs.Auth
{
    public class SetEmployeePasswordRequest
    {
        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        public string ResetToken { get; set; } = null!;


        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = null!;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = null!;
    }
}
