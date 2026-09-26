using MetroVerify360.DTOs;
using MetroVerify360.Models;

namespace MetroVerify360.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserDto> GetCurrentUserAsync(string userId);
    }

    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(string id);
        Task<UserDto?> UpdateUserAsync(string id, UpdateUserRequest request);
        Task<bool> DeleteUserAsync(string id);
    }

    public interface IInstrumentService
    {
        Task<IEnumerable<InstrumentDto>> GetInstrumentsAsync(string? ownerId = null);
        Task<InstrumentDto?> GetInstrumentByIdAsync(string id);
        Task<InstrumentDto> CreateInstrumentAsync(string ownerId, CreateInstrumentRequest request);
        Task<InstrumentDto?> UpdateInstrumentAsync(string id, UpdateInstrumentRequest request);
        Task<bool> DeleteInstrumentAsync(string id);
    }

    public interface IApplicationService
    {
        Task<IEnumerable<ApplicationDto>> GetApplicationsAsync(string? userId = null, string? role = null);
        Task<ApplicationDto?> GetApplicationByIdAsync(string id);
        Task<ApplicationDto> CreateApplicationAsync(string ownerId, CreateApplicationRequest request);
        Task<ApplicationDto?> UpdateApplicationAsync(string id, UpdateApplicationRequest request);
        Task<ApplicationDto> SubmitApplicationAsync(string id);
        Task<CertificateDto> ApproveApplicationAsync(string id, string approvedByUserId, ApproveApplicationRequest request);
        Task<ApplicationDto> RejectApplicationAsync(string id, string rejectedByUserId, RejectApplicationRequest request);
        Task<ApplicationDto> RequestReinspectionAsync(string id, string requestedByUserId, ReinspectApplicationRequest request);
    }

    public interface IAssignmentService
    {
        Task<IEnumerable<OfficerAssignmentDto>> GetAssignmentsAsync(string? officerId = null);
        Task<OfficerAssignmentDto?> GetAssignmentByIdAsync(string id);
        Task<OfficerAssignmentDto> CreateAssignmentAsync(CreateAssignmentRequest request);
        Task<OfficerAssignmentDto?> UpdateAssignmentAsync(string id, UpdateAssignmentRequest request);
    }

    public interface IInspectionService
    {
        Task<IEnumerable<InspectionDto>> GetInspectionsAsync(string? officerId = null);
        Task<InspectionDto?> GetInspectionByIdAsync(string id);
        Task<InspectionDto> CreateInspectionAsync(string officerId, CreateInspectionRequest request);
        Task<InspectionDto?> UpdateInspectionAsync(string id, UpdateInspectionRequest request);
    }

    public interface ICertificateService
    {
        Task<IEnumerable<CertificateDto>> GetCertificatesAsync(string? ownerId = null);
        Task<CertificateDto?> GetCertificateByIdAsync(string id);
        Task<PublicVerifyCertificateResponse> VerifyCertificateAsync(string certificateNumber);
        Task<CertificateDto> RevokeCertificateAsync(string id, string revokedByUserId, string reason);
        Task<byte[]?> GetCertificatePdfBytesAsync(string id);
    }

    public interface INawiReportService
    {
        Task<string> GenerateReportAsync(string applicationId);
        Task<byte[]> GenerateReportPdfBytesAsync(string applicationId);
    }

    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId);
        Task<bool> MarkAsReadAsync(string notificationId, string userId);
        Task CreateRenewalNotificationsAsync();
    }

    public interface IDashboardService
    {
        Task<ApplicantDashboardDto> GetApplicantDashboardAsync(string userId);
        Task<OfficerDashboardDto> GetOfficerDashboardAsync(string officerId);
        Task<AdminDashboardDto> GetAdminDashboardAsync();
    }

    public interface IAuditService
    {
        Task LogAsync(string? userId, string? userName, string? userRole, string action, string entityName, string entityId, string description, string? ipAddress = null);
        Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int limit = 100);
    }
}
