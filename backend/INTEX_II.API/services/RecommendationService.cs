// File: /backend/CineNiche.API/Services/RecommendationService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mission11.API.Data;
using CineNiche.API.Models;

namespace CineNiche.API.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly MovieDbContext _movieContext;
        private readonly ILogger<RecommendationService> _logger;

        public RecommendationService(MovieDbContext movieContext, ILogger<RecommendationService> logger)
        {
            _movieContext = movieContext;
            _logger = logger;
        }

        /// <summary>
        /// Gets demographic-based (collaborative) recommendations for a user
        /// </summary>
        public async Task<List<MovieRecommendation>> GetDemographicRecommendationsAsync(string gender, int? age, int limit = 10)
        {
            try
            {
                // Enhanced logging for debugging
                _logger.LogInformation($"GetDemographicRecommendationsAsync called with gender: '{gender}', age: {age}");
                
                // Handle null or empty gender
                string normalizedGender = NormalizeGender(gender);
                _logger.LogInformation($"Normalized gender: '{normalizedGender}'");
                
                // Map age to age group
                string ageGroup = MapAgeToAgeGroup(age);
                _logger.LogInformation($"Mapped age group: '{ageGroup}'");
                
                // Create demographic segment
                string demographicSegment = $"{normalizedGender}_{ageGroup}";
                _logger.LogInformation($"Constructed demographic segment: '{demographicSegment}'");
                
                // Let's try to be more flexible with our queries to find something that matches
                var recommendations = new List<MovieRecommendation>();
                
                // Try 1: Exact demographic segment match
                _logger.LogInformation($"QUERY 1: Looking for exact demographic segment: '{demographicSegment}'");
                recommendations = await _movieContext.MovieRecommendations
                    .Where(r => r.recommendation_type == "collaborative" 
                               && r.demographic_segment == demographicSegment)
                    .Take(limit)
                    .ToListAsync();

                if (recommendations.Count > 0)
                {
                    _logger.LogInformation($"Found {recommendations.Count} recommendations for exact segment '{demographicSegment}'");
                    // Enrich with movie details
                    await EnrichWithMovieDetailsAsync(recommendations);
                    return recommendations;
                }
                
                // Try 2: Gender match with same age group (different formatting perhaps)
                _logger.LogInformation($"QUERY 2: Looking for gender '{normalizedGender}' with age group '{ageGroup}'");
                recommendations = await _movieContext.MovieRecommendations
                    .Where(r => r.recommendation_type == "collaborative" 
                               && r.gender == normalizedGender
                               && r.age_group == ageGroup)
                    .Take(limit)
                    .ToListAsync();
                    
                if (recommendations.Count > 0)
                {
                    _logger.LogInformation($"Found {recommendations.Count} recommendations for gender '{normalizedGender}' and age_group '{ageGroup}'");
                    // Enrich with movie details
                    await EnrichWithMovieDetailsAsync(recommendations);
                    return recommendations;
                }
                
                // Try 3: Just gender
                _logger.LogInformation($"QUERY 3: Looking for just gender '{normalizedGender}'");
                recommendations = await _movieContext.MovieRecommendations
                    .Where(r => r.recommendation_type == "collaborative" 
                               && r.gender == normalizedGender)
                    .Take(limit)
                    .ToListAsync();
                    
                if (recommendations.Count > 0)
                {
                    _logger.LogInformation($"Found {recommendations.Count} recommendations for gender '{normalizedGender}'");
                    // Enrich with movie details
                    await EnrichWithMovieDetailsAsync(recommendations);
                    return recommendations;
                }
                
                // Try 4: Any collaborative recommendations
                _logger.LogInformation($"QUERY 4: Looking for any collaborative recommendations");
                recommendations = await _movieContext.MovieRecommendations
                    .Where(r => r.recommendation_type == "collaborative")
                    .Take(limit)
                    .ToListAsync();
                    
                if (recommendations.Count > 0)
                {
                    _logger.LogInformation($"Found {recommendations.Count} general collaborative recommendations");
                    // Enrich with movie details
                    await EnrichWithMovieDetailsAsync(recommendations);
                    return recommendations;
                }
                
                _logger.LogWarning("Could not find any collaborative recommendations");
                return new List<MovieRecommendation>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting demographic recommendations");
                return new List<MovieRecommendation>();
            }
        }

        /// <summary>
        /// Gets content-based recommendations by genre
        /// </summary>
        public async Task<List<MovieRecommendation>> GetGenreRecommendationsAsync(string genre, int limit = 10)
        {
            try
            {
                var recommendations = await _movieContext.MovieRecommendations
                    .Where(r => r.recommendation_type == "content" 
                               && r.genre == genre)
                    .Take(limit)
                    .ToListAsync();
                
                // Enrich with movie details
                await EnrichWithMovieDetailsAsync(recommendations);
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting genre recommendations for genre: {genre}");
                return new List<MovieRecommendation>();
            }
        }

        /// <summary>
        /// Gets a mix of recommendations based on user demographics
        /// </summary>
        public async Task<Dictionary<string, List<MovieRecommendation>>> GetUserRecommendationsAsync(User user, int limit = 10)
        {
            var result = new Dictionary<string, List<MovieRecommendation>>();
            
            try
            {
                // Log detailed user information for debugging
                _logger.LogInformation($"GetUserRecommendationsAsync for user with age: {user.Age}, gender: '{user.Gender}'");
                
                // 1. Get collaborative recommendations (For You)
                var userRecs = await GetDemographicRecommendationsAsync(user.Gender, user.Age, limit);
                
                if (userRecs.Count > 0)
                {
                    _logger.LogInformation($"Adding {userRecs.Count} collaborative recommendations to 'For You' category");
                    result.Add("For You", userRecs);
                }
                else 
                {
                    _logger.LogWarning("No collaborative recommendations found for this user");
                }
                
                // 2. Get content-based recommendations by genre
                var genres = await _movieContext.MovieRecommendations
                    .Where(r => r.recommendation_type == "content")
                    .Select(r => r.genre)
                    .Distinct()
                    .ToListAsync();
                
                foreach (var genre in genres)
                {
                    if (!string.IsNullOrEmpty(genre) && genre != "All")
                    {
                        var genreRecs = await _movieContext.MovieRecommendations
                            .Where(r => r.recommendation_type == "content" 
                                       && r.genre == genre)
                            .Take(limit)
                            .ToListAsync();
                        
                        if (genreRecs.Count > 0)
                        {
                            // Enrich with movie details
                            await EnrichWithMovieDetailsAsync(genreRecs);
                            result.Add(genre, genreRecs);
                        }
                    }
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all recommendations");
                return result;
            }
        }

        /// <summary>
        /// Maps a user's age to the appropriate age group for recommendations
        /// </summary>
        public string MapAgeToAgeGroup(int? age)
        {
            if (!age.HasValue)
            {
                _logger.LogInformation("Age is null, using 'unknown' as default");
                return "unknown"; // Default age group if age is not provided
            }
            
            _logger.LogInformation($"Mapping age: {age}");
            
            string result;
            if (age < 18)
            {
                result = "under 18";
            }
            else if (age >= 18 && age <= 30)
            {
                result = "18-30";
            }
            else if (age > 30 && age <= 45)
            {
                result = "31-45";
            }
            else if (age > 45 && age <= 60)
            {
                result = "46-60";
            }
            else
            {
                result = "over 60";
            }
            
            _logger.LogInformation($"Mapped age {age} to age group: '{result}'");
            return result;
        }

        /// <summary>
        /// Normalizes gender string from user profile to match recommendation table format
        /// </summary>
        private string NormalizeGender(string gender)
        {
            if (string.IsNullOrEmpty(gender))
            {
                _logger.LogInformation("Gender is null or empty, using 'All' as default");
                return "All"; // Default gender if not provided
            }
            
            // Log the input gender for debugging
            _logger.LogInformation($"Normalizing gender: '{gender}'");
            
            // Check for various forms of male
            if (gender.Trim().ToLower() == "male" || gender.Trim().ToLower() == "m")
            {
                _logger.LogInformation("Normalized to 'Male'");
                return "Male";
            }
            
            // Check for various forms of female
            if (gender.Trim().ToLower() == "female" || gender.Trim().ToLower() == "f")
            {
                _logger.LogInformation("Normalized to 'Female'");
                return "Female";
            }
            
            // Default case for non-binary or other
            _logger.LogInformation($"Gender '{gender}' not recognized as Male or Female, using 'All'");
            return "All";
        }

        /// <summary>
        /// Enriches the recommendation list with full movie details from the Movies table
        /// </summary>
        private async Task EnrichWithMovieDetailsAsync(List<MovieRecommendation> recommendations)
        {
            if (recommendations == null || recommendations.Count == 0)
            {
                return;
            }

            try
            {
                // Extract all show_ids from recommendations
                var showIds = recommendations.Select(r => r.show_id).Distinct().ToList();
                
                _logger.LogInformation($"Enriching {showIds.Count} movies with details from movies_titles table");
                
                // Get all movies that match these show_ids in a single query
                var movies = await _movieContext.Movies
                    .Where(m => showIds.Contains(m.show_id))
                    .ToDictionaryAsync(m => m.show_id, m => m);
                
                _logger.LogInformation($"Found {movies.Count} matching movies in the movies_titles table");
                
                // Add movie details to each recommendation
                foreach (var recommendation in recommendations)
                {
                    if (movies.TryGetValue(recommendation.show_id, out var movie))
                    {
                        // Add additional movie properties
                        recommendation.PosterUrl = movie.posterUrl;
                        recommendation.Director = movie.director;
                        recommendation.Cast = movie.cast;
                        recommendation.Description = movie.description;
                        recommendation.Rating = movie.rating;
                        recommendation.Duration = movie.duration;
                        recommendation.ReleaseYear = movie.release_year;
                        recommendation.Country = movie.country;
                        
                        _logger.LogDebug($"Enriched movie {recommendation.title} with poster URL: {recommendation.PosterUrl}");
                    }
                    else
                    {
                        _logger.LogWarning($"Could not find movie details for show_id: {recommendation.show_id}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enriching recommendations with movie details");
                throw; // Rethrow to be handled by the calling method
            }
        }
    }
}