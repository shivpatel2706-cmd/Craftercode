using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly MetroVerifyDbContext _context;

        public DashboardService(MetroVerifyDbContext context)
        {
            _context = context;
        }

        public async Task<ApplicantDashboardDto> GetApplicantDashboardAsync(string userId)
        {
            var totalInstruments = await _context.Instruments
                .CountAsync(i => i.OwnerId == userId);

            var pendingApplications = await _context.Applications
                .CountAsync(a => a.OwnerId == userId && (
                    a.Status == ApplicationStatuses.Submitted ||
                    a.Status == ApplicationStatuses.UnderReview ||
                    a.Status == ApplicationStatuses.Assigned ||
                    a.Status == ApplicationStatuses.InspectionScheduled));

            var approvedCertificates = await _context.Certificates
                .CountAsync(c => c.OwnerId == userId && c.Status == "VALID");

            var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
            var expiringCertificates = await _context.Certificates
                .CountAsync(c => c.OwnerId == userId && c.Status == "VALID" && c.ExpiryDate <= thirtyDaysFromNow);

            return new ApplicantDashboardDto
            {
                TotalInstruments = totalInstruments,
                PendingApplications = pendingApplications,
                ApprovedCertificates = approvedCertificates,
                ExpiringCertificates = expiringCertificates
            };
        }

        public async Task<OfficerDashboardDto> GetOfficerDashboardAsync(string officerId)
        {
            var assignedInspections = await _context.OfficerAssignments
                .CountAsync(oa => oa.OfficerId == officerId && oa.Status == "Active");

            var today = DateTime.UtcNow.Date;
            var todaysInspections = await _context.OfficerAssignments
                .CountAsync(oa => oa.OfficerId == officerId && oa.ScheduledInspectionDate.HasValue && oa.ScheduledInspectionDate.Value.Date == today);

            var pendingVerification = await _context.Applications
                .CountAsync(a => a.Assignments.Any(oa => oa.OfficerId == officerId) && a.Status == ApplicationStatuses.InspectionCompleted);

            var completedInspections = await _context.Inspections
                .CountAsync(i => i.OfficerId == officerId);

            return new OfficerDashboardDto
            {
                AssignedInspections = assignedInspections,
                TodaysInspections = todaysInspections,
                PendingVerification = pendingVerification,
                CompletedInspections = completedInspections
            };
        }

        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            var totalInstruments = await _context.Instruments.CountAsync();
            var totalApplications = await _context.Applications.CountAsync();

            var pendingApplications = await _context.Applications
                .CountAsync(a => a.Status == ApplicationStatuses.Submitted ||
                                 a.Status == ApplicationStatuses.UnderReview ||
                                 a.Status == ApplicationStatuses.Assigned ||
                                 a.Status == ApplicationStatuses.InspectionScheduled);

            var today = DateTime.UtcNow.Date;
            var inspectionsToday = await _context.OfficerAssignments
                .CountAsync(oa => oa.ScheduledInspectionDate.HasValue && oa.ScheduledInspectionDate.Value.Date == today);

            var approvedCertificates = await _context.Certificates.CountAsync(c => c.Status == "VALID");
            var expiredCertificates = await _context.Certificates.CountAsync(c => c.Status == "EXPIRED" || c.ExpiryDate < DateTime.UtcNow);

            var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
            var renewalsDue = await _context.Certificates
                .CountAsync(c => c.Status == "VALID" && c.ExpiryDate <= thirtyDaysFromNow);

            return new AdminDashboardDto
            {
                TotalInstruments = totalInstruments,
                TotalApplications = totalApplications,
                PendingApplications = pendingApplications,
                InspectionsToday = inspectionsToday,
                ApprovedCertificates = approvedCertificates,
                ExpiredCertificates = expiredCertificates,
                RenewalsDue = renewalsDue
            };
        }
    }
}
