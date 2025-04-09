// File: /frontend/src/components/MovieDetailsModal.tsx
import React from 'react';
import styled from 'styled-components';
import { MovieRecommendation } from '../api/RecommendationAPI';

interface MovieDetailsModalProps {
  movie: MovieRecommendation | null;
  onClose: () => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, onClose }) => {
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
                <MoviePoster src={posterUrl} alt={`${movie.title} poster`} />
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