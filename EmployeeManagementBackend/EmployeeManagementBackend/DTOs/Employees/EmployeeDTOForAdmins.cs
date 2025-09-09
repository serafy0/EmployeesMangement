using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagementBackend.DTOs.Employees
{
    public class EmployeeDTOForAdmins : EmployeeDTO
    {
        public string Id { get; set; } = null!;
        public bool IsPasswordSet { get; set; }

    }
}
