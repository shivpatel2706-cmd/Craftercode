using System.ComponentModel.DataAnnotations;

namespace MetroVerify360.DTOs
{
    public class CreateApplicationRequest
    {
        [Required]
        public string InstrumentId { get; set; } = string.Empty;

        public string Priority { get; set; } = "Normal";
        public decimal FeeAmount { get; set; } = 1000.00m;
        public string PaymentStatus { get; set; } = "Paid";
    }

    public class UpdateApplicationRequest
    {
        public string? Priority { get; set; }
        public string? Status { get; set; }
        public DateTime? ScheduledInspectionDate { get; set; }
    }

    public class ApproveApplicationRequest
    {
        public string? ApprovalNotes { get; set; }
    }

    public class RejectApplicationRequest
    {
        [Required]
        public string Reason { get; set; } = string.Empty;
    }

    public class ReinspectApplicationRequest
    {
        [Required]
        public string Instructions { get; set; } = string.Empty;
    }

    public class ApplicationDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;
        public string InstrumentId { get; set; } = string.Empty;
        public string InstrumentName { get; set; } = string.Empty;
        public string InstrumentType { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string Capacity { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        public string OwnerId { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string? OwnerPhone { get; set; }
        public string? OwnerEmail { get; set; }

        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public decimal FeeAmount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;

        public DateTime ApplicationDate { get; set; }
        public DateTime? ScheduledInspectionDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public DateTime? ApprovalDate { get; set; }

        public string? OfficerId { get; set; }
        public string? OfficerName { get; set; }
        public string? OfficerBadge { get; set; }

        public string? InspectionId { get; set; }
        public string? CertificateId { get; set; }
        public string? CertificateNumber { get; set; }
        public string? RejectionReason { get; set; }
        public string? TrackingStepsJson { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateAssignmentRequest
    {
        [Required]
        public string ApplicationId { get; set; } = string.Empty;

        [Required]
        public string OfficerId { get; set; } = string.Empty;

        public DateTime? ScheduledInspectionDate { get; set; }
        public string? Location { get; set; }
        public string? Remarks { get; set; }
    }

    public class UpdateAssignmentRequest
    {
        public DateTime? ScheduledInspectionDate { get; set; }
        public string? Location { get; set; }
        public string? Status { get; set; }
        public string? Remarks { get; set; }
    }

    public class OfficerAssignmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string ApplicationNumber { get; set; } = string.Empty;
        public string InstrumentName { get; set; } = string.Empty;
        public string OfficerId { get; set; } = string.Empty;
        public string OfficerName { get; set; } = string.Empty;
        public string OfficerBadge { get; set; } = string.Empty;
        public DateTime AssignedDate { get; set; }
        public DateTime? ScheduledInspectionDate { get; set; }
        public string? Location { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Remarks { get; set; }
    }
}
