using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly IAuditService _auditService;

        public AssignmentService(MetroVerifyDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<IEnumerable<OfficerAssignmentDto>> GetAssignmentsAsync(string? officerId = null)
        {
            var query = _context.OfficerAssignments
                .Include(oa => oa.Application)
                    .ThenInclude(a => a!.Instrument)
                .Include(oa => oa.Officer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(officerId))
            {
                query = query.Where(oa => oa.OfficerId == officerId);
            }

            var list = await query
                .OrderByDescending(oa => oa.AssignedDate)
                .ToListAsync();

            return list.Select(MapToDto);
        }

        public async Task<OfficerAssignmentDto?> GetAssignmentByIdAsync(string id)
        {
            var item = await _context.OfficerAssignments
                .Include(oa => oa.Application)
                    .ThenInclude(a => a!.Instrument)
                .Include(oa => oa.Officer)
                .FirstOrDefaultAsync(oa => oa.Id == id);

            return item != null ? MapToDto(item) : null;
        }

        public async Task<OfficerAssignmentDto> CreateAssignmentAsync(CreateAssignmentRequest request)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (app == null) throw new KeyNotFoundException("Application not found.");

            var officer = await _context.Users.FindAsync(request.OfficerId);
            if (officer == null) throw new KeyNotFoundException("Officer not found.");

            var assignment = new OfficerAssignment
            {
                Id = Guid.NewGuid().ToString(),
                ApplicationId = request.ApplicationId,
                OfficerId = request.OfficerId,
                AssignedDate = DateTime.UtcNow,
                ScheduledInspectionDate = request.ScheduledInspectionDate,
                Location = request.Location ?? app.Instrument?.InstallationLocation,
                Status = "Active",
                Remarks = request.Remarks,
                CreatedAt = DateTime.UtcNow
            };

            await _context.OfficerAssignments.AddAsync(assignment);

            // Update application status
            app.Status = request.ScheduledInspectionDate.HasValue
                ? ApplicationStatuses.InspectionScheduled
                : ApplicationStatuses.Assigned;
            app.ScheduledInspectionDate = request.ScheduledInspectionDate;
            app.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                null,
                "Admin",
                "Admin",
                "OFFICER_ASSIGNED",
                "Application",
                app.Id,
                $"Assigned officer {officer.Name} ({officer.BadgeNumber}) to application {app.ApplicationNumber}");

            assignment.Application = app;
            assignment.Officer = officer;
            return MapToDto(assignment);
        }

        public async Task<OfficerAssignmentDto?> UpdateAssignmentAsync(string id, UpdateAssignmentRequest request)
        {
            var assignment = await _context.OfficerAssignments
                .Include(oa => oa.Application)
                    .ThenInclude(a => a!.Instrument)
                .Include(oa => oa.Officer)
                .FirstOrDefaultAsync(oa => oa.Id == id);

            if (assignment == null) return null;

            if (request.ScheduledInspectionDate.HasValue)
            {
                assignment.ScheduledInspectionDate = request.ScheduledInspectionDate.Value;
                if (assignment.Application != null)
                {
                    assignment.Application.ScheduledInspectionDate = request.ScheduledInspectionDate.Value;
                    assignment.Application.Status = ApplicationStatuses.InspectionScheduled;
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Location)) assignment.Location = request.Location;
            if (!string.IsNullOrWhiteSpace(request.Status)) assignment.Status = request.Status;
            if (!string.IsNullOrWhiteSpace(request.Remarks)) assignment.Remarks = request.Remarks;

            await _context.SaveChangesAsync();
            return MapToDto(assignment);
        }

        private static OfficerAssignmentDto MapToDto(OfficerAssignment oa)
        {
            return new OfficerAssignmentDto
            {
                Id = oa.Id,
                ApplicationId = oa.ApplicationId,
                ApplicationNumber = oa.Application?.ApplicationNumber ?? string.Empty,
                InstrumentName = oa.Application?.Instrument?.InstrumentName ?? "Unknown Instrument",
                OfficerId = oa.OfficerId,
                OfficerName = oa.Officer?.Name ?? string.Empty,
                OfficerBadge = oa.Officer?.BadgeNumber ?? string.Empty,
                AssignedDate = oa.AssignedDate,
                ScheduledInspectionDate = oa.ScheduledInspectionDate,
                Location = oa.Location,
                Status = oa.Status,
                Remarks = oa.Remarks
            };
        }
    }
}
