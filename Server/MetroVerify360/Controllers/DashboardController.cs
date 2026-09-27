using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : BaseApiController
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("applicant")]
        public async Task<ActionResult<ApiResponse<ApplicantDashboardDto>>> GetApplicantDashboard()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<ApplicantDashboardDto>.FailureResult("User not authenticated."));
            }

            var dashboard = await _dashboardService.GetApplicantDashboardAsync(CurrentUserId);
            return Ok(ApiResponse<ApplicantDashboardDto>.SuccessResult(dashboard));
        }

        [HttpGet("officer")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<OfficerDashboardDto>>> GetOfficerDashboard()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<OfficerDashboardDto>.FailureResult("User not authenticated."));
            }

            var dashboard = await _dashboardService.GetOfficerDashboardAsync(CurrentUserId);
            return Ok(ApiResponse<OfficerDashboardDto>.SuccessResult(dashboard));
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<AdminDashboardDto>>> GetAdminDashboard()
        {
            var dashboard = await _dashboardService.GetAdminDashboardAsync();
            return Ok(ApiResponse<AdminDashboardDto>.SuccessResult(dashboard));
        }
    }
}
