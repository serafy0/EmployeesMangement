namespace EmployeeManagementBackend.DTOs.Attendance
{
    public class EmployeeSummaryDTO
    {
        public string EmployeeId { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public double TotalHours { get; set; }
        public int DaysAttended { get; set; }
        public double AverageHoursPerDay { get; set; }

    }
}
