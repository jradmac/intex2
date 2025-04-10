// File: /frontend/src/components/RecommendationCategory.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { MovieRecommendation } from '../api/RecommendationAPI';
import MovieDetailsModal from './MovieDetailsModal';

interface RecommendationCategoryProps {
  title: string;
  recommendations: MovieRecommendation[];
  loading: boolean;
}

const RecommendationCategory: React.FC<RecommendationCategoryProps> = ({ 
  title, 
  recommendations, 
  loading 
}) => {
  const [selectedMovie, setSelectedMovie] = useState<MovieRecommendation | null>(null);

  const handleMovieClick = (movie: MovieRecommendation) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  if (loading) {
    return (
      <CategoryWrapper>
        <CategoryHeader>
          <CategoryTitle>{title}</CategoryTitle>
        </CategoryHeader>
        <MovieCarousel>
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </MovieCarousel>
      </CategoryWrapper>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't display empty categories
  }

  return (
    <CategoryWrapper>
      <CategoryHeader>
        <CategoryTitle>{title}</CategoryTitle>
      </CategoryHeader>
      
      <MovieCarousel>
        {recommendations.map((movie, index) => (
          <MovieCard 
            key={`${movie.show_id}-${index}`}
            onClick={() => handleMovieClick(movie)}
          >
            <MoviePoster $hasImage={!!movie.posterUrl}>
              {movie.posterUrl ? (
                <PosterImage 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite loops
                    e.currentTarget.src = '/placeholder-poster.jpg'; // Use a placeholder image
                  }}
                />
              ) : (
                <MoviePosterTitle>{movie.title}</MoviePosterTitle>
              )}
            </MoviePoster>
            <MovieInfo>
              <MovieTitle>{movie.title}</MovieTitle>
              <MovieDetails>
                {movie.type} • {movie.releaseYear || ''}
              </MovieDetails>
              <RecTypeTag 
                $isCollaborative={movie.recommendation_type === "collaborative"}
              >
                {movie.recommendation_type === "collaborative" 
                  ? "Recommended for you" 
                  : "Similar content"}
              </RecTypeTag>
            </MovieInfo>
          </MovieCard>
        ))}
      </MovieCarousel>
      
      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal 
          movie={selectedMovie} 
          onClose={handleCloseModal} 
          onSelectMovie={handleMovieClick} // Added to handle clicking similar movies
        />
      )}
    </CategoryWrapper>
  );
};

export default RecommendationCategory;

// Styled Components
const CategoryWrapper = styled.div`
  margin-bottom: 40px;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CategoryTitle = styled.h3`
  font-size: 1.5rem;
  margin: 0;
  color: #fff;
`;

const MovieCarousel = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 16px;
  scrollbar-width: none; /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
  }
  
  -ms-overflow-style: none; /* IE and Edge */
`;

const MovieCard = styled.div`
  flex: 0 0 200px;
  background-color: #222;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
`;

interface MoviePosterProps {
  $hasImage: boolean;
}

const MoviePoster = styled.div<MoviePosterProps>`
  height: 300px;
  background-color: ${props => props.$hasImage ? 'transparent' : '#333'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  overflow: hidden;
`;

const PosterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MoviePosterTitle = styled.span`
  text-align: center;
  padding: 0 10px;
  font-size: 0.9rem;
`;

const MovieInfo = styled.div`
  padding: 12px;
`;

const MovieTitle = styled.h4`
  margin: 0 0 6px 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MovieDetails = styled.p`
  margin: 0 0 8px 0;
  font-size: 0.8rem;
  color: #aaa;
`;

interface RecTypeTagProps {
  $isCollaborative: boolean;
}

const RecTypeTag = styled.span<RecTypeTagProps>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  background-color: ${props => props.$isCollaborative ? 'rgba(229, 9, 20, 0.2)' : 'rgba(33, 150, 83, 0.2)'};
  color: ${props => props.$isCollaborative ? '#f88' : '#8f8'};
`;

const SkeletonCard = styled.div`
  flex: 0 0 200px;
  height: 400px;
  background-color: #222;
  border-radius: 5px;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(34, 34, 34, 0) 0%,
      rgba(68, 68, 68, 0.5) 50%,
      rgba(34, 34, 34, 0) 100%
    );
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;