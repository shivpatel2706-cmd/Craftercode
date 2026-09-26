using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;

namespace MetroVerify360.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : BaseApiController
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDto>>>> GetNotifications()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<IEnumerable<NotificationDto>>.FailureResult("User not authenticated."));
            }

            var notifications = await _notificationService.GetUserNotificationsAsync(CurrentUserId);
            return Ok(ApiResponse<IEnumerable<NotificationDto>>.SuccessResult(notifications));
        }

        [HttpPut("{id}/read")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(string id)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized(ApiResponse<bool>.FailureResult("User not authenticated."));
            }

            var success = await _notificationService.MarkAsReadAsync(id, CurrentUserId);
            return Ok(ApiResponse<bool>.SuccessResult(success, "Notification marked as read."));
        }

        [HttpPost("trigger-reminders")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<string>>> TriggerRenewalReminders()
        {
            await _notificationService.CreateRenewalNotificationsAsync();
            return Ok(ApiResponse<string>.SuccessResult("Statutory renewal reminder check completed successfully."));
        }
    }
}
