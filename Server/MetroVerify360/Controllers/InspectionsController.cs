using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InspectionsController : BaseApiController
    {
        private readonly IInspectionService _inspectionService;

        public InspectionsController(IInspectionService inspectionService)
        {
            _inspectionService = inspectionService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<InspectionDto>>>> GetInspections([FromQuery] string? officerId = null)
        {
            var effectiveOfficerId = IsOfficer ? CurrentUserId : officerId;
            var inspections = await _inspectionService.GetInspectionsAsync(effectiveOfficerId);
            return Ok(ApiResponse<IEnumerable<InspectionDto>>.SuccessResult(inspections));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<InspectionDto>>> GetInspectionById(string id)
        {
            var inspection = await _inspectionService.GetInspectionByIdAsync(id);
            if (inspection == null)
            {
                return NotFound(ApiResponse<InspectionDto>.FailureResult("Inspection not found."));
            }

            return Ok(ApiResponse<InspectionDto>.SuccessResult(inspection));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<InspectionDto>>> CreateInspection([FromBody] CreateInspectionRequest request)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<InspectionDto>.FailureResult("User not authenticated."));
            }

            var inspection = await _inspectionService.CreateInspectionAsync(CurrentUserId, request);
            return CreatedAtAction(nameof(GetInspectionById), new { id = inspection.Id }, ApiResponse<InspectionDto>.SuccessResult(inspection, "Inspection recorded successfully."));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<InspectionDto>>> UpdateInspection(string id, [FromBody] UpdateInspectionRequest request)
        {
            var updated = await _inspectionService.UpdateInspectionAsync(id, request);
            if (updated == null)
            {
                return NotFound(ApiResponse<InspectionDto>.FailureResult("Inspection not found."));
            }

            return Ok(ApiResponse<InspectionDto>.SuccessResult(updated, "Inspection updated successfully."));
        }
    }
}
