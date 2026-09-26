using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MetroVerify360.Models
{
    public class Inspection
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

        public DateTime InspectionDate { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string InstrumentCondition { get; set; } = "Good"; // Excellent, Good, Fair, Damaged

        public bool ManufacturerVerified { get; set; } = true;

        public bool SerialNumberVerified { get; set; } = true;

        [MaxLength(50)]
        public string SealCondition { get; set; } = "Intact"; // Intact, Broken, Missing, Tampered, Not Applicable (New)

        [MaxLength(50)]
        public string DisplayCondition { get; set; } = "Clear & Readable";

        [MaxLength(50)]
        public string AccuracyResult { get; set; } = "Pass";

        [MaxLength(100)]
        public string ZeroError { get; set; } = "0.0 g";

        [MaxLength(100)]
        public string RepeatabilityResult { get; set; } = "Satisfactory (Range < 1 e)";

        [MaxLength(200)]
        public string ReferenceStandard { get; set; } = "OIML Class M1 Standard Weights";

        [MaxLength(200)]
        public string ObservedMeasurement { get; set; } = "50.00 kg on 50.00 kg Standard";

        [MaxLength(100)]
        public string PermissibleError { get; set; } = "+/- 20 g";

        [Required, MaxLength(50)]
        public string Result { get; set; } = "PASS"; // PASS, FAIL, REQUIRES_REINSPECTION

        public string? Remarks { get; set; }

        [MaxLength(100)]
        public string? LeadSealTagNumber { get; set; }

        public string? PhotoUrlsJson { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Completed"; // Draft, Submitted, Completed

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Measurements
        public ICollection<InspectionMeasurement> Measurements { get; set; } = new List<InspectionMeasurement>();
    }
}
