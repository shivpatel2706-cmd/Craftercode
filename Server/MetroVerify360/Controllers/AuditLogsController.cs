using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/audit-logs")]
    [Authorize(Roles = "Admin")]
    public class AuditLogsController : BaseApiController
    {
        private readonly IAuditService _auditService;

        public AuditLogsController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<AuditLog>>>> GetAuditLogs([FromQuery] int limit = 100)
        {
            var logs = await _auditService.GetAuditLogsAsync(limit);
            return Ok(ApiResponse<IEnumerable<AuditLog>>.SuccessResult(logs));
        }
    }
}
