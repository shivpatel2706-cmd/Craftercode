using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Helpers;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly IAuditService _auditService;
        private readonly INawiReportService _reportService;

        public ApplicationService(
            MetroVerifyDbContext context,
            IAuditService auditService,
            INawiReportService reportService)
        {
            _context = context;
            _auditService = auditService;
            _reportService = reportService;
        }

        public async Task<IEnumerable<ApplicationDto>> GetApplicationsAsync(string? userId = null, string? role = null)
        {
            var query = _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .Include(a => a.Certificate)
                .Include(a => a.Assignments)
                    .ThenInclude(asgn => asgn.Officer)
                .Include(a => a.Inspections)
                .AsQueryable();

            if (role == UserRole.Applicant.ToString() && !string.IsNullOrWhiteSpace(userId))
            {
                query = query.Where(a => a.OwnerId == userId);
            }
            else if (role == UserRole.Officer.ToString() && !string.IsNullOrWhiteSpace(userId))
            {
                query = query.Where(a => a.Assignments.Any(oa => oa.OfficerId == userId));
            }

            var list = await query
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return list.Select(MapToDto);
        }

        public async Task<ApplicationDto?> GetApplicationByIdAsync(string id)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .Include(a => a.Certificate)
                .Include(a => a.Assignments)
                    .ThenInclude(asgn => asgn.Officer)
                .Include(a => a.Inspections)
                .FirstOrDefaultAsync(a => a.Id == id || a.ApplicationNumber == id);

            return app != null ? MapToDto(app) : null;
        }

        public async Task<ApplicationDto> CreateApplicationAsync(string ownerId, CreateApplicationRequest request)
        {
            var instrument = await _context.Instruments.FindAsync(request.InstrumentId);
            if (instrument == null) throw new KeyNotFoundException("Instrument not found.");

            var owner = await _context.Users.FindAsync(ownerId);
            if (owner == null) throw new KeyNotFoundException("Owner not found.");

            var appNumber = $"APP-{DateTime.UtcNow.Year}-{new Random().Next(1000, 9999)}";

            var defaultSteps = new[]
            {
                new { stepNumber = 1, title = "Application Submitted", description = "Online statutory filing submitted.", status = "Completed", date = (string?)DateTime.UtcNow.ToString("dd-MMM-yyyy HH:mm"), actor = (string?)owner.Name },
                new { stepNumber = 2, title = "Application Reviewed", description = "Desk scrutiny by Legal Metrology.", status = "Current", date = (string?)DateTime.UtcNow.ToString("dd-MMM-yyyy HH:mm"), actor = (string?)"Desk Officer" },
                new { stepNumber = 3, title = "Officer Assigned", description = "Territorial officer allocation.", status = "Pending", date = (string?)null, actor = (string?)null },
                new { stepNumber = 4, title = "Inspection Scheduled", description = "Field visit date rostered.", status = "Pending", date = (string?)null, actor = (string?)null },
                new { stepNumber = 5, title = "Field Inspection", description = "Metrological verification against standards.", status = "Pending", date = (string?)null, actor = (string?)null },
                new { stepNumber = 6, title = "Verification Completed", description = "NAWI statutory test dossier logged.", status = "Pending", date = (string?)null, actor = (string?)null },
                new { stepNumber = 7, title = "Digital Approval", description = "Controller review and sign-off.", status = "Pending", date = (string?)null, actor = (string?)null },
                new { stepNumber = 8, title = "Certificate Generated", description = "Issue of QR Certificate of Verification.", status = "Pending", date = (string?)null, actor = (string?)null }
            };

            var application = new Application
            {
                Id = Guid.NewGuid().ToString(),
                ApplicationNumber = appNumber,
                InstrumentId = request.InstrumentId,
                OwnerId = ownerId,
                Status = ApplicationStatuses.Submitted,
                Priority = request.Priority ?? "Normal",
                FeeAmount = request.FeeAmount,
                PaymentStatus = request.PaymentStatus ?? "Paid",
                ApplicationDate = DateTime.UtcNow,
                TrackingStepsJson = JsonSerializer.Serialize(defaultSteps),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Applications.AddAsync(application);

            instrument.Status = "Under Verification";
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                ownerId,
                owner.Name,
                owner.Role.ToString(),
                "APPLICATION_SUBMITTED",
                "Application",
                application.Id,
                $"Submitted verification application {appNumber} for {instrument.InstrumentName}");

            application.Instrument = instrument;
            application.Owner = owner;
            return MapToDto(application);
        }

        public async Task<ApplicationDto?> UpdateApplicationAsync(string id, UpdateApplicationRequest request)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .Include(a => a.Assignments).ThenInclude(asgn => asgn.Officer)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) return null;

            if (!string.IsNullOrWhiteSpace(request.Priority)) app.Priority = request.Priority;
            if (!string.IsNullOrWhiteSpace(request.Status)) app.Status = request.Status;
            if (request.ScheduledInspectionDate.HasValue) app.ScheduledInspectionDate = request.ScheduledInspectionDate;

            app.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(app);
        }

        public async Task<ApplicationDto> SubmitApplicationAsync(string id)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) throw new KeyNotFoundException("Application not found.");

            app.Status = ApplicationStatuses.Submitted;
            app.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(app);
        }

        public async Task<CertificateDto> ApproveApplicationAsync(string id, string approvedByUserId, ApproveApplicationRequest request)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .Include(a => a.Assignments).ThenInclude(oa => oa.Officer)
                .Include(a => a.Inspections).ThenInclude(i => i.Measurements)
                .FirstOrDefaultAsync(a => a.Id == id);

            // 1. Verification Pre-checks
            if (app == null)
            {
                throw new KeyNotFoundException("Application not found.");
            }

            if (app.Instrument == null)
            {
                throw new InvalidOperationException("Associated instrument record not found.");
            }

            var latestAssignment = app.Assignments.OrderByDescending(oa => oa.AssignedDate).FirstOrDefault();
            if (latestAssignment == null)
            {
                throw new InvalidOperationException("An officer assignment must exist before approval.");
            }

            var latestInspection = app.Inspections.OrderByDescending(i => i.InspectionDate).FirstOrDefault();
            if (latestInspection == null)
            {
                throw new InvalidOperationException("No field inspection record exists for this application.");
            }

            if (latestInspection.Result != "PASS")
            {
                throw new InvalidOperationException($"Cannot approve application: Inspection result is '{latestInspection.Result}'.");
            }

            // 2. Generate Unique Certificate Number
            var certNumber = $"CERT-{DateTime.UtcNow.Year}-{new Random().Next(100000, 999999)}";
            var verificationUrl = $"https://metroverify360.gov.in/verify/{certNumber}";

            // 3. Generate Digital Signature Hash
            var rawSignature = $"{certNumber}|{app.Instrument.SerialNumber}|{DateTime.UtcNow:O}|{latestInspection.LeadSealTagNumber}|{latestInspection.OfficerId}";
            using var sha = SHA256.Create();
            var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(rawSignature));
            var signatureHash = "SHA256:" + Convert.ToHexString(hashBytes).ToLower();

            // 4. Create Certificate Record
            var certificate = new Certificate
            {
                Id = Guid.NewGuid().ToString(),
                CertificateNumber = certNumber,
                ApplicationId = app.Id,
                InstrumentId = app.InstrumentId,
                OwnerId = app.OwnerId,
                OfficerId = latestInspection.OfficerId,
                VerificationDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddYears(1),
                Status = "VALID",
                QrVerificationToken = verificationUrl,
                DigitalSignatureHash = signatureHash,
                SealTagNumber = latestInspection.LeadSealTagNumber,
                IssuingAuthority = "Department of Legal Metrology, Government of India",
                CreatedAt = DateTime.UtcNow
            };

            await _context.Certificates.AddAsync(certificate);

            // 5. Update Application & Instrument
            app.Status = ApplicationStatuses.Approved;
            app.ApprovalDate = DateTime.UtcNow;
            app.UpdatedAt = DateTime.UtcNow;

            app.Instrument.Status = "Active";
            app.Instrument.PreviousCertificateNumber = certNumber;
            app.Instrument.PreviousVerificationDate = certificate.VerificationDate;
            app.Instrument.ExpiryDate = certificate.ExpiryDate;
            app.Instrument.UpdatedAt = DateTime.UtcNow;

            // 6. Generate NAWI PDF Report
            try
            {
                var reportRelativePath = await _reportService.GenerateReportAsync(app.Id);
                certificate.ReportPath = reportRelativePath;
            }
            catch (Exception)
            {
                certificate.ReportPath = $"/reports/NAWI_Report_{app.Id}.pdf";
            }

            // 7. Audit Log & Statutory Notification
            await _auditService.LogAsync(
                approvedByUserId,
                "Admin",
                "Admin",
                "APPLICATION_APPROVED_CERTIFICATE_ISSUED",
                "Certificate",
                certNumber,
                $"Approved application {app.ApplicationNumber}. Issued Certificate {certNumber} for {app.Instrument.InstrumentName}. {request.ApprovalNotes}");

            await _context.Notifications.AddAsync(new Notification
            {
                Id = Guid.NewGuid().ToString(),
                UserId = app.OwnerId,
                CertificateId = certificate.Id,
                Title = "Verification Certificate Issued",
                Message = $"Your statutory certificate {certNumber} for {app.Instrument.InstrumentName} is approved and valid until {certificate.ExpiryDate:dd-MMM-yyyy}.",
                NotificationType = "success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            certificate.Instrument = app.Instrument;
            certificate.Owner = app.Owner;
            certificate.Officer = latestAssignment.Officer;

            return CertificateService.MapToDto(certificate);
        }

        public async Task<ApplicationDto> RejectApplicationAsync(string id, string rejectedByUserId, RejectApplicationRequest request)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) throw new KeyNotFoundException("Application not found.");

            app.Status = ApplicationStatuses.Rejected;
            app.RejectionReason = request.Reason;
            app.UpdatedAt = DateTime.UtcNow;

            if (app.Instrument != null)
            {
                app.Instrument.Status = "Pending Re-verification";
            }

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                rejectedByUserId,
                "Admin",
                "Admin",
                "APPLICATION_REJECTED",
                "Application",
                app.ApplicationNumber,
                $"Rejected verification application {app.ApplicationNumber}. Reason: {request.Reason}");

            return MapToDto(app);
        }

        public async Task<ApplicationDto> RequestReinspectionAsync(string id, string requestedByUserId, ReinspectApplicationRequest request)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .Include(a => a.Owner)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (app == null) throw new KeyNotFoundException("Application not found.");

            app.Status = ApplicationStatuses.ReinspectionRequired;
            app.RejectionReason = request.Instructions;
            app.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                requestedByUserId,
                "Admin",
                "Admin",
                "REINSPECTION_REQUESTED",
                "Application",
                app.ApplicationNumber,
                $"Requested re-inspection for application {app.ApplicationNumber}: {request.Instructions}");

            return MapToDto(app);
        }

        private static ApplicationDto MapToDto(Application a)
        {
            var assignedOfficer = a.Assignments.OrderByDescending(oa => oa.AssignedDate).FirstOrDefault()?.Officer;
            var completedInspection = a.Inspections.OrderByDescending(i => i.InspectionDate).FirstOrDefault();

            return new ApplicationDto
            {
                Id = a.Id,
                ApplicationNumber = a.ApplicationNumber,
                InstrumentId = a.InstrumentId,
                InstrumentName = a.Instrument?.InstrumentName ?? "Unknown Instrument",
                InstrumentType = a.Instrument?.InstrumentType ?? "NAWI",
                SerialNumber = a.Instrument?.SerialNumber ?? string.Empty,
                Capacity = a.Instrument?.Capacity ?? string.Empty,
                Location = a.Instrument?.InstallationLocation ?? string.Empty,
                OwnerId = a.OwnerId,
                OwnerName = a.Owner?.Name ?? "Registered Owner",
                OwnerPhone = a.Owner?.Phone,
                OwnerEmail = a.Owner?.Email,
                Status = a.Status,
                Priority = a.Priority,
                FeeAmount = a.FeeAmount,
                PaymentStatus = a.PaymentStatus,
                ApplicationDate = a.ApplicationDate,
                ScheduledInspectionDate = a.ScheduledInspectionDate,
                CompletedDate = a.CompletedDate,
                ApprovalDate = a.ApprovalDate,
                OfficerId = assignedOfficer?.Id,
                OfficerName = assignedOfficer?.Name,
                OfficerBadge = assignedOfficer?.BadgeNumber,
                InspectionId = completedInspection?.Id,
                CertificateId = a.Certificate?.Id,
                CertificateNumber = a.Certificate?.CertificateNumber,
                RejectionReason = a.RejectionReason,
                TrackingStepsJson = a.TrackingStepsJson,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            };
        }
    }
}
