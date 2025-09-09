using EmployeeManagementBackend.DTOs.Attendance;
using EmployeeManagementBackend.Data.Models;


namespace EmployeeManagementBackend.Data.Repos.Attendance
{
    public interface IAttendanceRepository
    {

        Task<Models.Attendance?> GetByEmployeeAndDateAsync(string employeeId, DateOnly date);
        Task AddAsync(Models.Attendance attendance);
        Task UpdateAsync(Models.Attendance attendance);
        Task SaveChangesAsync();

        Task<(IEnumerable<AttendanceDTO> Data, int TotalCount)> GetDailyAttendanceAsync(DateOnly date, int pageIndex, int pageSize);
        Task<(IEnumerable<object> Data, int TotalCount)> GetAllWeeklyHoursAsync(DateOnly startDate, DateOnly endDate, int pageIndex, int pageSize);
        Task<(IEnumerable<object> Data, int TotalCount)> GetEmployeeHistoryAsync(string employeeId, int pageIndex, int pageSize);
        Task<IEnumerable<Models.Attendance>> GetAttendancesInRangeAsync(DateOnly startDate, DateOnly endDate);



        Task<AttendanceSummaries> GetAttendanceSummariesAsync(DateOnly today);

    }
}
