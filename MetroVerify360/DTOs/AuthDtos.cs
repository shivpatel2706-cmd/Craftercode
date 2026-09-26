using System.ComponentModel.DataAnnotations;
using MetroVerify360.Models;

namespace MetroVerify360.DTOs
{
    public class RegisterRequest
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Applicant;

        public string? Phone { get; set; }
        public string? Organization { get; set; }
        public string? Designation { get; set; }
        public string? BadgeNumber { get; set; }
        public string? JurisdictionZone { get; set; }
        public string? Address { get; set; }
    }

    public class LoginRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = new UserDto();
        public DateTime ExpiresAt { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Organization { get; set; }
        public string? Designation { get; set; }
        public string? BadgeNumber { get; set; }
        public string? JurisdictionZone { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Organization { get; set; }
        public string? Designation { get; set; }
        public string? BadgeNumber { get; set; }
        public string? JurisdictionZone { get; set; }
        public string? Address { get; set; }
        public bool? IsActive { get; set; }
    }
}
