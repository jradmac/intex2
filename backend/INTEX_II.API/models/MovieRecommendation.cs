// File: /backend/CineNiche.API/Models/MovieRecommendation.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineNiche.API.Models
{
    [Table("movieRecommendations")]
    public class MovieRecommendation
    {
        [Column("demographic_segment")]
        public string demographic_segment { get; set; }
        
        [Column("gender")]
        public string gender { get; set; }
        
        [Column("age_group")]
        public string age_group { get; set; }
        
        [Column("genre")]
        public string genre { get; set; }
        
        [Column("recommendation_type")]
        public string recommendation_type { get; set; }
        
        [Column("show_id")]
        public string show_id { get; set; }
        
        [Column("title")]
        public string title { get; set; }
        
        [Column("type")]
        public string type { get; set; }
        
        [Column("created_at")] // Note the hyphen in the column name
        public DateTime created_at { get; set; }

        // Additional properties from the Movies table (not mapped to DB columns)
        [NotMapped]
        public string PosterUrl { get; set; }
        
        [NotMapped]
        public string Director { get; set; }
        
        [NotMapped]
        public string Cast { get; set; }
        
        [NotMapped]
        public string Description { get; set; }
        
        [NotMapped]
        public string Rating { get; set; }
        
        [NotMapped]
        public string Duration { get; set; }
        
        [NotMapped]
        public int ReleaseYear { get; set; }
        
        [NotMapped]
        public string Country { get; set; }
    }
}