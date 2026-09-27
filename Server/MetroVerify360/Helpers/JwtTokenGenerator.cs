using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MetroVerify360.Models;

namespace MetroVerify360.Helpers
{
    public class JwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public (string token, DateTime expiresAt) GenerateToken(User user)
        {
            var keyString = _configuration["Jwt:Key"] ?? "MetroVerify360_Super_Secret_Statutory_Key_2026_Minimum_32_Chars!";
            var issuer = _configuration["Jwt:Issuer"] ?? "MetroVerify360";
            var audience = _configuration["Jwt:Audience"] ?? "MetroVerify360Client";
            var expiryMinutes = Convert.ToInt32(_configuration["Jwt:ExpiryMinutes"] ?? "1440");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }
    }
}
