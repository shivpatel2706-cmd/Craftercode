using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MetroVerify360.Models
{
    public class Instrument
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string OwnerId { get; set; } = string.Empty;

        [ForeignKey(nameof(OwnerId))]
        [JsonIgnore]
        public User? Owner { get; set; }

        [Required, MaxLength(200)]
        public string InstrumentName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string InstrumentType { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Manufacturer { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ModelNumber { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string SerialNumber { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Capacity { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string AccuracyClass { get; set; } = string.Empty;

        public int YearOfManufacture { get; set; }

        [Required, MaxLength(300)]
        public string InstallationLocation { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string PurposeOfUse { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? PreviousCertificateNumber { get; set; }

        public DateTime? PreviousVerificationDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Under Verification"; // Active, Under Verification, Pending Re-verification, Expired, Decommissioned

        public string? DocumentUrlsJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [JsonIgnore]
        public ICollection<Application> Applications { get; set; } = new List<Application>();

        [JsonIgnore]
        public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    }
}
