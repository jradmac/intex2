// File: /backend/CineNiche.API/Models/SimilarMovie.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineNiche.API.Models
{
    [Table("similarMovies")]
    public class SimilarMovie
    {
        [Key]
        public int id { get; set; }
        
        [Column("show_id")]
        public string show_id { get; set; }
        
        [Column("similar_show_id")]
        public string similar_show_id { get; set; }
        
        [Column("similarity_score")]
        public double similarity_score { get; set; }
        
        [Column("recommendation_type")]
        public string recommendation_type { get; set; }
        
        [Column("created_at")]
        public DateTime created_at { get; set; }
    }
}