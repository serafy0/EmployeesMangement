namespace EmployeeManagementBackend.DTOs.Attendance
{
    public class AttendanceSummaries
    {
        public int TotalEmployees { get; set; }
        public int EmployeesPresentToday { get; set; }
        public double AverageHoursPerEmployee { get; set; }

    }
}
