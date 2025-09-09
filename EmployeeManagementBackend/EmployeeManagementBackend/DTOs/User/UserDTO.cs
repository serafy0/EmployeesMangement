using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagementBackend.DTOs.User
{
    public class UserDTO
    {
        public string Id { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string NationalId { get; set; } = null!;
        public List<string> Roles { get; set; } = new();
        public bool IsPasswordSet { get; set; }

    }
}
