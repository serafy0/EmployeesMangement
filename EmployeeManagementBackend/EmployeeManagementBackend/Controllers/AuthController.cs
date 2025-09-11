using EmployeeManagementBackend.Data.Models;
using EmployeeManagementBackend.DTOs.Auth;
using EmployeeManagementBackend.DTOs.User;
using EmployeeManagementBackend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using TextingBackendApi.Helpers;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtHandler _jwtHandler;
        private readonly string _frontendUrl;
        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtHandler jwtHandler,
            IConfiguration configuration
        )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtHandler = jwtHandler;
            _frontendUrl = configuration["FrontEnd:Url"]?.TrimEnd('/') ?? "http://localhost:4200";
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO request)
        {
            var user = await _userManager.FindByNameAsync(request.PhoneNumber);
            if (user == null)
            {
                return Ok(
                    new LoginResponseDTO { Success = false, Message = "Invalid credentials" }
                );
            }

            var result = await _signInManager.CheckPasswordSignInAsync(
                user,
                request.Password,
                false
            );
            if (!result.Succeeded)
            {
                return Ok(
                    new LoginResponseDTO { Success = false, Message = "Invalid credentials" }
                );
            }

            var token = await _jwtHandler.GetTokenAsync(user);
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(
                new LoginResponseDTO
                {
                    Success = true,
                    Message = "Login successful",
                    Token = new JwtSecurityTokenHandler().WriteToken(token),
                    ExpirationTime = token.ValidTo,
                    User = new UserDTO
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        PhoneNumber = user.PhoneNumber!,
                        NationalId = user.NationalId!,
                        Roles = roles.ToList(),
                        IsPasswordSet = user.IsPasswordSet,
                    },
                }
            );
        }

        [HttpPost("set-employee-password")]
        public async Task<ActionResult<LoginResponseDTO>> SetPassword(
            [FromBody] SetEmployeePasswordRequest request
        )
        {
            var user = await _userManager.FindByNameAsync(request.PhoneNumber);
            if (user == null)
            {
                return Ok(new LoginResponseDTO { Success = false, Message = "User not found" });
            }

            if (user.IsPasswordSet)
            {
                return Ok(
                    new LoginResponseDTO
                    {
                        Success = false,
                        Message = "Password already set. Please use login instead.",
                    }
                );
            }

            var result = await _userManager.ResetPasswordAsync(
                user,
                request.ResetToken,
                request.NewPassword
            );

            if (result.Succeeded)
            {
                user.IsPasswordSet = true;
                await _userManager.UpdateAsync(user);

                var jwtToken = await _jwtHandler.GetTokenAsync(user);
                var roles = await _userManager.GetRolesAsync(user);

                return Ok(
                    new LoginResponseDTO
                    {
                        Success = true,
                        Message = "Password set successfully",
                        Token = new JwtSecurityTokenHandler().WriteToken(jwtToken),
                        ExpirationTime = jwtToken.ValidTo,
                        User = new UserDTO
                        {
                            Id = user.Id,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            PhoneNumber = user.PhoneNumber!,
                            NationalId = user.NationalId!,
                            Roles = roles.ToList(),
                            IsPasswordSet = user.IsPasswordSet,
                        },
                    }
                );
            }

            return Ok(
                new LoginResponseDTO
                {
                    Success = false,
                    Message =
                        "Failed to set password: "
                        + string.Join(", ", result.Errors.Select(e => e.Description)),
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
            var encodedToken = WebUtility.UrlEncode(resetToken);

            var setupPath = "/initial-setup";
            var encodedPhone = WebUtility.UrlEncode(employee.PhoneNumber);

            var setupUrl =
                $"{_frontendUrl}{setupPath}?token={encodedToken}&phone={encodedPhone}";

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
