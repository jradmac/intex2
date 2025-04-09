using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mission11.API.Data;
using CineNiche.API.Models;
using CineNiche.API.Services;
using Microsoft.AspNetCore.Authorization;
using FuzzySharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mission11.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly MovieDbContext _movieContext;
        private readonly ISimilarMovieService _similarMovieService;

        public MovieController(MovieDbContext temp, ISimilarMovieService similarMovieService)
        {
            _movieContext = temp;
            _similarMovieService = similarMovieService;
        }

        [HttpGet("GetMovies")]
        public IActionResult GetMovies(
            int pageSize = 10,
            int pageNum = 1,
            string? searchQuery = "",
            string? director = "",
            int? minYear = null,
            int? maxYear = null,
            [FromQuery] List<string>? genres = null,
            [FromQuery] List<string>? ratings = null)
        {
            var allMovies = _movieContext.Movies.ToList();
            IEnumerable<Movie> filtered = allMovies;

            // Genre filter
            if (genres != null && genres.Any())
            {
                filtered = filtered.Where(m =>
                    !string.IsNullOrEmpty(m.genres) &&
                    genres.Any(g => m.genres.Contains(g, StringComparison.OrdinalIgnoreCase)));
            }

            // Rating filter
            if (ratings != null && ratings.Any())
            {
                filtered = filtered.Where(m =>
                    !string.IsNullOrEmpty(m.rating) &&
                    ratings.Contains(m.rating, StringComparer.OrdinalIgnoreCase));
            }

            // Year range filter
            if (minYear.HasValue)
                filtered = filtered.Where(m => m.release_year >= minYear);
            if (maxYear.HasValue)
                filtered = filtered.Where(m => m.release_year <= maxYear);

            var searchFiltered = filtered.ToList();
            var directorFiltered = filtered.ToList();

            // Fuzzy search on title, description, cast
            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var query = searchQuery.ToLower();
                var scored = searchFiltered.Select(m =>
                {
                    var title = m.title?.ToLower() ?? "";
                    var desc = m.description?.ToLower() ?? "";
                    var cast = m.cast?.ToLower() ?? "";

                    int score = new[]
                    {
                        Fuzz.Ratio(query, title),
                        Fuzz.PartialRatio(query, title),
                        Fuzz.PartialRatio(query, desc),
                        Fuzz.PartialRatio(query, cast)
                    }.Max();

                    int bonus = title.StartsWith(query) ? 100 :
                                (title.Length >= 5 && query.Length >= 3 &&
                                title.Substring(0, Math.Min(5, title.Length))
                                      .StartsWith(query.Substring(0, 3))) ? 30 : 0;

                    return new { Movie = m, Score = score + bonus };
                })
                .OrderByDescending(x => x.Score)
                .ToList();

                int threshold = query.Length <= 2 ? 0 : 40;
                searchFiltered = scored
                    .Where(x => x.Score > threshold)
                    .DefaultIfEmpty(scored.First())
                    .Select(x => x.Movie)
                    .ToList();
            }

            // Fuzzy match on director
            if (!string.IsNullOrWhiteSpace(director))
            {
                var query = director.ToLower();
                var scored = directorFiltered.Select(m =>
                {
                    var dir = m.director?.ToLower() ?? "";
                    int score = Fuzz.PartialRatio(query, dir);
                    return new { Movie = m, Score = score };
                })
                .OrderByDescending(x => x.Score)
                .ToList();

                directorFiltered = scored
                    .Where(x => x.Score > 40)
                    .DefaultIfEmpty(scored.First())
                    .Select(x => x.Movie)
                    .ToList();
            }

            // Combine filters
            if (!string.IsNullOrWhiteSpace(searchQuery) && !string.IsNullOrWhiteSpace(director))
                filtered = searchFiltered.Intersect(directorFiltered);
            else if (!string.IsNullOrWhiteSpace(searchQuery))
                filtered = searchFiltered;
            else if (!string.IsNullOrWhiteSpace(director))
                filtered = directorFiltered;

            var total = filtered.Count();

            var movies = filtered
                .Skip((pageNum - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new
                {
                    m.show_id,
                    m.type,
                    m.title,
                    m.director,
                    m.cast,
                    m.country,
                    m.release_year,
                    m.rating,
                    m.duration,
                    m.description,
                    m.genres,
                    m.posterUrl
                })
                .ToList();

            return Ok(new { Movies = movies, TotalNumMovies = total });
        }

        [HttpGet("{show_id}")]
        public IActionResult GetMovieById(string show_id)
        {
            var movie = _movieContext.Movies.Find(show_id);
            return movie != null ? Ok(movie) : NotFound(new { message = "Movie not found" });
        }

        [HttpGet("GetGenres")]
        public IActionResult GetGenres()
        {
            var genres = _movieContext.Movies
                .Where(m => m.genres != null)
                .AsEnumerable()
                .SelectMany(m => m.genres.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .Select(g => g.Trim())
                .Distinct()
                .OrderBy(g => g)
                .ToList();

            return Ok(genres);
        }

        [HttpGet("GetSimilarMovies/{show_id}")]
        public async Task<IActionResult> GetSimilarMovies(string show_id, [FromQuery] int limit = 10)
        {
            try
            {
                var similarMovies = await _similarMovieService.GetSimilarMoviesAsync(show_id, limit);
                return Ok(similarMovies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting similar movies: {ex.Message}" });
            }
        }

        [HttpPost("AddMovie")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult AddMovie([FromBody] Movie newMovie)
        {
            _movieContext.Movies.Add(newMovie);
            _movieContext.SaveChanges();
            return Ok(newMovie);
        }

        [HttpPut("UpdateMovie/{show_id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult UpdateMovie(string show_id, [FromBody] Movie updated)
        {
            var movie = _movieContext.Movies.Find(show_id);
            if (movie == null) return NotFound();

            movie.type = updated.type;
            movie.title = updated.title;
            movie.director = updated.director;
            movie.cast = updated.cast;
            movie.country = updated.country;
            movie.release_year = updated.release_year;
            movie.rating = updated.rating;
            movie.duration = updated.duration;
            movie.description = updated.description;
            movie.genres = updated.genres;
            movie.posterUrl = updated.posterUrl;

            _movieContext.SaveChanges();
            return Ok(movie);
        }

        [HttpDelete("DeleteMovie/{show_id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult DeleteMovie(string show_id)
        {
            var movie = _movieContext.Movies.Find(show_id);
            if (movie == null) return NotFound(new { message = "Movie not found" });

            _movieContext.Movies.Remove(movie);
            _movieContext.SaveChanges();
            return NoContent();
        }
    }
}