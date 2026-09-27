using System.ComponentModel.DataAnnotations;

namespace MetroVerify360.DTOs
{
    public class CreateInstrumentRequest
    {
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

        public string? PreviousCertificateNumber { get; set; }
        public DateTime? PreviousVerificationDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? DocumentUrlsJson { get; set; }
    }

    public class UpdateInstrumentRequest
    {
        public string? InstrumentName { get; set; }
        public string? InstrumentType { get; set; }
        public string? Manufacturer { get; set; }
        public string? ModelNumber { get; set; }
        public string? Capacity { get; set; }
        public string? AccuracyClass { get; set; }
        public int? YearOfManufacture { get; set; }
        public string? InstallationLocation { get; set; }
        public string? PurposeOfUse { get; set; }
        public string? Status { get; set; }
    }

    public class InstrumentDto
    {
        public string Id { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string InstrumentName { get; set; } = string.Empty;
        public string InstrumentType { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public string ModelNumber { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string Capacity { get; set; } = string.Empty;
        public string AccuracyClass { get; set; } = string.Empty;
        public int YearOfManufacture { get; set; }
        public string InstallationLocation { get; set; } = string.Empty;
        public string PurposeOfUse { get; set; } = string.Empty;
        public string? PreviousCertificateNumber { get; set; }
        public DateTime? PreviousVerificationDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? DocumentUrlsJson { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
