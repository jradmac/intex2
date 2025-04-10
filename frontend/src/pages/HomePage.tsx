// File: /frontend/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import logo from '../images/CineNicheLogo.png';
import { logout } from '../components/AuthAPI';
import { fetchAllRecommendations, MovieRecommendation } from '../api/RecommendationAPI';
import RecommendationCategory from '../components/RecommendationCategory';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import SearchOverlay from '../components/SearchOverly';

interface UserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  age?: number;
  gender?: string;
  phone?: string;
  profileCompleted?: boolean;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recommendations, setRecommendations] = useState<Record<string, MovieRecommendation[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [collaborativeRecs, setCollaborativeRecs] = useState<MovieRecommendation[]>([]);
  const [contentBasedRecs, setContentBasedRecs] = useState<Record<string, MovieRecommendation[]>>({});

  const token = localStorage.getItem('authToken');
  const userDataStr = localStorage.getItem('userData');

  useEffect(() => {
    if (!token || !userDataStr) {
      navigate('/login');
      return;
    }
    try {
      const parsedUserData = JSON.parse(userDataStr);
      setUserData(parsedUserData);
    } catch (error) {
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate, token, userDataStr]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const data = await fetchAllRecommendations(10);
        setRecommendations(data);

        if (data["For You"]) {
          setCollaborativeRecs(data["For You"]);
        }

        const contentBased: Record<string, MovieRecommendation[]> = {};
        Object.keys(data).forEach(category => {
          if (category !== "For You") {
            contentBased[category] = data[category];
          }
        });
        setContentBasedRecs(contentBased);
        setError(null);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) return <LoadingScreen>Loading...</LoadingScreen>;

  if (!token || !userDataStr) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <Header>
          <LogoImg src={logo} alt="CineNiche Logo" onClick={() => navigate('/home')} />
          <HeaderRight>
            <SearchButton onClick={() => setShowSearchOverlay(true)}>Search</SearchButton>
            {userData && <WelcomeText>Welcome, {userData.firstName}!</WelcomeText>}
            <LogoutButton onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging Out...' : 'Logout'}
            </LogoutButton>
          </HeaderRight>
        </Header>

        <HeroSection>
          <HeroContent>
            <HeroTitle>Personalized Movie Recommendations</HeroTitle>
            <HeroDescription>
              Discover your next favorite films based on your preferences and similar viewers.
            </HeroDescription>
          </HeroContent>
        </HeroSection>

        <MainContent>
          {error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <>
              <RecommendationWrapper>
                <SectionTitle>Collaborative Filtering Recommendations</SectionTitle>
                {collaborativeRecs.length > 0 ? (
                  <RecommendationBox>
                    <RecommendationDescription>
                      Personalized recommendations based on your demographic profile
                    </RecommendationDescription>
                    <RecommendationCategory title="For You" recommendations={collaborativeRecs} loading={false} />
                  </RecommendationBox>
                ) : (
                  <RecommendationBox>
                    <div style={{ textAlign: 'center' }}>
                      <EmptyStateText>
                        No personalized recommendations found. This could be due to:
                      </EmptyStateText>
                      <EmptyStateList>
                        <EmptyStateListItem>Your profile needs age and gender information</EmptyStateListItem>
                        <EmptyStateListItem>No recommendations match your demographic profile</EmptyStateListItem>
                        <EmptyStateListItem>Demographic data format mismatch</EmptyStateListItem>
                      </EmptyStateList>
                      <PlayButton onClick={() => navigate('/profile')}>Update Profile</PlayButton>
                    </div>
                  </RecommendationBox>
                )}
              </RecommendationWrapper>

              <RecommendationWrapper>
                <SectionTitle>Content-Based Recommendations</SectionTitle>
                {Object.keys(contentBasedRecs).length > 0 ? (
                  <RecommendationBox>
                    <RecommendationDescription>
                      Recommendations based on genres and content categories
                    </RecommendationDescription>
                    <div style={{ marginTop: '20px' }}>
                      {Object.keys(contentBasedRecs).map(category => (
                        <div key={category} style={{ marginBottom: '40px' }}>
                          <RecommendationCategory title={category} recommendations={contentBasedRecs[category]} loading={false} />
                        </div>
                      ))}
                    </div>
                  </RecommendationBox>
                ) : (
                  <RecommendationBox>
                    <div style={{ textAlign: 'center' }}>
                      <EmptyStateText>No content-based recommendations found.</EmptyStateText>
                    </div>
                  </RecommendationBox>
                )}
              </RecommendationWrapper>
            </>
          )}

          {!loading && Object.keys(recommendations).length === 0 && (
            <EmptyStateContainer>
              <EmptyStateText>
                No recommendations of any kind found. The recommendation service might be unavailable.
              </EmptyStateText>
              <PlayButton onClick={() => navigate('/profile')}>Update Profile</PlayButton>
            </EmptyStateContainer>
          )}
        </MainContent>

        <Footer>
          &copy; {new Date().getFullYear()} CineNiche. All rights reserved.{' '}
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
        </Footer>

      </PageWrapper>

      {showSearchOverlay && <SearchOverlay onClose={() => setShowSearchOverlay(false)} />}
    </>
  );
};

export default HomePage;

// ---------- Styled Components ----------
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    font-family: 'Helvetica Neue', sans-serif;
    background-color: #141414;
    color: #fff;
  }
  ::-webkit-scrollbar { width: 0px; background: transparent; }
  * { scrollbar-width: none; }
  body { -ms-overflow-style: none; }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #141414;
  color: #fff;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const WelcomeText = styled.span`
  font-size: 1rem;
`;

const LogoutButton = styled.button`
  background: #e50914;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #b20710; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SearchButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover { background: #333; }
`;

const HeroSection = styled.section`
  background-image: url('https://wallpaperaccess.com/full/329583.jpg');
  background-size: cover;
  background-position: center;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60px;
  width: 100%;
  box-sizing: border-box;
`;

const HeroContent = styled.div`
  max-width: 600px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 30px;
  border-radius: 8px;
  backdrop-filter: blur(3px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
`;

const HeroTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: 20px;
  color: white;
`;

const HeroDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 20px;
`;

const PlayButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: black;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:hover { background: #e5e5e5; }
`;

const MainContent = styled.main`
  padding: 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e50914;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  background-color: #141414;
  margin-top: auto;
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: black;
  color: white;
  font-size: 1.5rem;
`;

const LogoImg = styled.img`
  height: 40px;
  width: auto;
  cursor: pointer;
  @media (max-width: 600px) { height: 30px; }
`;

const RecommendationWrapper = styled.div`
  margin-bottom: 60px;
`;

const RecommendationBox = styled.div`
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  margin-top: 10px;
`;

const RecommendationDescription = styled.p`
  color: #ccc;
  margin-bottom: 20px;
  font-size: 1.1rem;
`;

const EmptyStateContainer = styled.div`
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-top: 20px;
`;

const EmptyStateText = styled.p`
  color: #ccc;
  margin-bottom: 20px;
  font-size: 1.1rem;
`;

const EmptyStateList = styled.ul`
  text-align: left;
  max-width: 500px;
  margin: 0 auto 20px auto;
  padding-left: 20px;
`;

const EmptyStateListItem = styled.li`
  color: #aaa;
  margin-bottom: 8px;
`;

const ErrorMessage = styled.div`
  background-color: rgba(229, 9, 20, 0.2);
  color: #f88;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
`;
const FooterLink = styled(Link)`
  margin-left: 16px;
  color: #888;
  font-size: 0.9rem;
  text-decoration: underline;
  &:hover {
    color: #fff;
  }
`;
