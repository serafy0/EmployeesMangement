using System;
using System.Threading.Tasks;
using EmployeeManagementBackend.Data.Repos.Attendance;
using EmployeeManagementBackend.Utils;
using Microsoft.Extensions.Logging;

namespace EmployeeManagementBackend.BackgroundServices.AttendanceJobService
{
    public class AttendanceJobService : IAttendanceJobService
    {
        private readonly IAttendanceRepository _repo;
        private readonly ILogger<AttendanceJobService> _logger;
        private static readonly TimeSpan AutoCheckoutOffset = TimeSpan.FromHours(8);

        public AttendanceJobService(IAttendanceRepository repo, ILogger<AttendanceJobService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        public async Task CreateMissingAttendancesForTodayAsync()
        {
            var cairoNow = TimeHelper.GetCairoNow();
            var today = DateOnly.FromDateTime(cairoNow);
            await _repo.CreateMissingAttendancesForDateAsync(today);
        }

        public async Task CreateMissingAttendancesForDateAsync(DateOnly date)
        {
            await _repo.CreateMissingAttendancesForDateAsync(date);
        }

        public async Task AutoCheckoutAsync(int attendanceId)
        {
            var attendance = await _repo.GetByIdAsync(attendanceId);
            if (attendance == null)
            {
                _logger.LogWarning("AutoCheckout: attendance {Id} not found", attendanceId);
                return;
            }

            if (attendance.CheckInTime == null)
            {
                _logger.LogWarning("AutoCheckout: attendance {Id} has no CheckInTime", attendanceId);
                return;
            }

            if (attendance.CheckOutTime != null)
            {
                _logger.LogInformation("AutoCheckout: attendance {Id} already checked out", attendanceId);
                return;
            }

            var plannedCheckoutUtc = attendance.CheckInTime.Value.Add(AutoCheckoutOffset);
            var checkoutUtc = plannedCheckoutUtc <= DateTime.UtcNow ? plannedCheckoutUtc : DateTime.UtcNow;

            attendance.CheckOutTime = checkoutUtc;
            attendance.TotalHoursWorked = attendance.CheckOutTime.Value - attendance.CheckInTime.Value;

            await _repo.UpdateAsync(attendance);
            await _repo.SaveChangesAsync();

            _logger.LogInformation("AutoCheckout: attendance {Id} auto-checked-out at {Time}", attendanceId, checkoutUtc);
        }
    }
}
