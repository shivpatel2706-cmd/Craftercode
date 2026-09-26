using Microsoft.EntityFrameworkCore;
using MetroVerify360.Data;
using MetroVerify360.DTOs;
using MetroVerify360.Helpers;
using MetroVerify360.Interfaces;
using MetroVerify360.Models;

namespace MetroVerify360.Services
{
    public class AuthService : IAuthService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly JwtTokenGenerator _jwtGenerator;
        private readonly IAuditService _auditService;

        public AuthService(
            MetroVerifyDbContext context,
            JwtTokenGenerator jwtGenerator,
            IAuditService auditService)
        {
            _context = context;
            _jwtGenerator = jwtGenerator;
            _auditService = auditService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (existingUser != null)
            {
                throw new InvalidOperationException("A user with this email address already exists.");
            }

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.Name,
                Email = request.Email.ToLower(),
                PasswordHash = PasswordHasher.HashPassword(request.Password),
                Role = request.Role,
                Phone = request.Phone,
                Organization = request.Organization,
                Designation = request.Designation,
                BadgeNumber = request.BadgeNumber,
                JurisdictionZone = request.JurisdictionZone,
                Address = request.Address,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                user.Id,
                user.Name,
                user.Role.ToString(),
                "USER_REGISTERED",
                "User",
                user.Id,
                $"New {user.Role} registered: {user.Email}");

            var (token, expiresAt) = _jwtGenerator.GenerateToken(user);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToUserDto(user)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email address or password.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("This account has been deactivated. Please contact administrator.");
            }

            await _auditService.LogAsync(
                user.Id,
                user.Name,
                user.Role.ToString(),
                "USER_LOGIN",
                "User",
                user.Id,
                $"{user.Role} logged in successfully");

            var (token, expiresAt) = _jwtGenerator.GenerateToken(user);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToUserDto(user)
            };
        }

        public async Task<UserDto> GetCurrentUserAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            return MapToUserDto(user);
        }

        public static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                Phone = user.Phone,
                Organization = user.Organization,
                Designation = user.Designation,
                BadgeNumber = user.BadgeNumber,
                JurisdictionZone = user.JurisdictionZone,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }

    public class UserService : IUserService
    {
        private readonly MetroVerifyDbContext _context;
        private readonly IAuditService _auditService;

        public UserService(MetroVerifyDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return users.Select(AuthService.MapToUserDto);
        }

        public async Task<UserDto?> GetUserByIdAsync(string id)
        {
            var user = await _context.Users.FindAsync(id);
            return user != null ? AuthService.MapToUserDto(user) : null;
        }

        public async Task<UserDto?> UpdateUserAsync(string id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return null;

            if (!string.IsNullOrWhiteSpace(request.Name)) user.Name = request.Name;
            if (request.Phone != null) user.Phone = request.Phone;
            if (request.Organization != null) user.Organization = request.Organization;
            if (request.Designation != null) user.Designation = request.Designation;
            if (request.BadgeNumber != null) user.BadgeNumber = request.BadgeNumber;
            if (request.JurisdictionZone != null) user.JurisdictionZone = request.JurisdictionZone;
            if (request.Address != null) user.Address = request.Address;
            if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;

            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                null,
                "Admin",
                "Admin",
                "USER_UPDATED",
                "User",
                user.Id,
                $"Updated user profile: {user.Email}");

            return AuthService.MapToUserDto(user);
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            // Soft-deactivate user rather than hard delete if they have records
            user.IsActive = false;
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                null,
                "Admin",
                "Admin",
                "USER_DEACTIVATED",
                "User",
                user.Id,
                $"Deactivated user account: {user.Email}");

            return true;
        }
    }
}
