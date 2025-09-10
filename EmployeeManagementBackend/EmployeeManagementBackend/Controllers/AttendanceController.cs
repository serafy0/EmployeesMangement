// Controllers/AttendanceController.cs
using EmployeeManagementBackend.BackgroundServices.AttendanceJobService;
using EmployeeManagementBackend.Data.Models;
using EmployeeManagementBackend.Data.Repos.Attendance;
using EmployeeManagementBackend.Utils;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public AttendanceController(
            IAttendanceRepository attendanceRepo,
            UserManager<ApplicationUser> userManager,
            IBackgroundJobClient backgroundJobClient
        )
        {
            _attendanceRepo = attendanceRepo;
            _userManager = userManager;
            _backgroundJobClient = backgroundJobClient;
        }

        [HttpPost("checkin")]
        [Authorize(Roles = Roles.Employee)]
        public async Task<IActionResult> CheckIn()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var cairoNow = TimeHelper.GetCairoNow();
            var today = DateOnly.FromDateTime(cairoNow);
            //var checkInStart = new TimeSpan(7, 30, 0);
            //var checkInEnd = new TimeSpan(9, 0, 0);
            //TODO : Change back to 7:00 - 9:00
            var checkInStart = new TimeSpan(1, 0, 0);
            var checkInEnd = new TimeSpan(10, 0, 0);

            if (cairoNow.TimeOfDay < checkInStart || cairoNow.TimeOfDay > checkInEnd)
            {
                var startStr = checkInStart.ToString(@"hh\:mm");
                var endStr = checkInEnd.ToString(@"hh\:mm");
                return BadRequest(
                    new
                    {
                        message = $"Check-in is only allowed between {startStr} and {endStr} (Cairo time).",
                    }
                );
            }

            var attendance = await _attendanceRepo.GetByEmployeeAndDateAsync(user.Id, today);
            if (attendance != null && attendance.CheckInTime != null)
                return BadRequest(new { message = "You have already checked in today." });

            if (attendance == null)
            {
                attendance = new Attendance
                {
                    EmployeeId = user.Id,
                    Date = today,
                    IsPresent = true,
                };
                await _attendanceRepo.AddAsync(attendance);
            }

            attendance.CheckInTime = DateTime.UtcNow;
            attendance.IsPresent = true;
            //var jobDelay = TimeSpan.FromHours(8);
            //TODO : Change back to 8 hours
            var jobDelay = TimeSpan.FromSeconds(30);

            _backgroundJobClient.Schedule<IAttendanceJobService>(
                svc => svc.AutoCheckoutAsync(attendance.Id),
                jobDelay
            );

            await _attendanceRepo.SaveChangesAsync();

            return Ok(
                new
                {
                    message = "Checked in successfully",
                    checkInTimeUtc = attendance.CheckInTime,
                    checkInTimeCairo = TimeHelper.ConvertUtcToCairo(attendance.CheckInTime.Value),
                }
            );
        }

        [HttpPost("checkout")]
        [Authorize(Roles = Roles.Employee)]
        public async Task<IActionResult> CheckOut()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var cairoNow = TimeHelper.GetCairoNow();
            var today = DateOnly.FromDateTime(cairoNow);

            var attendance = await _attendanceRepo.GetByEmployeeAndDateAsync(user.Id, today);
            if (attendance == null || attendance.CheckInTime == null)
                return BadRequest(new { message = "You have not checked in today." });

            if (attendance.CheckOutTime != null)
                return BadRequest(new { message = "You have already checked out today." });

            var checkoutUtc = DateTime.UtcNow;
            attendance.CheckOutTime = checkoutUtc;

            attendance.TotalHoursWorked =
                attendance.CheckOutTime.Value - attendance.CheckInTime.Value;

            await _attendanceRepo.UpdateAsync(attendance);
            await _attendanceRepo.SaveChangesAsync();

            return Ok(
                new
                {
                    message = "Checked out successfully",
                    checkOutTimeUtc = attendance.CheckOutTime,
                    checkOutTimeCairo = TimeHelper.ConvertUtcToCairo(attendance.CheckOutTime.Value),
                    totalHours = Math.Round(attendance.TotalHoursWorked?.TotalHours ?? 0, 2),
                }
            );
        }

        [HttpGet("history")]
        [Authorize(Roles = Roles.Employee)]
        public async Task<IActionResult> GetHistory(int pageIndex = 0, int pageSize = 10)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var (data, total) = await _attendanceRepo.GetEmployeeHistoryAsync(
                user.Id,
                pageIndex,
                pageSize
            );
            return Ok(
                new
                {
                    Data = data,
                    PageIndex = pageIndex,
                    PageSize = pageSize,
                    TotalCount = total,
                }
            );
        }

        [HttpGet("weekly-summary-for-employee")]
        [Authorize(Roles = Roles.Employee)]
        public async Task<IActionResult> GetWeeklySummary(DateTime? startDate = null)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            if (startDate == null)
            {
                // Start from Sunday of the current week in Cairo time
                var cairoNow = TimeHelper.GetCairoNow();
                startDate = cairoNow.Date.AddDays(-(int)cairoNow.DayOfWeek);
            }

            var startDateOnly = DateOnly.FromDateTime(startDate.Value);
            var endDateOnly = startDateOnly.AddDays(7);

            var attendances = (
                await _attendanceRepo.GetAttendancesInRangeAsync(startDateOnly, endDateOnly)
            )
                .Where(a => a.EmployeeId == user.Id)
                .ToList();

            var daysAttended = attendances.Count(a => a.IsPresent);
            double totalHours = attendances
                .Where(a => a.TotalHoursWorked != null)
                .Sum(a => a.TotalHoursWorked!.Value.TotalHours);

            return Ok(
                new
                {
                    StartDate = startDateOnly,
                    EndDate = endDateOnly.AddDays(-1),
                    DaysAttended = daysAttended,
                    TotalHours = Math.Round(totalHours, 2),
                    Details = attendances.Select(a => new
                    {
                        Date = a.Date,
                        CheckInTime = a.CheckInTime.HasValue
                            ? TimeHelper.ConvertUtcToCairo(a.CheckInTime.Value)
                            : (DateTime?)null,
                        CheckOutTime = a.CheckOutTime.HasValue
                            ? TimeHelper.ConvertUtcToCairo(a.CheckOutTime.Value)
                            : (DateTime?)null,
                        Hours = a.TotalHoursWorked != null
                            ? Math.Round(a.TotalHoursWorked.Value.TotalHours, 2)
                            : 0,
                    }),
                }
            );
        }

        [HttpGet("daily")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetDailyAttendance(
            DateTime? date = null,
            int pageIndex = 0,
            int pageSize = 10
        )
        {
            if (date == null)
                date = TimeHelper.GetCairoNow();
            var targetDate = DateOnly.FromDateTime(date.Value);

            var (data, total) = await _attendanceRepo.GetDailyAttendanceAsync(
                targetDate,
                pageIndex,
                pageSize
            );

            return Ok(
                new
                {
                    Data = data,
                    PageIndex = pageIndex,
                    PageSize = pageSize,
                    TotalCount = total,
                }
            );
        }

        [HttpGet("all-weekly-hours")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetAllWeeklyHours(
            DateTime? startDate = null,
            int pageIndex = 0,
            int pageSize = 10
        )
        {
            if (startDate == null)
            {
                var cairoNow = TimeHelper.GetCairoNow();
                // Start from Sunday of the current week
                startDate = cairoNow.Date.AddDays(-(int)cairoNow.DayOfWeek);
            }

            var startDateOnly = DateOnly.FromDateTime(startDate.Value);
            var endDateOnly = startDateOnly.AddDays(7);

            var (data, total) = await _attendanceRepo.GetAllWeeklyHoursAsync(
                startDateOnly,
                endDateOnly,
                pageIndex,
                pageSize
            );

            return Ok(
                new
                {
                    StartDate = startDateOnly,
                    EndDate = endDateOnly.AddDays(-1),
                    Data = data,
                    PageIndex = pageIndex,
                    PageSize = pageSize,
                    TotalCount = total,
                }
            );
        }

        [HttpGet("attendance-summaries")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetAdminInsights()
        {
            var cairoNow = TimeHelper.GetCairoNow();
            var today = DateOnly.FromDateTime(cairoNow);

            var insights = await _attendanceRepo.GetAttendanceSummariesAsync(today);

            return Ok(insights);
        }

        [HttpGet("is-checked-in")]
        [Authorize(Roles = Roles.Employee)]
        public async Task<IActionResult> IsCheckedInToday()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var cairoNow = TimeHelper.GetCairoNow();
            var today = DateOnly.FromDateTime(cairoNow);

            var attendance = await _attendanceRepo.GetByEmployeeAndDateAsync(user.Id, today);
            var isCheckedIn = attendance != null && attendance.CheckInTime != null;

            return Ok(
                new
                {
                    isCheckedIn = isCheckedIn,
                    checkInTimeUtc = attendance?.CheckInTime,
                    checkInTimeCairo = attendance?.CheckInTime.HasValue == true
                        ? TimeHelper.ConvertUtcToCairo(attendance!.CheckInTime.Value)
                        : (DateTime?)null,
                }
            );
        }
    }
}
