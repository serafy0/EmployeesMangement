namespace EmployeeManagementBackend.BackgroundServices.AttendanceJobService
{
    public interface IAttendanceJobService
    {
        Task AutoCheckoutAsync(int attendanceId);
    }
}
