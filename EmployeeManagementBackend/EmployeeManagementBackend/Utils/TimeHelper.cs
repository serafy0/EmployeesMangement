// Utils/TimeHelper.cs
using System;

namespace EmployeeManagementBackend.Utils
{
    public static class TimeHelper
    {
        private static readonly string[] TzCandidates = { "Egypt Standard Time", "Africa/Cairo" };

        public static DateTime GetCairoNow()
        {
            foreach (var id in TzCandidates)
            {
                try
                {
                    var tz = TimeZoneInfo.FindSystemTimeZoneById(id);
                    return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
                }
                catch { }
            }
            return DateTime.UtcNow;
        }

        public static DateOnly CairoDateOnlyNow()
            => DateOnly.FromDateTime(GetCairoNow());

        public static DateTime ConvertUtcToCairo(DateTime utc)
        {
            var utcKind = DateTime.SpecifyKind(utc, DateTimeKind.Utc);
            foreach (var id in TzCandidates)
            {
                try
                {
                    var tz = TimeZoneInfo.FindSystemTimeZoneById(id);
                    return TimeZoneInfo.ConvertTimeFromUtc(utcKind, tz);
                }
                catch { }
            }
            return utcKind.ToLocalTime();
        }
    }
}
