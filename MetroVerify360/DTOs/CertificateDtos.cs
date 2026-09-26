namespace MetroVerify360.DTOs
{
    public class CertificateDto
    {
        public string Id { get; set; } = string.Empty;
        public string CertificateNumber { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string InstrumentId { get; set; } = string.Empty;
        public string InstrumentName { get; set; } = string.Empty;
        public string InstrumentType { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string Capacity { get; set; } = string.Empty;
        public string AccuracyClass { get; set; } = string.Empty;

        public string OwnerId { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string InstallationLocation { get; set; } = string.Empty;

        public string? OfficerId { get; set; }
        public string? OfficerName { get; set; }
        public string? OfficerBadge { get; set; }

        public DateTime VerificationDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = string.Empty; // VALID, EXPIRED, REVOKED
        public string QrVerificationToken { get; set; } = string.Empty;
        public string? ReportPath { get; set; }
        public string? DigitalSignatureHash { get; set; }
        public string? SealTagNumber { get; set; }
        public string IssuingAuthority { get; set; } = string.Empty;
        public string? RevocationReason { get; set; }
        public DateTime? RevocationDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PublicVerifyCertificateResponse
    {
        public bool Found { get; set; }
        public string? Message { get; set; }
        public string? CertificateNumber { get; set; }
        public string? InstrumentName { get; set; }
        public string? SerialNumber { get; set; }
        public string? VerificationDate { get; set; }
        public string? ExpiryDate { get; set; }
        public string? Status { get; set; }
        public string? IssuingAuthority { get; set; }
        public string? SealTagNumber { get; set; }
        public string? DigitalSignatureHash { get; set; }
    }

    public class RevokeCertificateRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class NotificationDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string? CertificateId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string NotificationType { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ApplicantDashboardDto
    {
        public int TotalInstruments { get; set; }
        public int PendingApplications { get; set; }
        public int ApprovedCertificates { get; set; }
        public int ExpiringCertificates { get; set; }
    }

    public class OfficerDashboardDto
    {
        public int AssignedInspections { get; set; }
        public int TodaysInspections { get; set; }
        public int PendingVerification { get; set; }
        public int CompletedInspections { get; set; }
    }

    public class AdminDashboardDto
    {
        public int TotalInstruments { get; set; }
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int InspectionsToday { get; set; }
        public int ApprovedCertificates { get; set; }
        public int ExpiredCertificates { get; set; }
        public int RenewalsDue { get; set; }
    }
}
