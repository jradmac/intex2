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
