// File: /frontend/src/components/MovieDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MovieRecommendation } from '../api/RecommendationAPI';
import { Movie } from '../types/Movie';
import { getSimilarMovies } from '../api/MovieAPI';

interface MovieDetailsModalProps {
  movie: MovieRecommendation | null;
  onClose: () => void;
  onSelectMovie?: (movie: MovieRecommendation) => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, onClose, onSelectMovie }) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!movie) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getSimilarMovies(movie.show_id);
        setSimilarMovies(data);
      } catch (err) {
        console.error('Error fetching similar movies:', err);
        setError('Failed to load similar movies');
        // Don't leave the user with no similar movies if there's an error
        setSimilarMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [movie]);

  if (!movie) return null;

  // Ensure safe handling of optional fields
  const posterUrl = movie.posterUrl || '';
  const director = movie.director || 'Unknown director';
  const cast = movie.cast || 'Cast information not available';
  const description = movie.description || 'No description available';
  const rating = movie.rating || 'Not rated';
  const duration = movie.duration || 'Unknown duration';
  const releaseYear = movie.releaseYear || 0;
  const country = movie.country || 'Unknown origin';

  // Handle cast list - split by commas if available
  const castList = cast.split(',').map(actor => actor.trim()).filter(actor => actor);

  // Convert Movie to MovieRecommendation for similar movies when clicked
  const handleSimilarMovieClick = (similarMovie: Movie) => {
    if (!onSelectMovie) return;
    
    // Create a MovieRecommendation object from the Movie
    const recommendationFromMovie: MovieRecommendation = {
      demographic_segment: "",
      gender: "",
      age_group: "",
      genre: similarMovie.genres || "",
      recommendation_type: "content",
      show_id: similarMovie.show_id,
      title: similarMovie.title || "",
      type: similarMovie.type || "",
      created_at: new Date().toISOString(),
      posterUrl: similarMovie.posterUrl,
      director: similarMovie.director,
      cast: similarMovie.cast,
      description: similarMovie.description,
      rating: similarMovie.rating,
      duration: similarMovie.duration,
      releaseYear: similarMovie.release_year,
      country: similarMovie.country
    };
    
    onSelectMovie(recommendationFromMovie);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <ModalHeader>
          <MovieTitle>{movie.title}</MovieTitle>
          <MovieMeta>
            {movie.type} • {releaseYear > 0 ? releaseYear : ''} • {rating} • {duration}
          </MovieMeta>
        </ModalHeader>
        
        <ModalBody>
          <MovieDetailsLayout>
            <PosterSection>
              {posterUrl ? (
                <MoviePoster 
                  src={posterUrl} 
                  alt={`${movie.title} poster`}
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Prevent infinite error loops
                    e.currentTarget.src = '/placeholder-poster.jpg'; // Use a placeholder image
                  }} 
                />
              ) : (
                <MoviePosterPlaceholder>
                  <MoviePosterTitle>{movie.title}</MoviePosterTitle>
                </MoviePosterPlaceholder>
              )}
              
              <RecommendationBadge 
                $isCollaborative={movie.recommendation_type === "collaborative"}
              >
                {movie.recommendation_type === "collaborative" 
                  ? "Recommended for you" 
                  : "Similar content"}
              </RecommendationBadge>
            </PosterSection>
            
            <InfoSection>
              <InfoBlock>
                <InfoLabel>Genre:</InfoLabel>
                <InfoText>{movie.genre}</InfoText>
              </InfoBlock>
              
              <InfoBlock>
                <InfoLabel>Director:</InfoLabel>
                <InfoText>{director}</InfoText>
              </InfoBlock>
              
              <InfoBlock>
                <InfoLabel>Country:</InfoLabel>
                <InfoText>{country}</InfoText>
              </InfoBlock>
              
              <InfoBlock>
                <InfoLabel>Description:</InfoLabel>
                <Description>{description}</Description>
              </InfoBlock>
              
              {castList.length > 0 && (
                <InfoBlock>
                  <InfoLabel>Cast:</InfoLabel>
                  <CastGrid>
                    {castList.map((actor, index) => (
                      <CastMember key={index}>{actor}</CastMember>
                    ))}
                  </CastGrid>
                </InfoBlock>
              )}
            </InfoSection>
          </MovieDetailsLayout>
          
          {/* Similar Movies Section */}
          <SimilarMoviesSection>
            <SimilarMoviesHeader>
              <SectionTitle>Similar Movies</SectionTitle>
              <ScrollIndicator>
                <ScrollIcon>↔️</ScrollIcon>
                <ScrollText>Scroll for more</ScrollText>
              </ScrollIndicator>
            </SimilarMoviesHeader>
            
            {loading ? (
              <LoadingText>Loading similar movies...</LoadingText>
            ) : error ? (
              <ErrorText>{error}</ErrorText>
            ) : similarMovies.length === 0 ? (
              <NoMoviesText>We're looking for recommendations based on this title...</NoMoviesText>
            ) : (
              <SimilarMoviesScroll>
                {similarMovies.map((similarMovie) => (
                  <SimilarMovieCard 
                    key={similarMovie.show_id}
                    onClick={() => handleSimilarMovieClick(similarMovie)}
                  >
                    <SimilarMoviePoster>
                      {similarMovie.posterUrl ? (
                        <PosterImage 
                          src={similarMovie.posterUrl} 
                          alt={similarMovie.title || 'Movie'} 
                          onError={(e) => {
                            e.currentTarget.onerror = null; // Prevent infinite loops
                            e.currentTarget.src = '/placeholder-poster.jpg'; // Use a placeholder image
                          }}
                        />
                      ) : (
                        <MoviePosterTitle>{similarMovie.title || 'Untitled'}</MoviePosterTitle>
                      )}
                    </SimilarMoviePoster>
                    <SimilarMovieTitle>{similarMovie.title || 'Untitled'}</SimilarMovieTitle>
                  </SimilarMovieCard>
                ))}
              </SimilarMoviesScroll>
            )}
          </SimilarMoviesSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default MovieDetailsModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background-color: #181818;
  border-radius: 8px;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    color: #e50914;
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  background-color: #141414;
  border-bottom: 1px solid #333;
`;

const MovieTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  color: white;
`;

const MovieMeta = styled.div`
  color: #aaa;
  font-size: 0.9rem;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const MovieDetailsLayout = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 30px;
  }
`;

const PosterSection = styled.div`
  flex: 0 0 auto;
  margin-bottom: 20px;
  position: relative;
  
  @media (min-width: 768px) {
    width: 250px;
    margin-bottom: 0;
  }
`;

const MoviePoster = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const MoviePosterPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const MoviePosterTitle = styled.span`
  text-align: center;
  padding: 0 10px;
  font-size: 1rem;
`;

const InfoSection = styled.div`
  flex: 1;
`;

const InfoBlock = styled.div`
  margin-bottom: 20px;
`;

const InfoLabel = styled.div`
  font-weight: bold;
  color: #aaa;
  margin-bottom: 5px;
  font-size: 0.9rem;
`;

const InfoText = styled.div`
  color: white;
`;

const Description = styled.div`
  color: white;
  line-height: 1.5;
`;

const CastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 5px;
`;

const CastMember = styled.div`
  background-color: #333;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: white;
`;

interface RecommendationBadgeProps {
  $isCollaborative: boolean;
}

const RecommendationBadge = styled.div<RecommendationBadgeProps>`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => props.$isCollaborative ? 'rgba(229, 9, 20, 0.8)' : 'rgba(33, 150, 83, 0.8)'};
  color: white;
`;

const SimilarMoviesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ScrollIndicator = styled.div`
  display: flex;
  align-items: center;
  color: #aaa;
  font-size: 0.8rem;
`;

const ScrollIcon = styled.span`
  margin-right: 5px;
  font-size: 1rem;
`;

const ScrollText = styled.span`
  display: none;
  
  @media (min-width: 768px) {
    display: inline;
  }
`;

// Styled components for Similar Movies section
const SimilarMoviesSection = styled.div`
  margin-top: 30px;
  border-top: 1px solid #333;
  padding-top: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  margin: 0;
  color: white;
`;

// This is the missing component that was causing the error
const SimilarMoviesScroll = styled.div`
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px;
  margin: 0 -20px;
  padding: 0 20px;
  position: relative;
  
  /* Gradient on the right side to indicate more content */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 40px;
    background: linear-gradient(to right, rgba(24, 24, 24, 0), rgba(24, 24, 24, 1));
    pointer-events: none;
  }
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: #444 #222;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #222;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #444;
    border-radius: 6px;
  }
`;

const SimilarMovieCard = styled.div`
  flex: 0 0 auto;
  width: 150px;
  margin-right: 15px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const SimilarMoviePoster = styled.div`
  height: 225px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const PosterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SimilarMovieTitle = styled.div`
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingText = styled.div`
  color: #aaa;
  text-align: center;
  padding: 20px;
`;

const ErrorText = styled.div`
  color: #e50914;
  text-align: center;
  padding: 20px;
`;

const NoMoviesText = styled.div`
  color: #aaa;
  text-align: center;
  padding: 20px;
`;