using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MetroVerify360.Models
{
    public enum UserRole
    {
        Applicant = 1,
        Officer = 2,
        Admin = 3
    }

    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(150), EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(200)]
        public string? Organization { get; set; }

        [MaxLength(100)]
        public string? Designation { get; set; }

        [MaxLength(50)]
        public string? BadgeNumber { get; set; }

        [MaxLength(100)]
        public string? JurisdictionZone { get; set; }

        [MaxLength(300)]
        public string? Address { get; set; }

        public string? AvatarUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [JsonIgnore]
        public ICollection<Instrument> Instruments { get; set; } = new List<Instrument>();

        [JsonIgnore]
        public ICollection<Application> Applications { get; set; } = new List<Application>();

        [JsonIgnore]
        public ICollection<OfficerAssignment> AssignedInspections { get; set; } = new List<OfficerAssignment>();

        [JsonIgnore]
        public ICollection<Inspection> ConductedInspections { get; set; } = new List<Inspection>();

        [JsonIgnore]
        public ICollection<Certificate> IssuedCertificates { get; set; } = new List<Certificate>();

        [JsonIgnore]
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
