using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserDto>>>> GetAllUsers()
        {
            // Officers list might be needed by Admin, or for assignment dropdowns
            var users = await _userService.GetAllUsersAsync();
            return Ok(ApiResponse<IEnumerable<UserDto>>.SuccessResult(users));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(string id)
        {
            // Allow access if Admin or the user requesting their own profile
            if (!IsAdmin && CurrentUserId != id)
            {
                return Forbid();
            }

            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<UserDto>.FailureResult("User not found."));
            }

            return Ok(ApiResponse<UserDto>.SuccessResult(user));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
        {
            if (!IsAdmin && CurrentUserId != id)
            {
                return Forbid();
            }

            var updatedUser = await _userService.UpdateUserAsync(id, request);
            if (updatedUser == null)
            {
                return NotFound(ApiResponse<UserDto>.FailureResult("User not found."));
            }

            return Ok(ApiResponse<UserDto>.SuccessResult(updatedUser, "User profile updated successfully."));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
        {
            var success = await _userService.DeleteUserAsync(id);
            if (!success)
            {
                return NotFound(ApiResponse<bool>.FailureResult("User not found."));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "User deleted successfully."));
        }
    }
}
