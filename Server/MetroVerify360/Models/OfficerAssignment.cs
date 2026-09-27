using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MetroVerify360.Models
{
    public class OfficerAssignment
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ApplicationId { get; set; } = string.Empty;

        [ForeignKey(nameof(ApplicationId))]
        [JsonIgnore]
        public Application? Application { get; set; }

        [Required]
        public string OfficerId { get; set; } = string.Empty;

        [ForeignKey(nameof(OfficerId))]
        public User? Officer { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

        public DateTime? ScheduledInspectionDate { get; set; }

        [MaxLength(300)]
        public string? Location { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // Active, Completed, Reassigned, Cancelled

        public string? Remarks { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
