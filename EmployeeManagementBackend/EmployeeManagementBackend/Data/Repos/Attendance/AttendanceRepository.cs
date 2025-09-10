using EmployeeManagementBackend.DTOs.Attendance;
using EmployeeManagementBackend.Utils;
using Microsoft.EntityFrameworkCore;
using TextingBackendApi.Data.Context;

namespace EmployeeManagementBackend.Data.Repos.Attendance
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly ApplicationDbContext _context;

        public AttendanceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Models.Attendance attendance)
        {
            await _context.Attendances.AddAsync(attendance);
        }

        public async Task<Models.Attendance?> GetByEmployeeAndDateAsync(
            string employeeId,
            DateOnly date
        )
        {
            return await _context.Attendances.FirstOrDefaultAsync(a =>
                a.EmployeeId == employeeId && a.Date == date
            );
        }

        public async Task UpdateAsync(Models.Attendance attendance)
        {
            _context.Attendances.Update(attendance);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<(
            IEnumerable<AttendanceDTO> Data,
            int TotalCount
        )> GetDailyAttendanceAsync(DateOnly date, int pageIndex, int pageSize)
        {
            var query = _context
                .Attendances.Include(a => a.Employee)
                .Where(a => a.Date == date)
                .OrderByDescending(a => a.CheckInTime);

            var total = await query.CountAsync();

            var data = await query
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .Select(a => new AttendanceDTO
                {
                    EmployeeId = a.EmployeeId,
                    FirstName = a.Employee.FirstName,
                    LastName = a.Employee.LastName,
                    PhoneNumber = a.Employee.PhoneNumber ?? string.Empty,
                    CheckInTime = a.CheckInTime,
                    CheckOutTime = a.CheckOutTime,
                    IsPresent = a.IsPresent,
                })
                .ToListAsync();

            return (data, total);
        }

        public async Task<(IEnumerable<object> Data, int TotalCount)> GetAllWeeklyHoursAsync(
            DateOnly startDate,
            DateOnly endDate,
            int pageIndex,
            int pageSize
        )
        {
            var attendances = await _context
                .Attendances.Where(a => a.Date >= startDate && a.Date < endDate)
                .Select(a => new
                {
                    a.EmployeeId,
                    a.TotalHoursWorked,
                    a.IsPresent,
                })
                .ToListAsync();

            var grouped = attendances
                .GroupBy(a => a.EmployeeId)
                .Select(g => new
                {
                    EmployeeId = g.Key,
                    DaysAttended = g.Sum(x => x.IsPresent ? 1 : 0),
                    TotalHours = g.Sum(x =>
                        x.TotalHoursWorked.HasValue ? x.TotalHoursWorked.Value.TotalHours : 0.0
                    ),
                });

            var employeeIds = grouped.Select(g => g.EmployeeId).ToList();
            var users = await _context
                .Users.Where(u => employeeIds.Contains(u.Id))
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.PhoneNumber,
                })
                .ToListAsync();

            var result = grouped
                .Join(
                    users,
                    g => g.EmployeeId,
                    u => u.Id,
                    (g, u) =>
                        new
                        {
                            EmployeeId = g.EmployeeId,
                            FirstName = u.FirstName,
                            LastName = u.LastName,
                            PhoneNumber = u.PhoneNumber,
                            DaysAttended = g.DaysAttended,
                            TotalHours = Math.Round(g.TotalHours, 2),
                        }
                )
                .ToList();

            var totalCount = result.Count;
            var paged = result.Skip(pageIndex * pageSize).Take(pageSize).ToList<object>();

            return (paged, totalCount);
        }

        public async Task<(IEnumerable<object> Data, int TotalCount)> GetEmployeeHistoryAsync(
            string employeeId,
            int pageIndex,
            int pageSize
        )
        {
            var query = _context
                .Attendances.Where(a => a.EmployeeId == employeeId)
                .OrderByDescending(a => a.Date);

            var total = await query.CountAsync();

            var data = await query
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Date,
                    a.CheckInTime,
                    a.CheckOutTime,
                    a.IsPresent,
                    a.Comment,
                    a.TotalHoursWorked,
                })
                .ToListAsync();

            return (data, total);
        }

        public async Task<IEnumerable<Models.Attendance>> GetAttendancesInRangeAsync(
            DateOnly startDate,
            DateOnly endDate
        )
        {
            return await _context
                .Attendances.Where(a => a.Date >= startDate && a.Date < endDate)
                .ToListAsync();
        }

        public async Task<AttendanceSummaries> GetAttendanceSummariesAsync(
            DateOnly today
        )
        {
            var result = new AttendanceSummaries();

            var employeeRole = await _context.Roles.FirstOrDefaultAsync(r =>
                r.Name == Roles.Employee
            );
            if (employeeRole == null)
            {
                return result;
            }

            // get all employee ids
            var employeeIds = await _context
                .UserRoles.Where(ur => ur.RoleId == employeeRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            result.TotalEmployees = employeeIds.Count;

            result.EmployeesPresentToday = await _context.Attendances.CountAsync(a =>
                a.Date == today && a.IsPresent
            );

            var attendanceRows = await _context
                .Attendances.Where(a =>
                    employeeIds.Contains(a.EmployeeId) && a.TotalHoursWorked != null
                )
                .Select(a => new { a.EmployeeId, a.TotalHoursWorked })
                .ToListAsync();

            var totalHoursAll = attendanceRows
                .Where(x => x.TotalHoursWorked.HasValue)
                .Sum(x => x.TotalHoursWorked!.Value.TotalHours);

            result.AverageHoursPerEmployee =
                result.TotalEmployees > 0
                    ? Math.Round(totalHoursAll / result.TotalEmployees, 2)
                    : 0.0;


            return result;
        }
    }
}
