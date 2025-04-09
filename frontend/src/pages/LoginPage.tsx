import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import bgImage from '../images/WelcomePageBanner.png'; // adjust path as needed
import logo from '../images/CineNicheLogo.png';

const API_BASE_URL = 'http://localhost:5000/api';

const isValidPassword = (password: string): boolean => {
  return password.length >= 10;
};

// GLOBAL STYLES TO RESET SCROLL/GAPS
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidPassword(password)) {
      setError('Password must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('authToken', response.data.token);

      const userData = {
        userId: response.data.userId,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role || 'User',
        age: response.data.age,
        gender: response.data.gender,
        phone: response.data.phone,
        profileCompleted: true,
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      navigate('/home');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to login. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to your Stytch OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/oauth/google`;
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundWrapper>
        <Overlay />
        <LogoWrapper onClick={() => navigate('/')}>
          <LogoImg src={logo} alt="CineNiche Logo" />
        </LogoWrapper>
        <FormWrapper onSubmit={handleLogin} method="POST">
          <Title>Sign In</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (min. 10 characters)"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            required
          />
          <Button disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <OrSeparator>
            <Line />
            <OrText>OR</OrText>
            <Line />
          </OrSeparator>
          
          <OAuthButton type="button" onClick={handleGoogleLogin}>
            <GoogleIconSVG viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </GoogleIconSVG>
            Sign in with Google
          </OAuthButton>
          
          <Text>
            New to CineNiche?{' '}
            <LinkText onClick={() => navigate('/register')}>
              Sign up now.
            </LinkText>
          </Text>
          <CaptchaText>
            This page is protected by Google reCAPTCHA to ensure you're not a bot.
          </CaptchaText>
        </FormWrapper>
      </BackgroundWrapper>
    </>
  );
};

export default LoginPage;

/* --- Styled Components --- */

const BackgroundWrapper = styled.div`
  background-image: url(${bgImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1;
`;

const FormWrapper = styled.form`
  position: relative;
  z-index: 2;
  background-color: #f3ede5;
  padding: 60px 68px 40px;
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
`;

const Title = styled.h1`
  color: #000;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 28px;
`;

const Input = styled.input`
  background: #333;
  border-radius: 4px;
  border: 0;
  color: #fff;
  height: 50px;
  line-height: 50px;
  padding: 5px 20px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: #63b3d3; /* CineNiche blue */
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  padding: 16px;
  border: 0;
  color: white;
  cursor: pointer;
  margin-bottom: 12px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #519abb; /* slightly darker blue on hover */
  }
`;

const OrSeparator = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
`;

const Line = styled.div`
  flex-grow: 1;
  height: 1px;
  background-color: #8c8c8c;
`;

const OrText = styled.span`
  color: #8c8c8c;
  padding: 0 10px;
  font-size: 14px;
`;

const OAuthButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  padding: 12px;
  margin-bottom: 16px;
  color: #333;
  cursor: pointer;

  &:hover {
    background-color: #f7f7f7;
  }
`;

const GoogleIconSVG = styled.svg`
  width: 18px;
  height: 18px;
  margin-right: 10px;
`;

const Text = styled.p`
  color: #8c8c8c;
  font-size: 16px;
  font-weight: 500;
`;

const LinkText = styled.span`
  color: #63b3d3;
  cursor: pointer;
  margin-left: 5px;
  text-decoration: underline;

  &:hover {
    color: #519abb; /* optional darker hover tone */
  }
`;

const CaptchaText = styled.p`
  color: #8c8c8c;
  font-size: 13px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background-color: #e50914;
  color: white;
  padding: 12px;
  font-size: 14px;
  margin-bottom: 16px;
  border-radius: 4px;
`;

const LogoWrapper = styled.div`
  position: absolute;
  top: 20px;
  left: 30px;
  z-index: 3;

  @media (max-width: 600px) {
    left: 16px;
    top: 16px;
  }

  cursor: pointer;
`;

const LogoImg = styled.img`
  width: 150px;
  height: auto;

  @media (max-width: 600px) {
    width: 100px;
  }
`;