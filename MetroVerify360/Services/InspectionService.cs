using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class InspectionService : IInspectionService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly IAuditService _auditService;

        public InspectionService(MetroVerifyDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<IEnumerable<InspectionDto>> GetInspectionsAsync(string? officerId = null)
        {
            var query = _context.Inspections
                .Include(i => i.Officer)
                .Include(i => i.Measurements)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(officerId))
            {
                query = query.Where(i => i.OfficerId == officerId);
            }

            var list = await query
                .OrderByDescending(i => i.InspectionDate)
                .ToListAsync();

            return list.Select(MapToDto);
        }

        public async Task<InspectionDto?> GetInspectionByIdAsync(string id)
        {
            var inspection = await _context.Inspections
                .Include(i => i.Officer)
                .Include(i => i.Measurements)
                .FirstOrDefaultAsync(i => i.Id == id);

            return inspection != null ? MapToDto(inspection) : null;
        }

        public async Task<InspectionDto> CreateInspectionAsync(string officerId, CreateInspectionRequest request)
        {
            var app = await _context.Applications
                .Include(a => a.Instrument)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (app == null) throw new KeyNotFoundException("Application not found.");

            var officer = await _context.Users.FindAsync(officerId);
            if (officer == null) throw new KeyNotFoundException("Officer not found.");

            var inspection = new Inspection
            {
                Id = $"INSP-{DateTime.UtcNow.Year}-{new Random().Next(100, 999)}",
                ApplicationId = request.ApplicationId,
                OfficerId = officerId,
                InspectionDate = request.InspectionDate ?? DateTime.UtcNow,
                InstrumentCondition = request.InstrumentCondition,
                ManufacturerVerified = request.ManufacturerVerified,
                SerialNumberVerified = request.SerialNumberVerified,
                SealCondition = request.SealCondition,
                DisplayCondition = request.DisplayCondition,
                AccuracyResult = request.AccuracyResult,
                ZeroError = request.ZeroError,
                RepeatabilityResult = request.RepeatabilityResult,
                ReferenceStandard = request.ReferenceStandard,
                ObservedMeasurement = request.ObservedMeasurement,
                PermissibleError = request.PermissibleError,
                Result = request.Result,
                Remarks = request.Remarks,
                LeadSealTagNumber = request.LeadSealTagNumber ?? $"DL-LM-SEAL-{new Random().Next(10000, 99999)}",
                PhotoUrlsJson = request.PhotoUrlsJson,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow
            };

            if (request.Measurements != null && request.Measurements.Any())
            {
                foreach (var m in request.Measurements)
                {
                    inspection.Measurements.Add(new InspectionMeasurement
                    {
                        Id = Guid.NewGuid().ToString(),
                        InspectionId = inspection.Id,
                        LoadPoint = m.LoadPoint,
                        ReferenceValue = m.ReferenceValue,
                        ObservedValue = m.ObservedValue,
                        Error = m.Error,
                        MaxPermissibleError = m.MaxPermissibleError,
                        IsPass = m.IsPass
                    });
                }
            }

            await _context.Inspections.AddAsync(inspection);

            // Update application status to InspectionCompleted
            app.Status = ApplicationStatuses.InspectionCompleted;
            app.CompletedDate = inspection.InspectionDate;
            app.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                officerId,
                officer.Name,
                officer.Role.ToString(),
                "INSPECTION_SUBMITTED",
                "Inspection",
                inspection.Id,
                $"Conducted field inspection for application {app.ApplicationNumber}. Result: {inspection.Result}");

            inspection.Officer = officer;
            return MapToDto(inspection);
        }

        public async Task<InspectionDto?> UpdateInspectionAsync(string id, UpdateInspectionRequest request)
        {
            var inspection = await _context.Inspections
                .Include(i => i.Officer)
                .Include(i => i.Measurements)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inspection == null) return null;

            if (!string.IsNullOrWhiteSpace(request.InstrumentCondition)) inspection.InstrumentCondition = request.InstrumentCondition;
            if (request.ManufacturerVerified.HasValue) inspection.ManufacturerVerified = request.ManufacturerVerified.Value;
            if (request.SerialNumberVerified.HasValue) inspection.SerialNumberVerified = request.SerialNumberVerified.Value;
            if (!string.IsNullOrWhiteSpace(request.SealCondition)) inspection.SealCondition = request.SealCondition;
            if (!string.IsNullOrWhiteSpace(request.DisplayCondition)) inspection.DisplayCondition = request.DisplayCondition;
            if (!string.IsNullOrWhiteSpace(request.AccuracyResult)) inspection.AccuracyResult = request.AccuracyResult;
            if (!string.IsNullOrWhiteSpace(request.ZeroError)) inspection.ZeroError = request.ZeroError;
            if (!string.IsNullOrWhiteSpace(request.RepeatabilityResult)) inspection.RepeatabilityResult = request.RepeatabilityResult;
            if (!string.IsNullOrWhiteSpace(request.ReferenceStandard)) inspection.ReferenceStandard = request.ReferenceStandard;
            if (!string.IsNullOrWhiteSpace(request.ObservedMeasurement)) inspection.ObservedMeasurement = request.ObservedMeasurement;
            if (!string.IsNullOrWhiteSpace(request.PermissibleError)) inspection.PermissibleError = request.PermissibleError;
            if (!string.IsNullOrWhiteSpace(request.Result)) inspection.Result = request.Result;
            if (!string.IsNullOrWhiteSpace(request.Remarks)) inspection.Remarks = request.Remarks;
            if (!string.IsNullOrWhiteSpace(request.LeadSealTagNumber)) inspection.LeadSealTagNumber = request.LeadSealTagNumber;
            if (!string.IsNullOrWhiteSpace(request.PhotoUrlsJson)) inspection.PhotoUrlsJson = request.PhotoUrlsJson;
            if (!string.IsNullOrWhiteSpace(request.Status)) inspection.Status = request.Status;

            await _context.SaveChangesAsync();
            return MapToDto(inspection);
        }

        private static InspectionDto MapToDto(Inspection i)
        {
            return new InspectionDto
            {
                Id = i.Id,
                ApplicationId = i.ApplicationId,
                OfficerId = i.OfficerId,
                OfficerName = i.Officer?.Name ?? "Assigned Officer",
                OfficerBadge = i.Officer?.BadgeNumber ?? "LMI",
                InspectionDate = i.InspectionDate,
                InstrumentCondition = i.InstrumentCondition,
                ManufacturerVerified = i.ManufacturerVerified,
                SerialNumberVerified = i.SerialNumberVerified,
                SealCondition = i.SealCondition,
                DisplayCondition = i.DisplayCondition,
                AccuracyResult = i.AccuracyResult,
                ZeroError = i.ZeroError,
                RepeatabilityResult = i.RepeatabilityResult,
                ReferenceStandard = i.ReferenceStandard,
                ObservedMeasurement = i.ObservedMeasurement,
                PermissibleError = i.PermissibleError,
                Result = i.Result,
                Remarks = i.Remarks,
                LeadSealTagNumber = i.LeadSealTagNumber,
                PhotoUrlsJson = i.PhotoUrlsJson,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                Measurements = i.Measurements.Select(m => new CreateInspectionMeasurementDto
                {
                    LoadPoint = m.LoadPoint,
                    ReferenceValue = m.ReferenceValue,
                    ObservedValue = m.ObservedValue,
                    Error = m.Error,
                    MaxPermissibleError = m.MaxPermissibleError,
                    IsPass = m.IsPass
                }).ToList()
            };
        }
    }
}
