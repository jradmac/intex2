import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import logo from '../images/CineNicheLogo.png';
import MovieList from '../components/MovieLIst';
import { logout } from '../components/AuthAPI';

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
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const token = localStorage.getItem('authToken');
  const userDataStr = localStorage.getItem('userData');

  useEffect(() => {
    try {
      const parsedUserData = JSON.parse(userDataStr || '');
      setUserData(parsedUserData);
    } catch (error) {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
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
            {userData && <WelcomeText>Welcome, {userData.firstName}!</WelcomeText>}
            <LogoutButton onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging Out...' : 'Logout'}
            </LogoutButton>
          </HeaderRight>
        </Header>

        <HeroSection>
          <HeroContent>
            <HeroTitle>Watch Patman Now</HeroTitle>
            <HeroDescription>
              Forever alone in a crowd, failed comedian Arthur Fleck seeks connection as he walks the streets of Gotham City...
            </HeroDescription>
            <PlayButton>Play</PlayButton>
          </HeroContent>
        </HeroSection>

        <Section>
          <SectionHeader>
            <SectionTitle>Featured Movies</SectionTitle>
          </SectionHeader>
          <MovieList />
        </Section>

        <Footer>
          &copy; {new Date().getFullYear()} CineNiche. All rights reserved.
        </Footer>
      </PageWrapper>
    </>
  );
};

export default HomePage;

// ==================== Styled Components ====================

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
  background-color: #141414;
  width: 100vw;
  box-sizing: border-box;
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

  &:hover {
    background: #b20710;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HeroSection = styled.section`
  background-image: url('https://wallpaperaccess.com/full/329583.jpg');
  background-size: cover;
  background-position: center;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 60px;
  width: 100vw;
  box-sizing: border-box;
`;

const HeroContent = styled.div`
  max-width: 600px;
`;

const HeroTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: 20px;
  color: white;
`;

const HeroDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.5;
  color: white;
`;

const PlayButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: black;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #e5e5e5;
  }
`;

const Section = styled.section`
  padding: 40px 60px;
  background-color: #141414;
  color: #fff;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  background-color: #141414;
  color: #fff;
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

  @media (max-width: 600px) {
    height: 30px;
  }
`;
