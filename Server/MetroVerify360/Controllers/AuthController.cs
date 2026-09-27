using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(ApiResponse<AuthResponse>.SuccessResult(result, "User registered successfully."));
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            return Ok(ApiResponse<AuthResponse>.SuccessResult(result, "Login successful."));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<UserDto>.FailureResult("User not authenticated."));
            }

            var user = await _authService.GetCurrentUserAsync(CurrentUserId);
            return Ok(ApiResponse<UserDto>.SuccessResult(user));
        }
    }
}
