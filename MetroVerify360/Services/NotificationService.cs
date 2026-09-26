using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class NotificationService : INotificationService
    {
        private readonly MetroVerifyDbContext _context;

        public NotificationService(MetroVerifyDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            var list = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();

            return list.Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                CertificateId = n.CertificateId,
                Title = n.Title,
                Message = n.Message,
                NotificationType = n.NotificationType,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            });
        }

        public async Task<bool> MarkAsReadAsync(string notificationId, string userId)
        {
            var notif = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notif == null) return false;

            notif.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task CreateRenewalNotificationsAsync()
        {
            var now = DateTime.UtcNow;
            var certificates = await _context.Certificates
                .Include(c => c.Instrument)
                .Where(c => c.Status == "VALID")
                .ToListAsync();

            foreach (var cert in certificates)
            {
                var daysRemaining = (cert.ExpiryDate - now).TotalDays;

                string? title = null;
                string? message = null;
                string type = "warning";

                if (daysRemaining <= 0)
                {
                    title = "Statutory Certificate Expired";
                    message = $"Certificate {cert.CertificateNumber} for {cert.Instrument?.InstrumentName} has expired. Continued commercial use violates Section 30 of the Legal Metrology Act.";
                    type = "error";
                }
                else if (daysRemaining <= 7)
                {
                    title = "Statutory Reverification Due in 7 Days";
                    message = $"Re-verification for {cert.Instrument?.InstrumentName} (Cert {cert.CertificateNumber}) is due within 7 days. Submit renewal immediately.";
                }
                else if (daysRemaining <= 15)
                {
                    title = "Statutory Reverification Due in 15 Days";
                    message = $"Certificate {cert.CertificateNumber} expires on {cert.ExpiryDate:dd-MMM-yyyy}. Apply for renewal online.";
                }
                else if (daysRemaining <= 30)
                {
                    title = "Statutory Reverification Notice (30 Days)";
                    message = $"Notice: Certificate {cert.CertificateNumber} will expire in {Math.Ceiling(daysRemaining)} days.";
                    type = "info";
                }

                if (title != null)
                {
                    // Avoid duplicate notifications in same day
                    var exists = await _context.Notifications.AnyAsync(n =>
                        n.UserId == cert.OwnerId &&
                        n.CertificateId == cert.Id &&
                        n.Title == title &&
                        n.CreatedAt > now.AddDays(-1));

                    if (!exists)
                    {
                        await _context.Notifications.AddAsync(new Notification
                        {
                            Id = Guid.NewGuid().ToString(),
                            UserId = cert.OwnerId,
                            CertificateId = cert.Id,
                            Title = title,
                            Message = message!,
                            NotificationType = type,
                            IsRead = false,
                            CreatedAt = now
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
