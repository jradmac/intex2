using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mission11.API.Data;
using CineNiche.API.Models;
using Microsoft.AspNetCore.Authorization;

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
            var query = _movieContext.Movies.AsQueryable();

            // 🔍 Search filter
            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var lowered = searchQuery.ToLower();
                query = query.Where(m =>
                    (m.title != null && m.title.ToLower().Contains(lowered)) ||
                    (m.description != null && m.description.ToLower().Contains(lowered)) ||
                    (m.cast != null && m.cast.ToLower().Contains(lowered))
                );
            }

            // 🎯 Genre filter
            if (genres != null && genres.Any())
            {
                query = query.Where(m => genres.Any(g => !string.IsNullOrEmpty(m.genres) && m.genres.Contains(g)));
            }

            var totalNumMovies = query.Count();

            var pagedMovies = query
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
