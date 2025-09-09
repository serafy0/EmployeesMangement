using EmployeeManagementBackend.DTOs.User;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagementBackend.DTOs.Auth
{
    public class LoginResponseDTO 
    {
        
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string? Token { get; set; }
        public DateTime? ExpirationTime { get; set; }
        public UserDTO? User { get; set; }
    }
}

