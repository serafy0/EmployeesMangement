namespace EmployeeManagementBackend.Data.Models
{
    public class Attendance
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; } = null!;
        public ApplicationUser Employee { get; set; } = null!;
        public DateOnly Date { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public TimeSpan? TotalHoursWorked { get; set; }

        public bool IsPresent { get; set; }
        public string? Comment { get; set; }
    }
}
