using EmployeeManagementBackend.BackgroundServices.AttendanceJobService;
using EmployeeManagementBackend.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TextingBackendApi.Data.Context;

public class AttendanceJobService : IAttendanceJobService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AttendanceJobService> _logger;
    private static readonly TimeSpan AutoCheckoutOffset = TimeSpan.FromHours(8);

    public AttendanceJobService(ApplicationDbContext db, ILogger<AttendanceJobService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task AutoCheckoutAsync(int attendanceId)
    {
        var attendance = await _db.Attendances.FirstOrDefaultAsync(a => a.Id == attendanceId);
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

        // Plan checkout at CheckIn + 8 hours (deterministic). If job runs early use now instead.
        var plannedCheckoutUtc = attendance.CheckInTime.Value.Add(AutoCheckoutOffset);
        var checkoutUtc = plannedCheckoutUtc <= DateTime.UtcNow ? plannedCheckoutUtc : DateTime.UtcNow;

        attendance.CheckOutTime = checkoutUtc;
        attendance.TotalHoursWorked = attendance.CheckOutTime.Value - attendance.CheckInTime.Value;
        //attendance.AutoCheckoutJobId = null; 

        await _db.SaveChangesAsync();
        _logger.LogInformation("AutoCheckout: attendance {Id} auto-checked-out at {Time}", attendanceId, checkoutUtc);
    }
}
