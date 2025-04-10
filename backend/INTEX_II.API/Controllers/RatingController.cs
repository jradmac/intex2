// File: /backend/CineNiche.API/Controllers/RatingController.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CineNiche.API.Models;
using CineNiche.API.Services;
using System.Linq;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using CineNiche.Auth.Services;

namespace CineNiche.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingController : ControllerBase
    {
        private readonly IRatingService _ratingService;
        private readonly IUserService _userService;
        private readonly ILogger<RatingController> _logger;
        private readonly ITokenService _tokenService;

        public RatingController(
            IRatingService ratingService, 
            IUserService userService,
            ILogger<RatingController> logger,
            ITokenService tokenService
        )
        {
            _ratingService = ratingService;
            _userService = userService;
            _logger = logger;
            _tokenService = tokenService;
        }

        private string GetUserIdFromClaims()
        {
            _logger.LogInformation("Claims in token: " + 
                string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));

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
        [Route("show/{showId}")]
        public async Task<IActionResult> GetShowRatings(string showId)
        {
            var ratings = await _ratingService.GetAllRatingsForShowAsync(showId);
            var average = await _ratingService.GetAverageRatingForShowAsync(showId);
            var distribution = await _ratingService.GetRatingDistributionForShowAsync(showId);

            return Ok(new
            {
                average,
                totalRatings = ratings.Count,
                distribution,
                ratings
            });
        }

        [HttpGet]
        [Authorize]
        [Route("user/{showId}")]
        public async Task<IActionResult> GetUserRatingForShow(string showId)
        {
            var externalUserId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(externalUserId))
            {
                return BadRequest(new { message = "Invalid token - Could not extract user ID" });
            }

            var user = await _userService.GetUserByExternalIdAsync(externalUserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var rating = await _ratingService.GetUserRatingForShowAsync(user.Id, showId);
            if (rating == null)
            {
                return Ok(null);
            }

            return Ok(rating);
        }

        [HttpPost]
        [Authorize]
        [Route("rate")]
        public async Task<IActionResult> RateShow([FromBody] RateShowRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            var externalUserId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(externalUserId))
            {
                return BadRequest(new { message = "Invalid token - Could not extract user ID" });
            }

            var user = await _userService.GetUserByExternalIdAsync(externalUserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var rating = new UserRating
            {
                UserId = user.Id,
                ShowId = request.ShowId,
                Rating = request.Rating
            };

            var result = await _ratingService.AddOrUpdateRatingAsync(rating);
            return Ok(result);
        }

        [HttpDelete]
        [Authorize]
        [Route("{showId}")]
        public async Task<IActionResult> DeleteRating(string showId)
        {
            var externalUserId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(externalUserId))
            {
                return BadRequest(new { message = "Invalid token - Could not extract user ID" });
            }

            var user = await _userService.GetUserByExternalIdAsync(externalUserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var result = await _ratingService.DeleteUserRatingForShowAsync(user.Id, showId);
            if (!result)
            {
                return NotFound(new { message = "Rating not found" });
            }

            return Ok(new { message = "Rating deleted successfully" });
        }

        [HttpGet]
        [Authorize]
        [Route("my-ratings")]
        public async Task<IActionResult> GetUserRatings()
        {
            var externalUserId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(externalUserId))
            {
                return BadRequest(new { message = "Invalid token - Could not extract user ID" });
            }

            var user = await _userService.GetUserByExternalIdAsync(externalUserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var ratings = await _ratingService.GetAllRatingsByUserAsync(user.Id);
            return Ok(ratings);
        }
    }

    // Request classes
    public class RateShowRequest
    {
        public string ShowId { get; set; }
        public int Rating { get; set; }
    }
}