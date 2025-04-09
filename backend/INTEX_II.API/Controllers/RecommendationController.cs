// File: /backend/CineNiche.API/Controllers/RecommendationController.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CineNiche.API.Models;
using CineNiche.API.Services;
using System.Security.Claims;

namespace CineNiche.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;
        private readonly IUserService _userService;
        private readonly ILogger<RecommendationController> _logger;

        public RecommendationController(
            IRecommendationService recommendationService,
            IUserService userService,
            ILogger<RecommendationController> logger)
        {
            _recommendationService = recommendationService;
            _userService = userService;
            _logger = logger;
        }

        // Helper method to reliably extract user ID from claims
        private string GetUserIdFromClaims()
        {
            // Try multiple claim types that might contain the user ID
            var userId = User.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                return userId;
            }

            userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userId;
        }

        [HttpGet]
        [Authorize]
        [Route("forYou")]
        public async Task<IActionResult> GetPersonalizedRecommendations([FromQuery] int limit = 10)
        {
            try
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

                // Get demographic recommendations for this user
                var demographicRecs = await _recommendationService.GetDemographicRecommendationsAsync(
                    user.Gender, user.Age, limit);

                return Ok(new
                {
                    message = "Personalized recommendations",
                    recommendations = demographicRecs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personalized recommendations");
                return StatusCode(500, new { message = "An error occurred while fetching recommendations" });
            }
        }

        [HttpGet]
        [Authorize]
        [Route("byGenre/{genre}")]
        public async Task<IActionResult> GetRecommendationsByGenre(string genre, [FromQuery] int limit = 10)
        {
            try
            {
                // Get content-based recommendations for this genre
                var genreRecs = await _recommendationService.GetGenreRecommendationsAsync(genre, limit);

                return Ok(new
                {
                    message = $"Recommendations for {genre}",
                    recommendations = genreRecs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting genre recommendations for genre: {genre}");
                return StatusCode(500, new { message = "An error occurred while fetching genre recommendations" });
            }
        }

        [HttpGet]
        [Authorize]
        [Route("all")]
        public async Task<IActionResult> GetAllRecommendations([FromQuery] int limit = 10)
        {
            try
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

                // Get all recommendation categories
                var allRecs = await _recommendationService.GetUserRecommendationsAsync(user, limit);

                return Ok(new
                {
                    message = "All recommendations by category",
                    recommendations = allRecs
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all recommendations");
                return StatusCode(500, new { message = "An error occurred while fetching recommendations" });
            }
        }
    }
}