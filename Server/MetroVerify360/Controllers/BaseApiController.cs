using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        protected string? CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        protected string? CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value;
        protected string? CurrentUserName => User.FindFirst(ClaimTypes.Name)?.Value;
        protected string? CurrentUserEmail => User.FindFirst(ClaimTypes.Email)?.Value;

        protected bool IsAdmin => CurrentUserRole == "Admin";
        protected bool IsOfficer => CurrentUserRole == "Officer";
        protected bool IsApplicant => CurrentUserRole == "Applicant";
    }
}
