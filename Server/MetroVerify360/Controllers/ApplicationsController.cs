using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicationsController : BaseApiController
    {
        private readonly IApplicationService _applicationService;

        public ApplicationsController(IApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<ApplicationDto>>>> GetApplications()
        {
            var apps = await _applicationService.GetApplicationsAsync(CurrentUserId, CurrentUserRole);
            return Ok(ApiResponse<IEnumerable<ApplicationDto>>.SuccessResult(apps));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ApplicationDto>>> GetApplicationById(string id)
        {
            var app = await _applicationService.GetApplicationByIdAsync(id);
            if (app == null)
            {
                return NotFound(ApiResponse<ApplicationDto>.FailureResult("Application not found."));
            }

            if (IsApplicant && app.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            return Ok(ApiResponse<ApplicationDto>.SuccessResult(app));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<ApplicationDto>>> CreateApplication([FromBody] CreateApplicationRequest request)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<ApplicationDto>.FailureResult("User not authenticated."));
            }

            var app = await _applicationService.CreateApplicationAsync(CurrentUserId, request);
            return CreatedAtAction(nameof(GetApplicationById), new { id = app.Id }, ApiResponse<ApplicationDto>.SuccessResult(app, "Application filed successfully."));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<ApplicationDto>>> UpdateApplication(string id, [FromBody] UpdateApplicationRequest request)
        {
            var existing = await _applicationService.GetApplicationByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse<ApplicationDto>.FailureResult("Application not found."));
            }

            if (IsApplicant && existing.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            var updated = await _applicationService.UpdateApplicationAsync(id, request);
            return Ok(ApiResponse<ApplicationDto>.SuccessResult(updated!, "Application updated successfully."));
        }

        [HttpPost("{id}/submit")]
        public async Task<ActionResult<ApiResponse<ApplicationDto>>> SubmitApplication(string id)
        {
            var existing = await _applicationService.GetApplicationByIdAsync(id);
            if (existing == null)
            {
                return NotFound(ApiResponse<ApplicationDto>.FailureResult("Application not found."));
            }

            if (IsApplicant && existing.OwnerId != CurrentUserId)
            {
                return Forbid();
            }

            var submitted = await _applicationService.SubmitApplicationAsync(id);
            return Ok(ApiResponse<ApplicationDto>.SuccessResult(submitted, "Application submitted for metrological verification."));
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<CertificateDto>>> ApproveApplication(string id, [FromBody] ApproveApplicationRequest request)
        {
            var cert = await _applicationService.ApproveApplicationAsync(id, CurrentUserId!, request);
            return Ok(ApiResponse<CertificateDto>.SuccessResult(cert, "Application approved and statutory certificate issued successfully."));
        }

        [HttpPost("{id}/reject")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<ApplicationDto>>> RejectApplication(string id, [FromBody] RejectApplicationRequest request)
        {
            var app = await _applicationService.RejectApplicationAsync(id, CurrentUserId!, request);
            return Ok(ApiResponse<ApplicationDto>.SuccessResult(app, "Application rejected."));
        }

        [HttpPost("{id}/reinspect")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<ApplicationDto>>> RequestReinspection(string id, [FromBody] ReinspectApplicationRequest request)
        {
            var app = await _applicationService.RequestReinspectionAsync(id, CurrentUserId!, request);
            return Ok(ApiResponse<ApplicationDto>.SuccessResult(app, "Re-inspection requested."));
        }
    }
}
