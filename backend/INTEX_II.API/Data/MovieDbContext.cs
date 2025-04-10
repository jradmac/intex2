// File: /backend/CineNiche.API/Data/MovieDbContext.cs
using Microsoft.EntityFrameworkCore;
using CineNiche.API.Models;

namespace Mission11.API.Data
{
    public class MovieDbContext : DbContext
    {
        public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options) { }
        
        public DbSet<Movie> Movies { get; set; }
        
        // Add the DbSet for MovieRecommendations
        public DbSet<MovieRecommendation> MovieRecommendations { get; set; }
        
        // Add the DbSet for SimilarMovies
        public DbSet<SimilarMovie> SimilarMovies { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure MovieRecommendation entity
            modelBuilder.Entity<MovieRecommendation>(entity =>
            {
                entity.ToTable("movieRecommendations");
                
                // Configure the composite primary key
                entity.HasKey(e => new { e.demographic_segment, e.show_id });
                
                // Match column names exactly, especially for created-at with hyphen
                entity.Property(e => e.created_at)
                      .HasColumnName("created_at");
            });
            
            // Configure SimilarMovie entity
            modelBuilder.Entity<SimilarMovie>(entity =>
            {
                entity.ToTable("similarMovies");
                entity.HasKey(e => e.id);
            });
            
            // Configure Movie entity to use the correct table name
            modelBuilder.Entity<Movie>().ToTable("movies_titles");
        }
    }
}