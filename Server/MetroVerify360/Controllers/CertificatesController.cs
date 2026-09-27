using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : BaseApiController
    {
        private readonly ICertificateService _certificateService;
        private readonly INawiReportService _reportService;

        public CertificatesController(ICertificateService certificateService, INawiReportService reportService)
        {
            _certificateService = certificateService;
            _reportService = reportService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ApiResponse<IEnumerable<CertificateDto>>>> GetCertificates([FromQuery] string? ownerId = null)
        {
            var effectiveOwnerId = IsApplicant ? CurrentUserId : ownerId;
            var certificates = await _certificateService.GetCertificatesAsync(effectiveOwnerId);
            return Ok(ApiResponse<IEnumerable<CertificateDto>>.SuccessResult(certificates));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CertificateDto>>> GetCertificateById(string id)
        {
            var certificate = await _certificateService.GetCertificateByIdAsync(id);
            if (certificate == null)
            {
                return NotFound(ApiResponse<CertificateDto>.FailureResult("Certificate not found."));
            }

            if (IsApplicant && certificate.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            return Ok(ApiResponse<CertificateDto>.SuccessResult(certificate));
        }

        /// <summary>
        /// Public QR Verification endpoint accessed by any scanning device or browser.
        /// Does not require authentication and returns only public-facing verification details.
        /// </summary>
        [HttpGet("verify/{certificateNumber}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<PublicVerifyCertificateResponse>>> VerifyCertificate(string certificateNumber)
        {
            var result = await _certificateService.VerifyCertificateAsync(certificateNumber);
            if (!result.Found)
            {
                return NotFound(ApiResponse<PublicVerifyCertificateResponse>.FailureResult(result.Message ?? "Certificate not found.", new List<string> { "CERTIFICATE_NOT_FOUND" }));
            }

            return Ok(ApiResponse<PublicVerifyCertificateResponse>.SuccessResult(result, result.Message ?? "Certificate verified successfully."));
        }

        [HttpPost("{id}/revoke")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<CertificateDto>>> RevokeCertificate(string id, [FromBody] RevokeCertificateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Reason))
            {
                return BadRequest(ApiResponse<CertificateDto>.FailureResult("Revocation reason is required."));
            }

            var revoked = await _certificateService.RevokeCertificateAsync(id, CurrentUserId!, request.Reason);
            return Ok(ApiResponse<CertificateDto>.SuccessResult(revoked, "Certificate revoked successfully."));
        }

        [HttpGet("{id}/pdf")]
        [Authorize]
        public async Task<IActionResult> DownloadCertificatePdf(string id)
        {
            var cert = await _certificateService.GetCertificateByIdAsync(id);
            if (cert == null)
            {
                return NotFound(ApiResponse<string>.FailureResult("Certificate not found."));
            }

            if (IsApplicant && cert.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            var pdfBytes = await _certificateService.GetCertificatePdfBytesAsync(id);
            if (pdfBytes == null || pdfBytes.Length == 0)
            {
                return NotFound(ApiResponse<string>.FailureResult("Report PDF could not be generated."));
            }

            return File(pdfBytes, "application/pdf", $"Certificate_{cert.CertificateNumber}.pdf");
        }

        [HttpGet("nawi-report/{applicationId}")]
        [Authorize]
        public async Task<IActionResult> DownloadNawiReport(string applicationId)
        {
            try
            {
                var pdfBytes = await _reportService.GenerateReportPdfBytesAsync(applicationId);
                return File(pdfBytes, "application/pdf", $"NAWI_Report_{applicationId}.pdf");
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<string>.FailureResult("Application not found for NAWI report."));
            }
        }
    }
}
