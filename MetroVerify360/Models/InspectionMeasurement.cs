using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MetroVerify360.Models
{
    public class InspectionMeasurement
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string InspectionId { get; set; } = string.Empty;

        [ForeignKey(nameof(InspectionId))]
        [JsonIgnore]
        public Inspection? Inspection { get; set; }

        [MaxLength(50)]
        public string LoadPoint { get; set; } = string.Empty; // e.g. "Min (200g)", "50 kg", "Max (150 kg)"

        [MaxLength(50)]
        public string ReferenceValue { get; set; } = string.Empty; // e.g. "50.00 kg"

        [MaxLength(50)]
        public string ObservedValue { get; set; } = string.Empty; // e.g. "50.01 kg"

        [MaxLength(50)]
        public string Error { get; set; } = string.Empty; // e.g. "+0.01 kg"

        [MaxLength(50)]
        public string MaxPermissibleError { get; set; } = string.Empty; // e.g. "+/- 0.02 kg"

        public bool IsPass { get; set; } = true;
    }
}
