using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class AuditService : IAuditService
    {
        private readonly MetroVerifyDbContext _context;

        public AuditService(MetroVerifyDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(
            string? userId,
            string? userName,
            string? userRole,
            string action,
            string entityName,
            string entityId,
            string description,
            string? ipAddress = null)
        {
            var log = new AuditLog
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                UserName = userName ?? "System",
                UserRole = userRole ?? "System",
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Timestamp = DateTime.UtcNow,
                Description = description,
                IPAddress = ipAddress ?? "127.0.0.1",
                Status = "SUCCESS"
            };

            await _context.AuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(int limit = 100)
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .ToListAsync();
        }
    }
}
