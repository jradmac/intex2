// File: /backend/CineNiche.API/Controllers/UserController.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CineNiche.API.Models;
using CineNiche.API.Services;
using CineNiche.Auth.Services;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using Mission11.API.Data;

namespace CineNiche.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IStytchService _stytchService;
        private readonly ILogger<UserController> _logger;
        private readonly ITokenService _tokenService;
    
        private readonly MovieDbContext _movieContext;

        public UserController(
            IUserService userService, 
            IStytchService stytchService, 
            ILogger<UserController> logger,
            ITokenService tokenService)
        {
            _userService = userService;
            _stytchService = stytchService;
            _logger = logger;
            _tokenService = tokenService;
        }

        // Helper method to reliably extract user ID from claims
        private string GetUserIdFromClaims()
        {
            // Log all claims for debugging
            _logger.LogInformation("Claims in token: " + 
                string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));

            // Try multiple claim types that might contain the user ID
            var userId = User.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation($"Found user ID in 'sub' claim: {userId}");
                return userId;
            }

            userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation($"Found user ID in NameIdentifier claim: {userId}");
                return userId;
            }

            // Try to get the authentication token and extract user ID directly
            if (HttpContext.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var token = authHeader.ToString().Replace("Bearer ", "");
                string extractedUserId, role;
                if (_tokenService.ReadTokenInfo(token, out extractedUserId, out role))
                {
                    _logger.LogInformation($"Extracted user ID from token: {extractedUserId}");
                    return extractedUserId;
                }
            }

            _logger.LogWarning("Failed to extract user ID from claims or token");
            return null;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        [Route("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetUsersByRoleAsync("User");
            return Ok(users);
        }

        [HttpGet]
        [Authorize]
        [Route("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            // Get the user ID from claims
            var userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "Invalid token - Could not extract user ID" });
            }

            // Get user from database
            var user = await _userService.GetUserByExternalIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning($"User not found with ExternalAuthId: {userId}");
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                age = user.Age,
                gender = user.Gender,
                profileImageUrl = user.ProfileImageUrl,
                role = user.Role,
                isActive = user.IsActive,
                createdAt = user.CreatedAt,
                lastLogin = user.LastLogin
            });
        }

        [HttpPut]
        [Authorize]
        [Route("profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateProfileRequest request)
        {
            try 
            {
                // Log full request details for debugging
                _logger.LogInformation($"Profile update request received. Headers: {string.Join(", ", Request.Headers.Select(h => $"{h.Key}={h.Value}"))}");
                _logger.LogInformation($"Profile update request body: Age={request.Age}, Gender={request.Gender}, Phone={request.Phone}");
                
                // Get the user ID from claims
                var userId = GetUserIdFromClaims();
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("Profile update failed: Could not extract user ID from token");
                    return BadRequest(new { message = "Invalid token - Could not extract user ID" });
                }

                _logger.LogInformation($"Updating profile for user with ExternalAuthId: {userId}");

                // Get user from database
                var user = await _userService.GetUserByExternalIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"Profile update failed: User not found with ExternalAuthId: {userId}");
                    return NotFound(new { message = "User not found" });
                }

                // Update user properties
                if (request.FirstName != null)
                {
                    user.FirstName = request.FirstName;
                    _logger.LogInformation($"Updating firstName to: {request.FirstName}");
                }
                
                if (request.LastName != null)
                {
                    user.LastName = request.LastName;
                    _logger.LogInformation($"Updating lastName to: {request.LastName}");
                }
                    
                if (!string.IsNullOrEmpty(request.ProfileImageUrl))
                {
                    user.ProfileImageUrl = request.ProfileImageUrl;
                    _logger.LogInformation($"Updating profileImageUrl to: {request.ProfileImageUrl}");
                }
                
                // Update age and gender if provided
                if (request.Age.HasValue)
                {
                    user.Age = request.Age;
                    _logger.LogInformation($"Updating age to: {request.Age}");
                }
                
                if (!string.IsNullOrEmpty(request.Gender))
                {
                    user.Gender = request.Gender;
                    _logger.LogInformation($"Updating gender to: {request.Gender}");
                }
                
                // Update phone if provided
                if (!string.IsNullOrEmpty(request.Phone))
                {
                    user.Phone = request.Phone;
                    _logger.LogInformation($"Updating phone to: {request.Phone}");
                }

                // Save changes
                await _userService.UpdateUserAsync(user);
                _logger.LogInformation($"Profile updated successfully for user: {user.Email}");

                return Ok(new 
                { 
                    message = "Profile updated successfully",
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        age = user.Age,
                        gender = user.Gender,
                        phone = user.Phone,
                        profileImageUrl = user.ProfileImageUrl,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during profile update");
                return StatusCode(500, new { message = $"An unexpected error occurred: {ex.Message}" });
            }
        }

        [HttpGet("GetMovieById/{show_id}")]
            public IActionResult GetMovieById(string show_id)
            {
                var movie = _movieContext.Movies.Find(show_id);
                
                if (movie == null)
                {
                    return NotFound(new { message = "Movie not found" });
                }
                
                return Ok(movie);
            }

[HttpGet("Search")]
public IActionResult SearchMovies([FromQuery] string query, int pageSize = 10, int pageNum = 1)
{
    if (string.IsNullOrEmpty(query))
    {
        return BadRequest(new { message = "Search query is required" });
    }
    
    var searchQuery = query.ToLower();
    
    var results = _movieContext.Movies
        .Where(m => 
            (m.title != null && m.title.ToLower().Contains(searchQuery)) ||
            (m.description != null && m.description.ToLower().Contains(searchQuery)) ||
            (m.director != null && m.director.ToLower().Contains(searchQuery)) ||
            (m.cast != null && m.cast.ToLower().Contains(searchQuery)) ||
            (m.genres != null && m.genres.ToLower().Contains(searchQuery))
        )
        .Skip((pageNum - 1) * pageSize)
        .Take(pageSize)
        .ToList();
        
    var totalResults = _movieContext.Movies
        .Count(m => 
            (m.title != null && m.title.ToLower().Contains(searchQuery)) ||
            (m.description != null && m.description.ToLower().Contains(searchQuery)) ||
            (m.director != null && m.director.ToLower().Contains(searchQuery)) ||
            (m.cast != null && m.cast.ToLower().Contains(searchQuery)) ||
            (m.genres != null && m.genres.ToLower().Contains(searchQuery))
        );
    
    return Ok(new { 
        Movies = results,
        TotalResults = totalResults
    });
}

// Improve update functionality with better validation
[HttpPut("UpdateMovie/{show_id}")]
[Authorize(Policy = "AdminOnly")]
public IActionResult UpdateMovie(string show_id, [FromBody] Movie updatedMovie)
{
    var existingMovie = _movieContext.Movies.Find(show_id);
    if (existingMovie == null)
    {
        return NotFound(new { message = "Movie not found" });
    }

    try
    {
        // Basic fields
        existingMovie.type = updatedMovie.type;
        existingMovie.title = updatedMovie.title;
        existingMovie.director = updatedMovie.director;
        existingMovie.cast = updatedMovie.cast;
        existingMovie.country = updatedMovie.country;
        existingMovie.release_year = updatedMovie.release_year;
        existingMovie.rating = updatedMovie.rating;
        existingMovie.duration = updatedMovie.duration;
        existingMovie.description = updatedMovie.description;
        existingMovie.genres = updatedMovie.genres;

        _movieContext.Movies.Update(existingMovie);
        _movieContext.SaveChanges();

        return Ok(new { 
            message = "Movie updated successfully", 
            movie = existingMovie 
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = $"Error updating movie: {ex.Message}" });
    }
}

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        [Route("change-role")]
        public async Task<IActionResult> ChangeUserRole([FromBody] ChangeRoleRequest request)
        {
            // Validate role
            if (request.Role != "User" && request.Role != "Admin")
            {
                return BadRequest(new { message = "Invalid role" });
            }

            // Get user by ID
            var user = await _userService.GetUserByIdAsync(request.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Update role
            var result = await _userService.AssignRoleAsync(request.UserId, request.Role);
            if (!result)
            {
                return StatusCode(500, new { message = "Failed to update user role" });
            }

            return Ok(new { message = "User role updated successfully" });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        [Route("activate")]
        public async Task<IActionResult> ActivateUser([FromBody] UserStatusRequest request)
        {
            var result = await _userService.ActivateUserAsync(request.UserId);
            if (!result)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { message = "User activated successfully" });
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        [Route("deactivate")]
        public async Task<IActionResult> DeactivateUser([FromBody] UserStatusRequest request)
        {
            var result = await _userService.DeactivateUserAsync(request.UserId);
            if (!result)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { message = "User deactivated successfully" });
        }
    }

    // Request classes
    public class UpdateProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? Phone { get; set; }
    }

    public class ChangeRoleRequest
    {
        public Guid UserId { get; set; }
        public string Role { get; set; }
    }

    public class UserStatusRequest
    {
        public Guid UserId { get; set; }
    }
}