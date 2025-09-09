using System.Data;
using EmployeeManagementBackend.Data.Models;
using EmployeeManagementBackend.DTOs.Employees;
using EmployeeManagementBackend.DTOs.User;
using EmployeeManagementBackend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TextingBackendApi.Data.Context;
using TextingBackendApi.Helpers;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly string _frontendUrl;

        public EmployeesController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            IConfiguration configuration
        )
        {
            _userManager = userManager;
            _context = context;
            _frontendUrl = configuration["FrontEnd:Url"]?.TrimEnd('/') ?? "http://localhost:4200";
        }

        [HttpGet]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<ApiResult<ApplicationUser>>> GetEmployees(
            int pageIndex = 0,
            int pageSize = 10,
            string? sortColumn = null,
            string? sortOrder = null,
            string? filterColumn = null,
            string? filterQuery = null
        )
        {
            var employeeRole = await _context.Roles.FirstOrDefaultAsync(r =>
                r.Name == Roles.Employee
            );
            if (employeeRole == null)
            {
                return BadRequest("Employee role not found");
            }

            // Query users through the UserRoles junction table
            var employeeDtos = _context
                .Users.Where(u =>
                    _context.UserRoles.Any(ur => ur.UserId == u.Id && ur.RoleId == employeeRole.Id)
                )
                .Select(u => new EmployeeDTOForAdmins
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    NationalId = u.NationalId,
                    PhoneNumber = u.PhoneNumber,
                    IsPasswordSet = u.IsPasswordSet,
                    Age = u.Age,
                    ElectronicSignature = u.ElectronicSignature,
                });

            var result = await ApiResult<EmployeeDTOForAdmins>.CreateAsync(
                employeeDtos,
                pageIndex,
                pageSize,
                sortColumn,
                sortOrder,
                filterColumn,
                filterQuery
            );

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<object>> CreateEmployee([FromBody] EmployeeDTO employeeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if national ID already exists
            var existingUser = await _userManager.Users.FirstOrDefaultAsync(u =>
                u.NationalId == employeeDto.NationalId
            );

            if (existingUser != null)
            {
                return BadRequest(
                    new { message = "Employee with this National ID already exists" }
                );
            }

            // Check if phone number already exists
            existingUser = await _userManager.Users.FirstOrDefaultAsync(u =>
                u.PhoneNumber == employeeDto.PhoneNumber
            );

            if (existingUser != null)
            {
                return BadRequest(
                    new { message = "Employee with this phone number already exists" }
                );
            }

            var user = new ApplicationUser
            {
                UserName = employeeDto.PhoneNumber,
                PhoneNumber = employeeDto.PhoneNumber,
                FirstName = employeeDto.FirstName,
                LastName = employeeDto.LastName,
                NationalId = employeeDto.NationalId,
                Age = employeeDto.Age,
                ElectronicSignature = employeeDto.ElectronicSignature,
                IsPasswordSet = false,
            };

            var result = await _userManager.CreateAsync(user);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, Roles.Employee);

                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = System.Net.WebUtility.UrlEncode(resetToken);
                return Ok(
                    new
                    {
                        message = "Employee created successfully",
                        username = user.PhoneNumber,
                        initialSetupToken = encodedToken,
                        employee = new
                        {
                            id = user.Id,
                            username = user.PhoneNumber,
                            firstName = user.FirstName,
                            lastName = user.LastName,
                            phoneNumber = user.PhoneNumber,
                            nationalId = user.NationalId,
                            age = user.Age,
                            isPasswordSet = user.IsPasswordSet,
                            createdAt = user.CreatedAt,
                        },
                    }
                );
            }

            return BadRequest(
                new
                {
                    message = "Failed to create employee",
                    errors = result.Errors.Select(e => e.Description),
                }
            );
        }

        [HttpGet("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<ApplicationUser>> GetEmployee(string id)
        {
            var employee = await _userManager.FindByIdAsync(id);

            if (employee == null)
            {
                return NotFound(new { message = "Employee not found" });
            }
            else
            {
                var roles = await _userManager.GetRolesAsync(employee);
                if (!roles.Contains(Roles.Employee) || roles.Contains(Roles.Admin))
                {
                    return BadRequest(new { message = "Employee not found" });
                }
            }

            return Ok(employee);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult> UpdateEmployee(
            string id,
            [FromBody] EmployeeDTO employeeDto
        )
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var employee = await _userManager.FindByIdAsync(id);

            if (employee == null)
            {
                return NotFound(new { message = "Employee not found" });
            }
            else
            {
                var roles = await _userManager.GetRolesAsync(employee);
                if (!roles.Contains(Roles.Employee) || roles.Contains(Roles.Admin))
                {
                    return BadRequest(new { message = "Employee not found" });
                }
            }

            // Check if national ID already exists for another user
            var existingUser = await _userManager.Users.FirstOrDefaultAsync(u =>
                u.NationalId == employeeDto.NationalId && u.Id != id
            );

            if (existingUser != null)
            {
                return BadRequest(
                    new { message = "Another employee with this National ID already exists" }
                );
            }

            // Check if phone number already exists for another user (and update username if changed)
            if (employee.PhoneNumber != employeeDto.PhoneNumber)
            {
                existingUser = await _userManager.FindByNameAsync(employeeDto.PhoneNumber);

                if (existingUser != null)
                {
                    return BadRequest(
                        new { message = "Another employee with this phone number already exists" }
                    );
                }

                // Update username to match new phone number
                employee.UserName = employeeDto.PhoneNumber;
            }

            employee.FirstName = employeeDto.FirstName;
            employee.LastName = employeeDto.LastName;
            employee.PhoneNumber = employeeDto.PhoneNumber;
            employee.NationalId = employeeDto.NationalId;
            employee.Age = employeeDto.Age;
            employee.ElectronicSignature = employeeDto.ElectronicSignature;

            var result = await _userManager.UpdateAsync(employee);

            if (result.Succeeded)
            {
                return Ok(new { message = "Employee updated successfully", employee });
            }

            return BadRequest(
                new
                {
                    message = "Failed to update employee",
                    errors = result.Errors.Select(e => e.Description),
                }
            );
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult> DeleteEmployee(string id)
        {
            var employee = await _userManager.FindByIdAsync(id);

            if (employee == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            var result = await _userManager.DeleteAsync(employee);

            if (result.Succeeded)
            {
                return Ok(new { message = "Employee deleted successfully" });
            }

            return BadRequest(
                new
                {
                    message = "Failed to delete employee",
                    errors = result.Errors.Select(e => e.Description),
                }
            );
        }

        [HttpPost("{id}/generate-setup-token")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<object>> GenerateSetupToken(string id)
        {
            var employee = await _userManager.FindByIdAsync(id);

            if (employee == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            var roles = await _userManager.GetRolesAsync(employee);
            if (!roles.Contains(Roles.Employee) || roles.Contains(Roles.Admin))
            {
                return BadRequest(new { message = "User is not an employee" });
            }

            if (employee.IsPasswordSet)
            {
                return BadRequest(
                    new
                    {
                        message = "Employee has already set up their password. Use password reset instead.",
                    }
                );
            }

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(employee);
            var encodedToken = System.Net.WebUtility.UrlEncode(resetToken);

            var setupPath = "/initial-setup";
            var setupUrl = $"{_frontendUrl}{setupPath}?token={encodedToken}&userId={employee.Id}";

            return Ok(
                new
                {
                    message = "Setup token generated successfully",
                    employeeId = employee.Id,
                    phoneNumber = employee.PhoneNumber,
                    initialSetupToken = resetToken,
                    setupUrl = setupUrl,
                    tokenGeneratedAt = DateTime.UtcNow,
                }
            );
        }



        

    }
}
