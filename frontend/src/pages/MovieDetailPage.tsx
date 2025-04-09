import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../api/MovieAPI';
import { Movie } from '../types/Movie';
import styled from 'styled-components';

const MovieDetailPage: React.FC = () => {
  const { show_id } = useParams<{ show_id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (show_id) {
      getMovieById(show_id)
        .then((data) => {
          setMovie(data);
          const fakeMovies: Movie[] = Array.from({ length: 10 }, (_, i) => ({
            show_id: `fake-${i}`,
            title: `Similar Movie ${i + 1}`,
            rating: "PG-13",
            release_year: 2023 - i,
            duration: "120 min",
            description: "A description of a similar movie",
            director: "Director Name",
            genres: "Action, Adventure",
            cast: "Actor 1, Actor 2",
            type: "Movie",
            posterUrl: undefined  // Add this line
          }));
          setRecommendations(fakeMovies);
        })
        .catch(console.error);
    }
  }, [show_id]);

  const scroll = (direction: number) => {
    if (sliderRef.current) {
      const scrollAmount = 180;
      sliderRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movie) return <Loading>Loading...</Loading>;

  return (
    <Page>
      <BackButton onClick={() => navigate(-1)}>← Back</BackButton>
      <ContentWrapper>
        <PosterPlaceholder />
        <InfoSection>
          <Title>{movie.title}</Title>
          <Meta>
            {movie.release_year} • {movie.rating} • {movie.duration}
          </Meta>
          {movie.director && (
            <Director>Directed by <strong>{movie.director}</strong></Director>
          )}
          <Genres>{movie.genres}</Genres>
          <Description>{movie.description}</Description>
        </InfoSection>
      </ContentWrapper>

      <RecommendationSection>
        <SectionTitle>You May Also Like</SectionTitle>
        <ScrollWrapper>
          <ScrollButtonLeft onClick={() => scroll(-1)}>‹</ScrollButtonLeft>
          <RecommendationSlider ref={sliderRef}>
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.show_id}
                onClick={() => navigate(`/movies/${rec.show_id}`)}
              >
                <PosterStub />
                <PlaceholderText>{rec.title}</PlaceholderText>
              </RecommendationCard>
            ))}
          </RecommendationSlider>
          <ScrollButtonRight onClick={() => scroll(1)}>›</ScrollButtonRight>
        </ScrollWrapper>
      </RecommendationSection>
    </Page>
  );
};

export default MovieDetailPage;

const Page = styled.div`
  padding: 40px 60px;
  background-color: #141414;
  color: white;
  min-height: 100vh;
`;

const BackButton = styled.button`
  margin-bottom: 30px;
  background: transparent;
  border: none;
  color: #e5e5e5;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 40px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PosterPlaceholder = styled.div`
  width: 300px;
  height: 450px;
  background-color: #333;
  border-radius: 8px;
  flex-shrink: 0;
`;

const InfoSection = styled.div`
  max-width: 700px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
`;

const Meta = styled.p`
  font-size: 1rem;
  color: #aaa;
  margin-bottom: 10px;
`;

const Director = styled.p`
  font-size: 1rem;
  color: #ccc;
  margin-bottom: 10px;
`;

const Genres = styled.p`
  font-size: 0.95rem;
  color: #bbb;
  margin-bottom: 20px;
  font-style: italic;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #ddd;
`;

const Loading = styled.p`
  color: white;
  padding: 4rem;
  text-align: center;
`;

const RecommendationSection = styled.div`
  margin-top: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
`;

const ScrollWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const RecommendationSlider = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 0;
  scroll-behavior: smooth;
  max-width: 100%;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
`;

const RecommendationCard = styled.div`
  flex: 0 0 auto;
  width: 160px;
  background: #222;
  border-radius: 6px;
  overflow: hidden;
  text-align: center;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: #333;
  }
`;

const PosterStub = styled.div`
  width: 100%;
  height: 240px;
  background: #333;
  margin-bottom: 10px;
`;

const PlaceholderText = styled.p`
  font-size: 0.9rem;
  color: #aaa;
`;

const ScrollButtonLeft = styled.button`
  position: absolute;
  left: -20px;
  z-index: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 10px;

  &:hover {
    color: #e50914;
  }
`;

const ScrollButtonRight = styled(ScrollButtonLeft)`
  left: auto;
  right: -20px;
`;
