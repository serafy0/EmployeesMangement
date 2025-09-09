using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagementBackend.DTOs.Attendance
{
    public class AttendanceDTO
    {
        public string EmployeeId { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }

        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public bool IsPresent { get; set; }



    }

}
