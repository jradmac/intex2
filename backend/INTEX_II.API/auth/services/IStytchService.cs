// File: /backend/CineNiche.Auth/Services/IStytchService.cs
using System.Threading.Tasks;

namespace CineNiche.Auth.Services
{
    public interface IStytchService
    {
        // Authentication methods
        Task<AuthResult> AuthenticateByEmailAsync(string email, string password);
        Task<AuthResult> AuthenticateByTokenAsync(string token);
        
        // User management methods
        Task<UserResult> CreateUserAsync(string email, string password, string firstName, string lastName);
        Task<UserResult> GetUserByIdAsync(string userId);
        Task<UserResult> GetUserByEmailAsync(string email);
        
        // Email verification/password reset
        Task<EmailResult> SendPasswordResetEmailAsync(string email);
        Task<EmailResult> SendEmailVerificationAsync(string email);
        Task<AuthResult> VerifyEmailAsync(string token);
        Task<AuthResult> ResetPasswordAsync(string token, string newPassword);
        
        // Session management
        Task<bool> RevokeSessionAsync(string sessionId);
        Task<SessionResult> GetSessionAsync(string sessionId);

        // OAuth methods
        Task<OAuthRedirectResult> GetOAuthRedirectUrlAsync(string provider, bool signup, string redirectUrl);
        Task<OAuthAuthResult> ExchangeOAuthCodeAsync(string code, string state);
        
        // Remove these two methods as they're now in TokenService
        // string GenerateJwtToken(string userId, string role);
        // bool ValidateJwtToken(string token, out string userId, out string role);
    }
    
    // Result classes remain unchanged
    public class AuthResult
    {
        public bool Success { get; set; }
        public string UserId { get; set; }
        public string SessionId { get; set; }
        public string Token { get; set; }
        public string Error { get; set; }
    }
    
    public class UserResult
    {
        public bool Success { get; set; }
        public string UserId { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool EmailVerified { get; set; }
        public string Error { get; set; }
    }
    
    public class EmailResult
    {
        public bool Success { get; set; }
        public string Email { get; set; }
        public string RequestId { get; set; }
        public string Error { get; set; }
    }
    
    public class SessionResult
    {
        public bool Success { get; set; }
        public string SessionId { get; set; }
        public string UserId { get; set; }
        public bool Active { get; set; }
        public string Error { get; set; }
    }
    public class OAuthRedirectResult
{
    public bool Success { get; set; }
    public string RedirectUrl { get; set; }
    public string State { get; set; }
    public string Error { get; set; }
}

public class OAuthAuthResult
{
    public bool Success { get; set; }
    public string UserId { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string SessionId { get; set; }
    public string Error { get; set; }
}
}