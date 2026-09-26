using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MetroVerify360.Models
{
    public static class ApplicationStatuses
    {
        public const string Draft = "Draft";
        public const string Submitted = "Submitted";
        public const string UnderReview = "UnderReview";
        public const string Assigned = "Assigned";
        public const string InspectionScheduled = "InspectionScheduled";
        public const string InspectionCompleted = "InspectionCompleted";
        public const string Approved = "Approved";
        public const string Rejected = "Rejected";
        public const string ReinspectionRequired = "ReinspectionRequired";
        public const string CertificateGenerated = "CertificateGenerated";
    }

    public class Application
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required, MaxLength(50)]
        public string ApplicationNumber { get; set; } = string.Empty; // e.g. APP-2026-0001

        [Required]
        public string InstrumentId { get; set; } = string.Empty;

        [ForeignKey(nameof(InstrumentId))]
        public Instrument? Instrument { get; set; }

        [Required]
        public string OwnerId { get; set; } = string.Empty;

        [ForeignKey(nameof(OwnerId))]
        public User? Owner { get; set; }

        [Required, MaxLength(50)]
        public string Status { get; set; } = ApplicationStatuses.Submitted;

        [MaxLength(20)]
        public string Priority { get; set; } = "Normal"; // Normal, High, Urgent

        [Column(TypeName = "decimal(18,2)")]
        public decimal FeeAmount { get; set; } = 1000.00m;

        [MaxLength(20)]
        public string PaymentStatus { get; set; } = "Paid"; // Paid, Pending, Exempt

        public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;

        public DateTime? ScheduledInspectionDate { get; set; }

        public DateTime? CompletedDate { get; set; }

        public DateTime? ApprovalDate { get; set; }

        public string? RejectionReason { get; set; }

        public string? TrackingStepsJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [JsonIgnore]
        public ICollection<OfficerAssignment> Assignments { get; set; } = new List<OfficerAssignment>();

        [JsonIgnore]
        public ICollection<Inspection> Inspections { get; set; } = new List<Inspection>();

        [JsonIgnore]
        public Certificate? Certificate { get; set; }
    }
}
