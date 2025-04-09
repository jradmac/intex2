// File: /backend/CineNiche.API/Services/IRecommendationService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using CineNiche.API.Models;

namespace CineNiche.API.Services
{
    public interface IRecommendationService
    {
        /// <summary>
        /// Gets demographic-based (collaborative) recommendations for a user
        /// </summary>
        Task<List<MovieRecommendation>> GetDemographicRecommendationsAsync(string gender, int? age, int limit = 10);
        
        /// <summary>
        /// Gets content-based recommendations by genre
        /// </summary>
        Task<List<MovieRecommendation>> GetGenreRecommendationsAsync(string genre, int limit = 10);
        
        /// <summary>
        /// Gets a mix of recommendations based on user demographics
        /// </summary>
        Task<Dictionary<string, List<MovieRecommendation>>> GetUserRecommendationsAsync(User user, int limit = 10);
        
        /// <summary>
        /// Maps a user's age to the appropriate age group for recommendations
        /// </summary>
        string MapAgeToAgeGroup(int? age);
    }
}