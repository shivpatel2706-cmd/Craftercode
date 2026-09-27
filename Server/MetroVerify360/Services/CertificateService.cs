using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class CertificateService : ICertificateService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly IAuditService _auditService;
        private readonly INawiReportService _reportService;

        public CertificateService(
            MetroVerifyDbContext context,
            IAuditService auditService,
            INawiReportService reportService)
        {
            _context = context;
            _auditService = auditService;
            _reportService = reportService;
        }

        public async Task<IEnumerable<CertificateDto>> GetCertificatesAsync(string? ownerId = null)
        {
            var query = _context.Certificates
                .Include(c => c.Instrument)
                .Include(c => c.Owner)
                .Include(c => c.Officer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(ownerId))
            {
                query = query.Where(c => c.OwnerId == ownerId);
            }

            var list = await query
                .OrderByDescending(c => c.VerificationDate)
                .ToListAsync();

            return list.Select(MapToDto);
        }

        public async Task<CertificateDto?> GetCertificateByIdAsync(string id)
        {
            var cert = await _context.Certificates
                .Include(c => c.Instrument)
                .Include(c => c.Owner)
                .Include(c => c.Officer)
                .FirstOrDefaultAsync(c => c.Id == id);

            return cert != null ? MapToDto(cert) : null;
        }

        public async Task<PublicVerifyCertificateResponse> VerifyCertificateAsync(string certificateNumber)
        {
            if (string.IsNullOrWhiteSpace(certificateNumber))
            {
                return new PublicVerifyCertificateResponse
                {
                    Found = false,
                    Message = "Certificate number is required."
                };
            }

            var norm = certificateNumber.Trim().ToUpper();

            var cert = await _context.Certificates
                .Include(c => c.Instrument)
                .Include(c => c.Officer)
                .FirstOrDefaultAsync(c => c.CertificateNumber.ToUpper() == norm);

            if (cert == null)
            {
                return new PublicVerifyCertificateResponse
                {
                    Found = false,
                    Message = "Certificate not found or invalid. Please check the reference number."
                };
            }

            // Check if expired
            var status = cert.Status;
            if (status == "VALID" && cert.ExpiryDate < DateTime.UtcNow)
            {
                status = "EXPIRED";
            }

            return new PublicVerifyCertificateResponse
            {
                Found = true,
                Message = status == "VALID"
                    ? "Verified authentic statutory certificate under Legal Metrology Act 2009."
                    : status == "EXPIRED"
                    ? "Certificate has expired. Instrument requires statutory re-verification."
                    : cert.RevocationReason ?? "Certificate revoked by Controller.",
                CertificateNumber = cert.CertificateNumber,
                InstrumentName = cert.Instrument?.InstrumentName ?? "Verified Instrument",
                SerialNumber = cert.Instrument?.SerialNumber ?? "N/A",
                VerificationDate = cert.VerificationDate.ToString("yyyy-MM-dd"),
                ExpiryDate = cert.ExpiryDate.ToString("yyyy-MM-dd"),
                Status = status,
                IssuingAuthority = cert.IssuingAuthority,
                SealTagNumber = cert.SealTagNumber,
                DigitalSignatureHash = cert.DigitalSignatureHash
            };
        }

        public async Task<CertificateDto> RevokeCertificateAsync(string id, string revokedByUserId, string reason)
        {
            var cert = await _context.Certificates
                .Include(c => c.Instrument)
                .Include(c => c.Owner)
                .Include(c => c.Officer)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cert == null) throw new KeyNotFoundException("Certificate not found.");

            cert.Status = "REVOKED";
            cert.RevocationReason = reason;
            cert.RevocationDate = DateTime.UtcNow;

            if (cert.Instrument != null)
            {
                cert.Instrument.Status = "Pending Re-verification";
            }

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                revokedByUserId,
                "Admin",
                "Admin",
                "CERTIFICATE_REVOKED",
                "Certificate",
                cert.CertificateNumber,
                $"Revoked certificate {cert.CertificateNumber}. Reason: {reason}");

            return MapToDto(cert);
        }

        public async Task<byte[]?> GetCertificatePdfBytesAsync(string id)
        {
            var cert = await _context.Certificates.FindAsync(id);
            if (cert == null) return null;

            return await _reportService.GenerateReportPdfBytesAsync(cert.ApplicationId);
        }

        public static CertificateDto MapToDto(Certificate c)
        {
            return new CertificateDto
            {
                Id = c.Id,
                CertificateNumber = c.CertificateNumber,
                ApplicationId = c.ApplicationId,
                InstrumentId = c.InstrumentId,
                InstrumentName = c.Instrument?.InstrumentName ?? "Verified Instrument",
                InstrumentType = c.Instrument?.InstrumentType ?? "NAWI",
                SerialNumber = c.Instrument?.SerialNumber ?? string.Empty,
                Capacity = c.Instrument?.Capacity ?? string.Empty,
                AccuracyClass = c.Instrument?.AccuracyClass ?? "Class III",
                OwnerId = c.OwnerId,
                OwnerName = c.Owner?.Name ?? "Registered Owner",
                InstallationLocation = c.Instrument?.InstallationLocation ?? "Registered Premises",
                OfficerId = c.OfficerId,
                OfficerName = c.Officer?.Name,
                OfficerBadge = c.Officer?.BadgeNumber,
                VerificationDate = c.VerificationDate,
                ExpiryDate = c.ExpiryDate,
                Status = c.Status,
                QrVerificationToken = c.QrVerificationToken,
                ReportPath = c.ReportPath,
                DigitalSignatureHash = c.DigitalSignatureHash,
                SealTagNumber = c.SealTagNumber,
                IssuingAuthority = c.IssuingAuthority,
                RevocationReason = c.RevocationReason,
                RevocationDate = c.RevocationDate,
                CreatedAt = c.CreatedAt
            };
        }
    }
}
