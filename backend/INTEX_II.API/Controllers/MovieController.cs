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
public IActionResult Get(int pageSize = 10, int pageNum = 1, string? searchQuery = "", [FromQuery] List<string>? genres = null)
{
    var allMovies = _movieContext.Movies.ToList();

    IEnumerable<Movie> filteredMovies = allMovies;

    // 🎯 Genre filter
    if (genres != null && genres.Any())
    {
        filteredMovies = filteredMovies.Where(m =>
            !string.IsNullOrEmpty(m.genres) &&
            genres.Any(g => m.genres.Contains(g, StringComparison.OrdinalIgnoreCase))
        );
    }

    // 🔍 Fuzzy Search Matching
    if (!string.IsNullOrWhiteSpace(searchQuery))
    {
        var searchLower = searchQuery.ToLower();

        var scored = filteredMovies
            .Select(movie =>
            {
                string title = movie.title?.ToLower() ?? "";
                string desc = movie.description?.ToLower() ?? "";
                string cast = movie.cast?.ToLower() ?? "";

                int ratioScore = Fuzz.Ratio(searchLower, title);
                int partialScore = Fuzz.PartialRatio(searchLower, title);
                int descScore = Fuzz.PartialRatio(searchLower, desc);
                int castScore = Fuzz.PartialRatio(searchLower, cast);

                // 🪄 Custom prefix bonus
                int prefixBonus = 0;
                if (title.StartsWith(searchLower)) prefixBonus += 30;
                else if (title.Length >= 5 && searchLower.Length >= 3 &&
                        title.Substring(0, Math.Min(5, title.Length)).StartsWith(searchLower.Substring(0, 3)))
                {
                    prefixBonus += 15;
                }

                int finalScore = Math.Max(ratioScore, partialScore);
                finalScore = Math.Max(finalScore, Math.Max(descScore, castScore));
                finalScore += prefixBonus;

                return new
                {
                    Movie = movie,
                    Score = finalScore
                };
            })
            .OrderByDescending(x => x.Score)
            .ToList();


        // Always return at least one full page (even if low similarity)
        filteredMovies = scored
            .Where(x => x.Score > 40) // minimum match threshold
            .DefaultIfEmpty(scored.First()) // fallback to best match
            .Select(x => x.Movie);
    }

    var totalNumMovies = filteredMovies.Count();

    var pagedMovies = filteredMovies
        .Skip((pageNum - 1) * pageSize)
        .Take(pageSize)
        .Select(m => new
        {
            show_id = m.show_id,
            type = m.type,
            title = m.title,
            director = m.director,
            cast = m.cast,
            country = m.country,
            release_year = m.release_year,
            rating = m.rating,
            duration = m.duration,
            description = m.description,
            genres = m.genres,
            posterUrl = m.posterUrl // Added poster URL
        })
        .ToList();

    var result = new
    {
        Movies = pagedMovies,
        TotalNumMovies = totalNumMovies
    };

    return Ok(result);
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
