namespace EmployeeManagementBackend.DTOs.Employees
{
    public class Base64SignatureRequest
    {
        public string? UserId { get; set; }
        public string Base64 { get; set; } = null!;
    }
}
