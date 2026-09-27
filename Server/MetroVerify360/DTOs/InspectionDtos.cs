using System.ComponentModel.DataAnnotations;

namespace MetroVerify360.DTOs
{
    public class CreateInspectionMeasurementDto
    {
        public string LoadPoint { get; set; } = string.Empty;
        public string ReferenceValue { get; set; } = string.Empty;
        public string ObservedValue { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public string MaxPermissibleError { get; set; } = string.Empty;
        public bool IsPass { get; set; } = true;
    }

    public class CreateInspectionRequest
    {
        [Required]
        public string ApplicationId { get; set; } = string.Empty;

        public DateTime? InspectionDate { get; set; }
        public string InstrumentCondition { get; set; } = "Good";
        public bool ManufacturerVerified { get; set; } = true;
        public bool SerialNumberVerified { get; set; } = true;
        public string SealCondition { get; set; } = "Intact";
        public string DisplayCondition { get; set; } = "Clear & Readable";
        public string AccuracyResult { get; set; } = "Pass";
        public string ZeroError { get; set; } = "0.0 g";
        public string RepeatabilityResult { get; set; } = "Satisfactory (Range < 1 e)";
        public string ReferenceStandard { get; set; } = "OIML Class M1 Standard Weights";
        public string ObservedMeasurement { get; set; } = "50.00 kg on 50.00 kg Standard";
        public string PermissibleError { get; set; } = "+/- 20 g";

        [Required]
        public string Result { get; set; } = "PASS"; // PASS, FAIL, REQUIRES_REINSPECTION

        public string? Remarks { get; set; }
        public string? LeadSealTagNumber { get; set; }
        public string? PhotoUrlsJson { get; set; }
        public string Status { get; set; } = "Completed";

        public List<CreateInspectionMeasurementDto>? Measurements { get; set; }
    }

    public class UpdateInspectionRequest
    {
        public string? InstrumentCondition { get; set; }
        public bool? ManufacturerVerified { get; set; }
        public bool? SerialNumberVerified { get; set; }
        public string? SealCondition { get; set; }
        public string? DisplayCondition { get; set; }
        public string? AccuracyResult { get; set; }
        public string? ZeroError { get; set; }
        public string? RepeatabilityResult { get; set; }
        public string? ReferenceStandard { get; set; }
        public string? ObservedMeasurement { get; set; }
        public string? PermissibleError { get; set; }
        public string? Result { get; set; }
        public string? Remarks { get; set; }
        public string? LeadSealTagNumber { get; set; }
        public string? PhotoUrlsJson { get; set; }
        public string? Status { get; set; }
    }

    public class InspectionDto
    {
        public string Id { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = string.Empty;
        public string OfficerId { get; set; } = string.Empty;
        public string OfficerName { get; set; } = string.Empty;
        public string OfficerBadge { get; set; } = string.Empty;
        public DateTime InspectionDate { get; set; }
        public string InstrumentCondition { get; set; } = string.Empty;
        public bool ManufacturerVerified { get; set; }
        public bool SerialNumberVerified { get; set; }
        public string SealCondition { get; set; } = string.Empty;
        public string DisplayCondition { get; set; } = string.Empty;
        public string AccuracyResult { get; set; } = string.Empty;
        public string ZeroError { get; set; } = string.Empty;
        public string RepeatabilityResult { get; set; } = string.Empty;
        public string ReferenceStandard { get; set; } = string.Empty;
        public string ObservedMeasurement { get; set; } = string.Empty;
        public string PermissibleError { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public string? LeadSealTagNumber { get; set; }
        public string? PhotoUrlsJson { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<CreateInspectionMeasurementDto> Measurements { get; set; } = new List<CreateInspectionMeasurementDto>();
    }
}
