using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentsController : BaseApiController
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentsController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<OfficerAssignmentDto>>>> GetAssignments([FromQuery] string? officerId = null)
        {
            var effectiveOfficerId = IsOfficer ? CurrentUserId : officerId;
            var assignments = await _assignmentService.GetAssignmentsAsync(effectiveOfficerId);
            return Ok(ApiResponse<IEnumerable<OfficerAssignmentDto>>.SuccessResult(assignments));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<OfficerAssignmentDto>>> GetAssignmentById(string id)
        {
            var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
            if (assignment == null)
            {
                return NotFound(ApiResponse<OfficerAssignmentDto>.FailureResult("Assignment not found."));
            }

            if (IsOfficer && assignment.OfficerId != CurrentUserId)
            {
                return Forbid();
            }

            return Ok(ApiResponse<OfficerAssignmentDto>.SuccessResult(assignment));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<OfficerAssignmentDto>>> CreateAssignment([FromBody] CreateAssignmentRequest request)
        {
            var assignment = await _assignmentService.CreateAssignmentAsync(request);
            return CreatedAtAction(nameof(GetAssignmentById), new { id = assignment.Id }, ApiResponse<OfficerAssignmentDto>.SuccessResult(assignment, "Officer assigned successfully."));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Officer")]
        public async Task<ActionResult<ApiResponse<OfficerAssignmentDto>>> UpdateAssignment(string id, [FromBody] UpdateAssignmentRequest request)
        {
            var updated = await _assignmentService.UpdateAssignmentAsync(id, request);
            if (updated == null)
            {
                return NotFound(ApiResponse<OfficerAssignmentDto>.FailureResult("Assignment not found."));
            }

            return Ok(ApiResponse<OfficerAssignmentDto>.SuccessResult(updated, "Assignment updated successfully."));
        }
    }
}
