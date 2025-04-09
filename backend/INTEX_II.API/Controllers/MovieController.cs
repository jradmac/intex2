using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mission11.API.Data;
using CineNiche.API.Models;
using Microsoft.AspNetCore.Authorization;
using FuzzySharp;

namespace Mission11.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private MovieDbContext _movieContext;
        public MovieController(MovieDbContext temp)
        {
            _movieContext = temp;
        }

        [HttpGet("GetMovies")]
        public IActionResult Get(
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
            IEnumerable<Movie> filteredMovies = allMovies;

            if (genres != null && genres.Any())
            {
                filteredMovies = filteredMovies.Where(m =>
                    !string.IsNullOrEmpty(m.genres) &&
                    genres.Any(g => m.genres.Contains(g, StringComparison.OrdinalIgnoreCase))
                );
            }

            if (ratings != null && ratings.Any())
            {
                filteredMovies = filteredMovies.Where(m =>
                    !string.IsNullOrEmpty(m.rating) &&
                    ratings.Contains(m.rating, StringComparer.OrdinalIgnoreCase)
                );
            }

            if (minYear.HasValue)
            {
                filteredMovies = filteredMovies.Where(m => m.release_year >= minYear);
            }

            if (maxYear.HasValue)
            {
                filteredMovies = filteredMovies.Where(m => m.release_year <= maxYear);
            }

            List<Movie> titleMatches = filteredMovies.ToList();
            List<Movie> directorMatches = filteredMovies.ToList();

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var searchLower = searchQuery.ToLower();

                var scored = titleMatches
                    .Select(movie =>
                    {
                        string title = movie.title?.ToLower() ?? "";
                        string desc = movie.description?.ToLower() ?? "";
                        string cast = movie.cast?.ToLower() ?? "";

                        int baseScore = new[] {
                            Fuzz.Ratio(searchLower, title),
                            Fuzz.PartialRatio(searchLower, title),
                            Fuzz.PartialRatio(searchLower, desc),
                            Fuzz.PartialRatio(searchLower, cast)
                        }.Max();

                        int exactMatchBonus = title == searchLower && searchLower.Length == title.Length ? 150 : 0;

                        int prefixBonus = title.StartsWith(searchLower)
                            ? 100
                            : (title.Length >= 5 && searchLower.Length >= 3 &&
                               title.Substring(0, Math.Min(5, title.Length))
                                     .StartsWith(searchLower.Substring(0, 3)))
                                ? 30
                                : 0;

                        int score = baseScore + exactMatchBonus + prefixBonus;

                        return new { Movie = movie, Score = score };
                    })
                    .OrderByDescending(x => x.Score)
                    .ToList();

                int dynamicThreshold = searchLower.Length <= 2 ? 0 : 40;

                titleMatches = scored
                    .Where(x => x.Score > dynamicThreshold)
                    .DefaultIfEmpty(scored.First())
                    .Select(x => x.Movie)
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(director))
            {
                var directorLower = director.ToLower();

                var scored = directorMatches
                    .Select(movie =>
                    {
                        string dir = movie.director?.ToLower() ?? "";
                        int score = Fuzz.PartialRatio(directorLower, dir);
                        return new { Movie = movie, Score = score };
                    })
                    .OrderByDescending(x => x.Score)
                    .ToList();

                directorMatches = scored
                    .Where(x => x.Score > 40)
                    .DefaultIfEmpty(scored.First())
                    .Select(x => x.Movie)
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(searchQuery) && !string.IsNullOrWhiteSpace(director))
            {
                filteredMovies = titleMatches.Intersect(directorMatches);
            }
            else if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                filteredMovies = titleMatches;
            }
            else if (!string.IsNullOrWhiteSpace(director))
            {
                filteredMovies = directorMatches;
            }

            var totalNumMovies = filteredMovies.Count();

            var pagedMovies = filteredMovies
                .Skip((pageNum - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var result = new
            {
                Movies = pagedMovies,
                TotalNumMovies = totalNumMovies
            };

            return Ok(result);
        }

        [HttpGet("{show_id}")]
        public IActionResult GetMovieById(string show_id)
        {
            var movie = _movieContext.Movies.Find(show_id);
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            return Ok(movie);
        }

        [HttpGet("GetGenres")]
        public IActionResult GetGenres()
        {
            var genreList = _movieContext.Movies
                .Where(m => m.genres != null)
                .AsEnumerable()
                .SelectMany(m => m.genres.Split(new[] { ',' }, StringSplitOptions.None))
                .Select(g => g.Trim())
                .Distinct()
                .OrderBy(g => g)
                .ToList();

            return Ok(genreList);
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
        public IActionResult UpdateMovie(string show_id, [FromBody] Movie updatedMovie)
        {
            var existingMovie = _movieContext.Movies.Find(show_id);
            if (existingMovie == null)
            {
                return NotFound();
            }

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

            return Ok(existingMovie);
        }

        [HttpDelete("DeleteMovie/{show_id}")]
        [Authorize(Policy = "AdminOnly")]
        public IActionResult DeleteMovie(string show_id)
        {
            var movie = _movieContext.Movies.Find(show_id);

            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            _movieContext.Movies.Remove(movie);
            _movieContext.SaveChanges();

            return NoContent();
        }
    }
}
