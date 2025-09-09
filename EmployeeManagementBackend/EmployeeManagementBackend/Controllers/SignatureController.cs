using EmployeeManagementBackend.Data.Models;
using EmployeeManagementBackend.DTOs.Employees;
using EmployeeManagementBackend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SignatureController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    // max 2 MB
    private const long MaxFileBytes = 2 * 1024 * 1024;
    private static readonly string[] AllowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".svg" };

    public SignatureController(UserManager<ApplicationUser> userManager, IWebHostEnvironment env, IConfiguration config)
    {
        _userManager = userManager;
        _env = env;
        _config = config;
    }

    // Get the current user's signature URL (or null)
    [HttpGet("me")]
    [Authorize(Roles = Roles.Employee)]
    public async Task<IActionResult> GetMySignature()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        return Ok(new { signatureUrl = user.ElectronicSignature });
    }

    [HttpGet("{userId}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> GetUserSignature(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();
        return Ok(new { signatureUrl = user.ElectronicSignature });
    }

    [HttpPost]
    public async Task<IActionResult> UploadSignature([FromQuery] string? userId = null, IFormFile? file = null)
    {
        var requester = await _userManager.GetUserAsync(User);
        if (requester == null) return Unauthorized();

        // Decide target user
        ApplicationUser target;
        if (!string.IsNullOrEmpty(userId))
        {
            if (!User.IsInRole(Roles.Admin)) return Forbid();
            target = await _userManager.FindByIdAsync(userId);
            if (target == null) return NotFound();
        }
        else
        {
            target = requester;
        }

        if (file == null && !Request.HasFormContentType)
        {
            return BadRequest(new { message = "No file provided. Use multipart/form-data or send base64 payload to /base64." });
        }

        if (file == null)
        {
            return BadRequest(new { message = "File is required." });
        }

        if (file.Length == 0 || file.Length > MaxFileBytes)
            return BadRequest(new { message = $"File must be >0 and <= {MaxFileBytes} bytes." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (Array.IndexOf(AllowedExtensions, ext) < 0)
            return BadRequest(new { message = $"Invalid file type. Allowed: {string.Join(", ", AllowedExtensions)}" });

        // ensure dir
        var sigDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "signatures");
        Directory.CreateDirectory(sigDir);

        if (!string.IsNullOrEmpty(target.ElectronicSignature) && Uri.TryCreate(target.ElectronicSignature, UriKind.Absolute, out var oldUri))
        {
            var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            if (oldUri.AbsolutePath.StartsWith("/signatures/", StringComparison.OrdinalIgnoreCase))
            {
                var oldFile = Path.Combine(wwwroot, oldUri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(oldFile))
                {
                    try { System.IO.File.Delete(oldFile); } catch { /* log if desired */ }
                }
            }
        }

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(sigDir, fileName);
        using (var fs = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(fs);
        }

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var url = $"{baseUrl}/signatures/{fileName}";

        target.ElectronicSignature = url;
        var res = await _userManager.UpdateAsync(target);
        if (!res.Succeeded) return StatusCode(500, new { message = "Failed to save signature" });

        return Ok(new { signatureUrl = url });
    }

    [HttpPost("base64")]
    public async Task<IActionResult> UploadBase64([FromBody] Base64SignatureRequest request)
    {
        var requester = await _userManager.GetUserAsync(User);
        if (requester == null) return Unauthorized();

        ApplicationUser target;
        if (!string.IsNullOrEmpty(request.UserId))
        {
            if (!User.IsInRole(Roles.Admin)) return Forbid();
            target = await _userManager.FindByIdAsync(request.UserId);
            if (target == null) return NotFound();
        }
        else
        {
            target = requester;
        }

        if (string.IsNullOrWhiteSpace(request.Base64)) return BadRequest();

        var commaIndex = request.Base64.IndexOf(',');
        var data = request.Base64;
        var metadata = string.Empty;
        if (commaIndex >= 0)
        {
            metadata = request.Base64.Substring(0, commaIndex);
            data = request.Base64.Substring(commaIndex + 1);
        }

        byte[] bytes;
        try
        {
            bytes = Convert.FromBase64String(data);
        }
        catch
        {
            return BadRequest(new { message = "Invalid base64 data" });
        }

        if (bytes.Length > MaxFileBytes) return BadRequest(new { message = "File too large" });

        string ext = ".png";
        if (metadata.Contains("image/jpeg") || metadata.Contains("image/jpg")) ext = ".jpg";
        else if (metadata.Contains("image/svg+xml")) ext = ".svg";

        var sigDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "signatures");
        Directory.CreateDirectory(sigDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(sigDir, fileName);
        await System.IO.File.WriteAllBytesAsync(filePath, bytes);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var url = $"{baseUrl}/signatures/{fileName}";

        target.ElectronicSignature = url;
        var res = await _userManager.UpdateAsync(target);
        if (!res.Succeeded) return StatusCode(500, new { message = "Failed to save signature" });

        return Ok(new { signatureUrl = url });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteSignature([FromQuery] string? userId = null)
    {
        var requester = await _userManager.GetUserAsync(User);
        if (requester == null) return Unauthorized();

        ApplicationUser target;
        if (!string.IsNullOrEmpty(userId))
        {
            if (!User.IsInRole(Roles.Admin)) return Forbid();
            target = await _userManager.FindByIdAsync(userId);
            if (target == null) return NotFound();
        }
        else
        {
            target = requester;
        }

        if (string.IsNullOrEmpty(target.ElectronicSignature)) return NotFound(new { message = "No signature found" });

        if (Uri.TryCreate(target.ElectronicSignature, UriKind.Absolute, out var uri))
        {
            var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            if (uri.AbsolutePath.StartsWith("/signatures/", StringComparison.OrdinalIgnoreCase))
            {
                var filePath = Path.Combine(wwwroot, uri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath); 
                }
            }
        }

        target.ElectronicSignature = null;
        var res = await _userManager.UpdateAsync(target);
        if (!res.Succeeded) return StatusCode(500, new { message = "Failed to delete signature" });

        return Ok(new { message = "Signature deleted" });
    }

    
}
