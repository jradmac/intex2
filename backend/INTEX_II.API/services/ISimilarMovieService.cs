// File: /backend/CineNiche.API/Services/ISimilarMovieService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using CineNiche.API.Models;

namespace CineNiche.API.Services
{
    public interface ISimilarMovieService
    {
        /// <summary>
        /// Gets similar movies for a specific show ID
        /// </summary>
        Task<List<Movie>> GetSimilarMoviesAsync(string showId, int limit = 10);
    }
}