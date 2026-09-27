using System.ComponentModel.DataAnnotations;

namespace MetroVerify360.Models
{
    public class AuditLog
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string? UserId { get; set; }

        [MaxLength(100)]
        public string? UserName { get; set; }

        [MaxLength(50)]
        public string? UserRole { get; set; }

        [Required, MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string EntityName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string EntityId { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public string? Description { get; set; }

        [MaxLength(50)]
        public string? IPAddress { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "SUCCESS"; // SUCCESS, WARNING, FAILED
    }
}
