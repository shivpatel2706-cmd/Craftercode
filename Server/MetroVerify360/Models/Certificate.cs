using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MetroVerify360.Models
{
    public class Certificate
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required, MaxLength(100)]
        public string CertificateNumber { get; set; } = string.Empty; // e.g. CERT-2026-000001

        [Required]
        public string ApplicationId { get; set; } = string.Empty;

        [ForeignKey(nameof(ApplicationId))]
        public Application? Application { get; set; }

        [Required]
        public string InstrumentId { get; set; } = string.Empty;

        [ForeignKey(nameof(InstrumentId))]
        public Instrument? Instrument { get; set; }

        [Required]
        public string OwnerId { get; set; } = string.Empty;

        [ForeignKey(nameof(OwnerId))]
        public User? Owner { get; set; }

        public string? OfficerId { get; set; }

        [ForeignKey(nameof(OfficerId))]
        public User? Officer { get; set; }

        public DateTime VerificationDate { get; set; } = DateTime.UtcNow;

        public DateTime ExpiryDate { get; set; } = DateTime.UtcNow.AddYears(1);

        [Required, MaxLength(50)]
        public string Status { get; set; } = "VALID"; // VALID, EXPIRED, REVOKED

        [Required, MaxLength(300)]
        public string QrVerificationToken { get; set; } = string.Empty;

        public string? ReportPath { get; set; }

        [MaxLength(200)]
        public string? DigitalSignatureHash { get; set; }

        [MaxLength(100)]
        public string? SealTagNumber { get; set; }

        [MaxLength(200)]
        public string IssuingAuthority { get; set; } = "Directorate of Legal Metrology, Government of India";

        public string? RevocationReason { get; set; }

        public DateTime? RevocationDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
