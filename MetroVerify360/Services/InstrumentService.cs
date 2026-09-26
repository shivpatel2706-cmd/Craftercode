using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class InstrumentService : IInstrumentService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly IAuditService _auditService;

        public InstrumentService(MetroVerifyDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<IEnumerable<InstrumentDto>> GetInstrumentsAsync(string? ownerId = null)
        {
            var query = _context.Instruments.Include(i => i.Owner).AsQueryable();

            if (!string.IsNullOrWhiteSpace(ownerId))
            {
                query = query.Where(i => i.OwnerId == ownerId);
            }

            var instruments = await query
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return instruments.Select(MapToDto);
        }

        public async Task<InstrumentDto?> GetInstrumentByIdAsync(string id)
        {
            var instrument = await _context.Instruments
                .Include(i => i.Owner)
                .FirstOrDefaultAsync(i => i.Id == id);

            return instrument != null ? MapToDto(instrument) : null;
        }

        public async Task<InstrumentDto> CreateInstrumentAsync(string ownerId, CreateInstrumentRequest request)
        {
            var existingSerial = await _context.Instruments
                .FirstOrDefaultAsync(i => i.SerialNumber.ToLower() == request.SerialNumber.Trim().ToLower());

            if (existingSerial != null)
            {
                throw new InvalidOperationException($"An instrument with serial number '{request.SerialNumber}' is already registered.");
            }

            var owner = await _context.Users.FindAsync(ownerId);
            if (owner == null)
            {
                throw new KeyNotFoundException("Instrument owner not found.");
            }

            var instrument = new Instrument
            {
                Id = $"INST-{DateTime.UtcNow.Year}-{new Random().Next(100, 999)}",
                OwnerId = ownerId,
                InstrumentName = request.InstrumentName,
                InstrumentType = request.InstrumentType,
                Manufacturer = request.Manufacturer,
                ModelNumber = request.ModelNumber,
                SerialNumber = request.SerialNumber.Trim(),
                Capacity = request.Capacity,
                AccuracyClass = request.AccuracyClass,
                YearOfManufacture = request.YearOfManufacture,
                InstallationLocation = request.InstallationLocation,
                PurposeOfUse = request.PurposeOfUse,
                PreviousCertificateNumber = request.PreviousCertificateNumber,
                PreviousVerificationDate = request.PreviousVerificationDate,
                ExpiryDate = request.ExpiryDate,
                Status = "Under Verification",
                DocumentUrlsJson = request.DocumentUrlsJson,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Instruments.AddAsync(instrument);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                ownerId,
                owner.Name,
                owner.Role.ToString(),
                "INSTRUMENT_REGISTERED",
                "Instrument",
                instrument.Id,
                $"Registered instrument: {instrument.InstrumentName} ({instrument.SerialNumber})");

            instrument.Owner = owner;
            return MapToDto(instrument);
        }

        public async Task<InstrumentDto?> UpdateInstrumentAsync(string id, UpdateInstrumentRequest request)
        {
            var instrument = await _context.Instruments
                .Include(i => i.Owner)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (instrument == null) return null;

            if (!string.IsNullOrWhiteSpace(request.InstrumentName)) instrument.InstrumentName = request.InstrumentName;
            if (!string.IsNullOrWhiteSpace(request.InstrumentType)) instrument.InstrumentType = request.InstrumentType;
            if (!string.IsNullOrWhiteSpace(request.Manufacturer)) instrument.Manufacturer = request.Manufacturer;
            if (!string.IsNullOrWhiteSpace(request.ModelNumber)) instrument.ModelNumber = request.ModelNumber;
            if (!string.IsNullOrWhiteSpace(request.Capacity)) instrument.Capacity = request.Capacity;
            if (!string.IsNullOrWhiteSpace(request.AccuracyClass)) instrument.AccuracyClass = request.AccuracyClass;
            if (request.YearOfManufacture.HasValue) instrument.YearOfManufacture = request.YearOfManufacture.Value;
            if (!string.IsNullOrWhiteSpace(request.InstallationLocation)) instrument.InstallationLocation = request.InstallationLocation;
            if (!string.IsNullOrWhiteSpace(request.PurposeOfUse)) instrument.PurposeOfUse = request.PurposeOfUse;
            if (!string.IsNullOrWhiteSpace(request.Status)) instrument.Status = request.Status;

            instrument.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                instrument.OwnerId,
                instrument.Owner?.Name,
                "User",
                "INSTRUMENT_UPDATED",
                "Instrument",
                instrument.Id,
                $"Updated instrument: {instrument.InstrumentName}");

            return MapToDto(instrument);
        }

        public async Task<bool> DeleteInstrumentAsync(string id)
        {
            var instrument = await _context.Instruments.FindAsync(id);
            if (instrument == null) return false;

            instrument.Status = "Decommissioned";
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                null,
                "Admin",
                "Admin",
                "INSTRUMENT_DECOMMISSIONED",
                "Instrument",
                instrument.Id,
                $"Decommissioned instrument: {instrument.SerialNumber}");

            return true;
        }

        private static InstrumentDto MapToDto(Instrument inst)
        {
            return new InstrumentDto
            {
                Id = inst.Id,
                OwnerId = inst.OwnerId,
                OwnerName = inst.Owner?.Name ?? "Unknown Owner",
                InstrumentName = inst.InstrumentName,
                InstrumentType = inst.InstrumentType,
                Manufacturer = inst.Manufacturer,
                ModelNumber = inst.ModelNumber,
                SerialNumber = inst.SerialNumber,
                Capacity = inst.Capacity,
                AccuracyClass = inst.AccuracyClass,
                YearOfManufacture = inst.YearOfManufacture,
                InstallationLocation = inst.InstallationLocation,
                PurposeOfUse = inst.PurposeOfUse,
                PreviousCertificateNumber = inst.PreviousCertificateNumber,
                PreviousVerificationDate = inst.PreviousVerificationDate,
                ExpiryDate = inst.ExpiryDate,
                Status = inst.Status,
                DocumentUrlsJson = inst.DocumentUrlsJson,
                CreatedAt = inst.CreatedAt,
                UpdatedAt = inst.UpdatedAt
            };
        }
    }
}
