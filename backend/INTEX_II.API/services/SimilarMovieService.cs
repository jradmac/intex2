// File: /backend/CineNiche.API/Services/SimilarMovieService.cs
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
    public class SimilarMovieService : ISimilarMovieService
    {
        private readonly MovieDbContext _movieContext;
        private readonly ILogger<SimilarMovieService> _logger;

        public SimilarMovieService(MovieDbContext movieContext, ILogger<SimilarMovieService> logger)
        {
            _movieContext = movieContext;
            _logger = logger;
        }

        /// <summary>
        /// Gets similar movies for a specific show ID
        /// </summary>
        public async Task<List<Movie>> GetSimilarMoviesAsync(string showId, int limit = 10)
        {
            try
            {
                _logger.LogInformation($"Getting similar movies for show_id: {showId}");
                
                // Get similar movie IDs ordered by similarity score
                var similarMovieIds = await _movieContext.SimilarMovies
                    .Where(s => s.show_id == showId)
                    .OrderByDescending(s => s.similarity_score)
                    .Take(limit)
                    .Select(s => s.similar_show_id)
                    .ToListAsync();
                
                if (similarMovieIds.Count == 0)
                {
                    _logger.LogInformation($"No similar movies found for show_id: {showId}, returning fallback recommendations");
                    
                    // Fallback: return movies of the same genre or popular movies
                    var originalMovie = await _movieContext.Movies.FindAsync(showId);
                    if (originalMovie != null && !string.IsNullOrEmpty(originalMovie.genres))
                    {
                        // Extract the first genre
                        var genre = originalMovie.genres.Split(',').FirstOrDefault()?.Trim();
                        
                        if (!string.IsNullOrEmpty(genre))
                        {
                            _logger.LogInformation($"Using genre fallback: {genre} for show_id: {showId}");
                            
                            // Get movies with the same genre
                            return await _movieContext.Movies
                                .Where(m => m.show_id != showId && 
                                           m.genres != null && 
                                           m.genres.Contains(genre))
                                .OrderByDescending(m => m.release_year)
                                .Take(limit)
                                .ToListAsync();
                        }
                    }
                    
                    _logger.LogInformation($"Using recent movies fallback for show_id: {showId}");
                    
                    // If we can't find genre-based movies, return recent movies
                    return await _movieContext.Movies
                        .Where(m => m.show_id != showId)
                        .OrderByDescending(m => m.release_year)
                        .Take(limit)
                        .ToListAsync();
                }
                
                _logger.LogInformation($"Found {similarMovieIds.Count} similar movies for show_id: {showId}");
                
                // Get the actual movie details
                var movies = await _movieContext.Movies
                    .Where(m => similarMovieIds.Contains(m.show_id))
                    .ToListAsync();
                
                _logger.LogInformation($"Retrieved {movies.Count} movie details for similar movies");
                
                // Sort movies in the same order as the similarMovieIds
                var orderedMovies = similarMovieIds
                    .Select(id => movies.FirstOrDefault(m => m.show_id == id))
                    .Where(m => m != null)
                    .ToList();
                
                return orderedMovies;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting similar movies for show_id: {showId}");
                return new List<Movie>();
            }
        }
    }
}