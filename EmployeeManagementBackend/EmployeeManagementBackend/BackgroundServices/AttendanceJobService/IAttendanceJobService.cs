namespace EmployeeManagementBackend.BackgroundServices.AttendanceJobService
{
    public interface IAttendanceJobService
    {
        Task AutoCheckoutAsync(int attendanceId);
        Task CreateMissingAttendancesForTodayAsync();
        Task CreateMissingAttendancesForDateAsync(DateOnly date);

    }
}
